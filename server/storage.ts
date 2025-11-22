import { type User, type UpsertUser, type Survey, type InsertSurvey, users, surveys, surveyResponses, surveyRespondents, type SurveyResponse, type SurveyRespondent, type InsertSurveyRespondent } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private surveys: Map<string, Survey>;
  private responses: Map<string, SurveyResponse>;
  private respondents: Map<string, SurveyRespondent>;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.responses = new Map();
    this.respondents = new Map();
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
}

export class DbStorage implements IStorage {
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
    const result = await db.select({ count: sql<number>`cast(count(*) as integer)` })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId));
    return result[0]?.count ?? 0;
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
}

export const storage = new DbStorage();
