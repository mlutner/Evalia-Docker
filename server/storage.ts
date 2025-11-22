import { type User, type UpsertUser, type Survey, type InsertSurvey, users, surveys, surveyResponses, surveyRespondents, type SurveyResponse, type SurveyRespondent, type InsertSurveyRespondent, aiUsageLog, type AIUsageRecord, adminAISettings } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql, gte } from "drizzle-orm";

export interface AdminAISettings {
  apiKeys: Record<string, { key: string; rotated?: string | null }>;
  models: Record<string, string>;
  baseUrls: Record<string, string>;
  parameters: Record<string, Record<string, any>>;
}

export interface IStorage {
  // User operations (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Survey operations
  getSurvey(id: string): Promise<Survey | undefined>;
  getAllSurveys(userId: string): Promise<Survey[]>;
  createSurvey(survey: InsertSurvey, userId: string): Promise<Survey>;
  updateSurvey(id: string, survey: Partial<InsertSurvey>): Promise<Survey | undefined>;
  deleteSurvey(id: string): Promise<boolean>;
  checkSurveyOwnership(surveyId: string, userId: string): Promise<boolean>;
  duplicateSurvey(id: string, userId: string): Promise<Survey | undefined>;
  
  // Respondent operations
  createRespondent(surveyId: string, respondent: InsertSurveyRespondent): Promise<SurveyRespondent>;
  getRespondent(token: string): Promise<SurveyRespondent | undefined>;
  getRespondentsByEmail(surveyId: string, email: string): Promise<SurveyRespondent[]>;
  getAllRespondents(surveyId: string): Promise<SurveyRespondent[]>;
  markRespondentAsSubmitted(respondentId: string): Promise<boolean>;
  deleteRespondent(id: string): Promise<boolean>;

  // Response operations
  createResponse(surveyId: string, answers: Record<string, string | string[]>): Promise<SurveyResponse>;
  getResponses(surveyId: string): Promise<SurveyResponse[]>;
  getResponseCount(surveyId: string): Promise<number>;
  deleteResponse(id: string): Promise<boolean>;
  deleteResponsesBulk(ids: string[]): Promise<number>;
  searchResponses(surveyId: string, searchTerm: string): Promise<SurveyResponse[]>;
  detectDuplicates(surveyId: string): Promise<SurveyResponse[][]>;
  
  // AI usage tracking
  logAIUsage(usage: Omit<AIUsageRecord, 'id' | 'createdAt'>): Promise<AIUsageRecord>;
  getAIUsageStats(): Promise<{ total: AIUsageRecord[]; last24h: AIUsageRecord[] }>;
  
  // Admin AI settings
  getAdminAISettings(): Promise<AdminAISettings>;
  updateAdminAISettings(settings: Partial<AdminAISettings>): Promise<AdminAISettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private surveys: Map<string, Survey>;
  private responses: Map<string, SurveyResponse>;
  private respondents: Map<string, SurveyRespondent>;
  private adminAISettings: AdminAISettings;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.responses = new Map();
    this.respondents = new Map();
    
    // Initialize admin settings from env vars
    this.adminAISettings = {
      apiKeys: {
        survey_generation: { key: process.env.API_KEY_SURVEY_GENERATION || "", rotated: null },
        survey_refinement: { key: process.env.API_KEY_SURVEY_REFINEMENT || "", rotated: null },
        document_parsing: { key: process.env.API_KEY_DOCUMENT_PARSING || "", rotated: null },
        response_scoring: { key: process.env.API_KEY_RESPONSE_SCORING || "", rotated: null },
        quick_suggestions: { key: process.env.API_KEY_QUICK_SUGGESTIONS || "", rotated: null },
        response_analysis: { key: process.env.API_KEY_RESPONSE_ANALYSIS || "", rotated: null },
      },
      models: {
        survey_generation: process.env.MODEL_SURVEY_GENERATION || "gpt-4o",
        survey_refinement: process.env.MODEL_SURVEY_REFINEMENT || "gpt-4o",
        document_parsing: process.env.MODEL_DOCUMENT_PARSING || "gpt-4-vision",
        response_scoring: process.env.MODEL_RESPONSE_SCORING || "gpt-3.5-turbo",
        quick_suggestions: process.env.MODEL_QUICK_SUGGESTIONS || "gpt-3.5-turbo",
        response_analysis: process.env.MODEL_RESPONSE_ANALYSIS || "gpt-4o",
      },
      baseUrls: {
        survey_generation: "https://api.openai.com/v1",
        survey_refinement: "https://api.openai.com/v1",
        document_parsing: "https://api.openai.com/v1",
        response_scoring: "https://api.openai.com/v1",
        quick_suggestions: "https://api.openai.com/v1",
        response_analysis: "https://api.openai.com/v1",
      },
      parameters: {
        survey_generation: { temperature: 0.7, max_tokens: 4096 },
        survey_refinement: { temperature: 0.7, max_tokens: 4096 },
        document_parsing: { temperature: 0.0, max_tokens: 8192 },
        response_scoring: { temperature: 0.0, max_tokens: 2048 },
        quick_suggestions: { temperature: 0.8, max_tokens: 1024 },
        response_analysis: { temperature: 0.5, max_tokens: 4096 },
      }
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const existingUser = this.users.get(userData.id!);
    
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      resendApiKey: userData.resendApiKey || null,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updated);
    return updated;
  }

  async getSurvey(id: string): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async getAllSurveys(userId: string): Promise<Survey[]> {
    return Array.from(this.surveys.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createSurvey(insertSurvey: InsertSurvey, userId: string): Promise<Survey> {
    const id = randomUUID();
    const now = new Date();
    const survey: Survey = {
      id,
      userId,
      ...insertSurvey,
      description: insertSurvey.description ?? null,
      welcomeMessage: insertSurvey.welcomeMessage ?? null,
      thankYouMessage: insertSurvey.thankYouMessage ?? null,
      illustrationUrl: insertSurvey.illustrationUrl ?? null,
      trainerName: insertSurvey.trainerName ?? null,
      trainingDate: insertSurvey.trainingDate ?? null,
      tags: insertSurvey.tags ?? [],
      isAnonymous: insertSurvey.isAnonymous ?? false,
      webhookUrl: insertSurvey.webhookUrl ?? null,
      status: insertSurvey.status ?? "Active",
      publishedAt: insertSurvey.publishedAt ?? null,
      scoreConfig: insertSurvey.scoreConfig ?? undefined,
      createdAt: now,
      updatedAt: now,
    };
    this.surveys.set(id, survey);
    return survey;
  }

  async checkSurveyOwnership(surveyId: string, userId: string): Promise<boolean> {
    const survey = this.surveys.get(surveyId);
    return survey?.userId === userId;
  }

  async updateSurvey(id: string, updates: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const survey = this.surveys.get(id);
    if (!survey) return undefined;

    const updatedSurvey: Survey = {
      ...survey,
      title: updates.title ?? survey.title,
      description: updates.description ?? survey.description,
      questions: updates.questions ?? survey.questions,
      welcomeMessage: updates.welcomeMessage ?? survey.welcomeMessage,
      thankYouMessage: updates.thankYouMessage ?? survey.thankYouMessage,
      illustrationUrl: updates.illustrationUrl ?? survey.illustrationUrl,
      trainerName: updates.trainerName ?? survey.trainerName,
      trainingDate: updates.trainingDate ?? survey.trainingDate,
      tags: updates.tags ?? survey.tags,
      isAnonymous: updates.isAnonymous ?? survey.isAnonymous,
      webhookUrl: updates.webhookUrl ?? survey.webhookUrl,
      status: updates.status ?? survey.status,
      publishedAt: updates.publishedAt ?? survey.publishedAt,
      scoreConfig: updates.scoreConfig ?? survey.scoreConfig,
      updatedAt: new Date(),
    };
    this.surveys.set(id, updatedSurvey);
    return updatedSurvey;
  }

  async deleteSurvey(id: string): Promise<boolean> {
    return this.surveys.delete(id);
  }

  async duplicateSurvey(id: string, userId: string): Promise<Survey | undefined> {
    const survey = this.surveys.get(id);
    if (!survey) return undefined;
    const newSurvey: Survey = {
      ...survey,
      id: randomUUID(),
      title: `${survey.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.surveys.set(newSurvey.id, newSurvey);
    return newSurvey;
  }

  async createResponse(surveyId: string, answers: Record<string, string | string[]>): Promise<SurveyResponse> {
    const now = new Date();
    const response: SurveyResponse = {
      id: randomUUID(),
      surveyId,
      answers,
      startedAt: now,
      completedAt: now,
    };
    this.responses.set(response.id, response);
    return response;
  }

  async getResponses(surveyId: string): Promise<SurveyResponse[]> {
    return Array.from(this.responses.values())
      .filter(r => r.surveyId === surveyId)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async getResponseCount(surveyId: string): Promise<number> {
    return Array.from(this.responses.values()).filter(r => r.surveyId === surveyId).length;
  }

  async deleteResponse(id: string): Promise<boolean> {
    return this.responses.delete(id);
  }

  async deleteResponsesBulk(ids: string[]): Promise<number> {
    let deleted = 0;
    ids.forEach(id => {
      if (this.responses.delete(id)) deleted++;
    });
    return deleted;
  }

  async searchResponses(surveyId: string, searchTerm: string): Promise<SurveyResponse[]> {
    const term = searchTerm.toLowerCase();
    return Array.from(this.responses.values())
      .filter(r => r.surveyId === surveyId && 
        JSON.stringify(r.answers).toLowerCase().includes(term))
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async detectDuplicates(surveyId: string): Promise<SurveyResponse[][]> {
    const responses = await this.getResponses(surveyId);
    const answerMap = new Map<string, SurveyResponse[]>();
    
    responses.forEach(r => {
      const key = JSON.stringify(r.answers);
      if (!answerMap.has(key)) answerMap.set(key, []);
      answerMap.get(key)!.push(r);
    });
    
    return Array.from(answerMap.values()).filter(group => group.length > 1);
  }

  async createRespondent(surveyId: string, respondent: InsertSurveyRespondent): Promise<SurveyRespondent> {
    const id = randomUUID();
    const token = randomUUID();
    const surveyRespondent: SurveyRespondent = {
      id,
      surveyId,
      email: respondent.email || null,
      name: respondent.name || null,
      respondentToken: token,
      invitedAt: new Date(),
      submittedAt: null,
    };
    this.respondents.set(id, surveyRespondent);
    return surveyRespondent;
  }

  async getRespondent(token: string): Promise<SurveyRespondent | undefined> {
    return Array.from(this.respondents.values()).find(r => r.respondentToken === token);
  }

  async getRespondentsByEmail(surveyId: string, email: string): Promise<SurveyRespondent[]> {
    return Array.from(this.respondents.values()).filter(r => r.surveyId === surveyId && r.email === email);
  }

  async getAllRespondents(surveyId: string): Promise<SurveyRespondent[]> {
    return Array.from(this.respondents.values())
      .filter(r => r.surveyId === surveyId)
      .sort((a, b) => b.invitedAt.getTime() - a.invitedAt.getTime());
  }

  async markRespondentAsSubmitted(respondentId: string): Promise<boolean> {
    const respondent = this.respondents.get(respondentId);
    if (!respondent) return false;
    respondent.submittedAt = new Date();
    this.respondents.set(respondentId, respondent);
    return true;
  }

  async deleteRespondent(id: string): Promise<boolean> {
    return this.respondents.delete(id);
  }

  async logAIUsage(usage: Omit<AIUsageRecord, 'id' | 'createdAt'>): Promise<AIUsageRecord> {
    // Stub for memory storage - doesn't persist
    return {
      id: randomUUID(),
      ...usage,
      createdAt: new Date(),
    };
  }

  async getAIUsageStats(): Promise<{ total: AIUsageRecord[]; last24h: AIUsageRecord[] }> {
    return { total: [], last24h: [] };
  }
}

export class DbStorage implements IStorage {
  // Simple response count cache with 30-second TTL
  private responseCountCache = new Map<string, { count: number; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds
  private adminAISettings: AdminAISettings;

  constructor() {
    // Initialize admin settings from env vars (will be overridden by DB on first call)
    this.adminAISettings = {
      apiKeys: {
        survey_generation: { key: process.env.API_KEY_SURVEY_GENERATION || "", rotated: null },
        survey_refinement: { key: process.env.API_KEY_SURVEY_REFINEMENT || "", rotated: null },
        document_parsing: { key: process.env.API_KEY_DOCUMENT_PARSING || "", rotated: null },
        response_scoring: { key: process.env.API_KEY_RESPONSE_SCORING || "", rotated: null },
        quick_suggestions: { key: process.env.API_KEY_QUICK_SUGGESTIONS || "", rotated: null },
        response_analysis: { key: process.env.API_KEY_RESPONSE_ANALYSIS || "", rotated: null },
      },
      models: {
        survey_generation: process.env.MODEL_SURVEY_GENERATION || "openrouter/auto",
        survey_refinement: process.env.MODEL_SURVEY_REFINEMENT || "gpt-4o",
        document_parsing: process.env.MODEL_DOCUMENT_PARSING || "gpt-4-vision",
        response_scoring: process.env.MODEL_RESPONSE_SCORING || "gpt-3.5-turbo",
        quick_suggestions: process.env.MODEL_QUICK_SUGGESTIONS || "gpt-3.5-turbo",
        response_analysis: process.env.MODEL_RESPONSE_ANALYSIS || "gpt-4o",
      },
      baseUrls: {
        survey_generation: "https://openrouter.ai/api/v1",
        survey_refinement: "https://api.openai.com/v1",
        document_parsing: "https://api.openai.com/v1",
        response_scoring: "https://api.openai.com/v1",
        quick_suggestions: "https://api.openai.com/v1",
        response_analysis: "https://api.openai.com/v1",
      },
      parameters: {
        survey_generation: { temperature: 0.7, max_tokens: 4096 },
        survey_refinement: { temperature: 0.7, max_tokens: 4096 },
        document_parsing: { temperature: 0.0, max_tokens: 8192 },
        response_scoring: { temperature: 0.0, max_tokens: 2048 },
        quick_suggestions: { temperature: 0.8, max_tokens: 1024 },
        response_analysis: { temperature: 0.5, max_tokens: 4096 },
      }
    };
    this.initializeAdminSettings();
  }

  private async initializeAdminSettings() {
    try {
      const result = await db.select().from(adminAISettings).limit(1);
      if (result[0]) {
        this.adminAISettings = {
          apiKeys: result[0].apiKeys as any,
          models: result[0].models as any,
          baseUrls: result[0].baseUrls as any,
          parameters: result[0].parameters as any,
        };
      }
    } catch (error) {
      console.warn("Could not load admin settings from DB, using defaults");
    }
  }

  private getResponseCountCached(surveyId: string): { count: number; timestamp: number } | undefined {
    const cached = this.responseCountCache.get(surveyId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached;
    }
    this.responseCountCache.delete(surveyId);
    return undefined;
  }

  private setResponseCountCache(surveyId: string, count: number): void {
    this.responseCountCache.set(surveyId, { count, timestamp: Date.now() });
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getSurvey(id: string): Promise<Survey | undefined> {
    const result = await db.select().from(surveys).where(eq(surveys.id, id)).limit(1);
    return result[0];
  }

  async getAllSurveys(userId: string): Promise<Survey[]> {
    return db.select()
      .from(surveys)
      .where(eq(surveys.userId, userId))
      .orderBy(sql`${surveys.createdAt} DESC`);
  }

  async createSurvey(insertSurvey: InsertSurvey, userId: string): Promise<Survey> {
    const result = await db.insert(surveys).values({
      ...insertSurvey,
      userId,
    }).returning();
    return result[0];
  }

  async checkSurveyOwnership(surveyId: string, userId: string): Promise<boolean> {
    const result = await db.select({ userId: surveys.userId })
      .from(surveys)
      .where(eq(surveys.id, surveyId))
      .limit(1);
    return result[0]?.userId === userId;
  }

  async updateSurvey(id: string, updates: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const result = await db.update(surveys)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(surveys.id, id))
      .returning();
    return result[0];
  }

  async deleteSurvey(id: string): Promise<boolean> {
    // Delete all responses associated with the survey first (to avoid foreign key constraint)
    await db.delete(surveyResponses).where(eq(surveyResponses.surveyId, id));
    
    // Then delete the survey
    const result = await db.delete(surveys).where(eq(surveys.id, id)).returning();
    return result.length > 0;
  }

  async duplicateSurvey(id: string, userId: string): Promise<Survey | undefined> {
    const survey = await this.getSurvey(id);
    if (!survey) return undefined;
    
    const newSurvey = await this.createSurvey(
      {
        title: `${survey.title} (Copy)`,
        description: survey.description,
        questions: survey.questions,
        welcomeMessage: survey.welcomeMessage,
        thankYouMessage: survey.thankYouMessage,
        illustrationUrl: survey.illustrationUrl,
        trainerName: survey.trainerName,
        trainingDate: survey.trainingDate,
        tags: survey.tags,
        isAnonymous: survey.isAnonymous,
        webhookUrl: survey.webhookUrl,
        status: survey.status,
        publishedAt: null,
        scoreConfig: survey.scoreConfig,
      },
      userId
    );
    
    return newSurvey;
  }

  async createResponse(surveyId: string, answers: Record<string, string | string[]>): Promise<SurveyResponse> {
    const result = await db.insert(surveyResponses).values({
      surveyId,
      answers,
    }).returning();
    return result[0];
  }

  async getResponses(surveyId: string): Promise<SurveyResponse[]> {
    return db.select()
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId))
      .orderBy(sql`${surveyResponses.completedAt} DESC`);
  }

  async getResponseCount(surveyId: string): Promise<number> {
    // Check cache first
    const cached = this.getResponseCountCached(surveyId);
    if (cached) {
      return cached.count;
    }

    // Query database if not cached
    const result = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId));
    const count = result[0]?.count ?? 0;
    
    // Cache the result
    this.setResponseCountCache(surveyId, count);
    return count;
  }

  async deleteResponse(id: string): Promise<boolean> {
    const result = await db.delete(surveyResponses).where(eq(surveyResponses.id, id)).returning();
    return result.length > 0;
  }

  async deleteResponsesBulk(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await db.delete(surveyResponses).where(sql`${surveyResponses.id} IN (${sql.join(ids)})`).returning();
    return result.length;
  }

  async searchResponses(surveyId: string, searchTerm: string): Promise<SurveyResponse[]> {
    const term = `%${searchTerm}%`;
    return db.select()
      .from(surveyResponses)
      .where(sql`${surveyResponses.surveyId} = ${surveyId} AND ${surveyResponses.answers}::text ILIKE ${term}`)
      .orderBy(sql`${surveyResponses.completedAt} DESC`);
  }

  async detectDuplicates(surveyId: string): Promise<SurveyResponse[][]> {
    const responses = await this.getResponses(surveyId);
    const answerMap = new Map<string, SurveyResponse[]>();
    
    responses.forEach(r => {
      const key = JSON.stringify(r.answers);
      if (!answerMap.has(key)) answerMap.set(key, []);
      answerMap.get(key)!.push(r);
    });
    
    return Array.from(answerMap.values()).filter(group => group.length > 1);
  }

  async createRespondent(surveyId: string, respondent: InsertSurveyRespondent): Promise<SurveyRespondent> {
    const token = randomUUID();
    const result = await db.insert(surveyRespondents).values({
      surveyId,
      email: respondent.email,
      name: respondent.name,
      respondentToken: token,
    }).returning();
    return result[0];
  }

  async getRespondent(token: string): Promise<SurveyRespondent | undefined> {
    const result = await db.select().from(surveyRespondents).where(eq(surveyRespondents.respondentToken, token)).limit(1);
    return result[0];
  }

  async getRespondentsByEmail(surveyId: string, email: string): Promise<SurveyRespondent[]> {
    return db.select().from(surveyRespondents)
      .where(sql`${surveyRespondents.surveyId} = ${surveyId} AND ${surveyRespondents.email} = ${email}`);
  }

  async getAllRespondents(surveyId: string): Promise<SurveyRespondent[]> {
    return db.select().from(surveyRespondents)
      .where(eq(surveyRespondents.surveyId, surveyId))
      .orderBy(sql`${surveyRespondents.invitedAt} DESC`);
  }

  async getRespondentMetrics(surveyId: string): Promise<{ totalInvited: number; totalSubmitted: number }> {
    const result = await db.select({
      totalInvited: sql<number>`cast(count(*) as integer)`,
      totalSubmitted: sql<number>`cast(count(*) FILTER (WHERE ${surveyRespondents.submittedAt} IS NOT NULL) as integer)`,
    })
      .from(surveyRespondents)
      .where(eq(surveyRespondents.surveyId, surveyId));
    
    return result[0] || { totalInvited: 0, totalSubmitted: 0 };
  }

  async markRespondentAsSubmitted(respondentId: string): Promise<boolean> {
    const result = await db.update(surveyRespondents)
      .set({ submittedAt: new Date() })
      .where(eq(surveyRespondents.id, respondentId))
      .returning();
    return result.length > 0;
  }

  async deleteRespondent(id: string): Promise<boolean> {
    const result = await db.delete(surveyRespondents).where(eq(surveyRespondents.id, id)).returning();
    return result.length > 0;
  }

  async logAIUsage(usage: Omit<AIUsageRecord, 'id' | 'createdAt'>): Promise<AIUsageRecord> {
    const result = await db.insert(aiUsageLog).values(usage).returning();
    return result[0];
  }

  async getAIUsageStats(): Promise<{ total: AIUsageRecord[]; last24h: AIUsageRecord[] }> {
    const now = new Date();
    const last24hDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const total = await db.select().from(aiUsageLog);
    const last24h = await db.select().from(aiUsageLog).where(gte(aiUsageLog.createdAt, last24hDate));

    return { total, last24h };
  }

  async getAdminAISettings(): Promise<AdminAISettings> {
    return this.adminAISettings;
  }

  async updateAdminAISettings(settings: Partial<AdminAISettings>): Promise<AdminAISettings> {
    if (settings.apiKeys) {
      this.adminAISettings.apiKeys = { ...this.adminAISettings.apiKeys, ...settings.apiKeys };
    }
    if (settings.models) {
      this.adminAISettings.models = { ...this.adminAISettings.models, ...settings.models };
    }
    if (settings.baseUrls) {
      this.adminAISettings.baseUrls = { ...this.adminAISettings.baseUrls, ...settings.baseUrls };
    }
    if (settings.parameters) {
      this.adminAISettings.parameters = { ...this.adminAISettings.parameters, ...settings.parameters };
    }
    
    // Persist to database - make sure this completes before returning
    try {
      await db.insert(adminAISettings).values({
        id: 'admin',
        apiKeys: this.adminAISettings.apiKeys,
        models: this.adminAISettings.models,
        baseUrls: this.adminAISettings.baseUrls,
        parameters: this.adminAISettings.parameters,
      }).onConflictDoUpdate({
        target: adminAISettings.id,
        set: {
          apiKeys: this.adminAISettings.apiKeys,
          models: this.adminAISettings.models,
          baseUrls: this.adminAISettings.baseUrls,
          parameters: this.adminAISettings.parameters,
          updatedAt: new Date(),
        }
      });
      console.log("✓ Admin settings persisted to database");
    } catch (error) {
      console.error("⚠️ Failed to save admin settings to DB:", error);
      throw new Error(`Failed to persist settings: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    
    return this.adminAISettings;
  }
}

export const storage = new DbStorage();
