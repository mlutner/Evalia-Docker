import { type User, type UpsertUser, type Survey, type InsertSurvey, users, surveys, surveyResponses, surveyRespondents, type SurveyResponse, type SurveyRespondent, type InsertSurveyRespondent, templates, type Template, type InsertTemplate } from "@shared/schema";
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

  // Template operations
  getAllTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  saveAsTemplate(survey: Survey, title: string, description: string, category: string): Promise<Template>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private surveys: Map<string, Survey>;
  private responses: Map<string, SurveyResponse>;
  private respondents: Map<string, SurveyRespondent>;
  private templates: Map<string, Template>;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.responses = new Map();
    this.respondents = new Map();
    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const defaultTemplates: Template[] = [
      {
        id: "1",
        title: "Training Session Feedback",
        description: "Collect feedback on training effectiveness, content, and delivery",
        category: "Training Feedback",
        questions: [
          { id: "q1", type: "rating", question: "How relevant was the training content to your role?", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "How effective was the trainer?", ratingScale: 5, required: true },
          { id: "q3", type: "textarea", question: "What were the most valuable takeaways?", required: false },
          { id: "q4", type: "textarea", question: "What could be improved?", required: false }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "2",
        title: "Employee Satisfaction Survey",
        description: "Measure employee engagement and workplace satisfaction",
        category: "Satisfaction",
        questions: [
          { id: "q1", type: "rating", question: "How satisfied are you with your current role?", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "How well do you feel supported by your manager?", ratingScale: 5, required: true },
          { id: "q3", type: "rating", question: "How would you rate your work-life balance?", ratingScale: 5, required: true },
          { id: "q4", type: "multiple_choice", question: "What would most improve your work experience?", options: ["More flexibility", "Better tools", "Career development", "Other"], required: true }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "3",
        title: "Product Feedback Form",
        description: "Gather user feedback on product features and usability",
        category: "Product Feedback",
        questions: [
          { id: "q1", type: "rating", question: "How user-friendly is the product?", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "How well does the product meet your needs?", ratingScale: 5, required: true },
          { id: "q3", type: "checkbox", question: "Which features do you use most?", options: ["Feature A", "Feature B", "Feature C", "Feature D"], required: false },
          { id: "q4", type: "textarea", question: "What features would you like to see added?", required: false }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "4",
        title: "Course Completion Assessment",
        description: "Evaluate learner comprehension and course effectiveness",
        category: "Assessment",
        questions: [
          { id: "q1", type: "multiple_choice", question: "What was the main topic covered?", options: ["Option 1", "Option 2", "Option 3", "Option 4"], required: true },
          { id: "q2", type: "rating", question: "Rate your understanding of the material", ratingScale: 5, required: true },
          { id: "q3", type: "textarea", question: "How will you apply what you learned?", required: false }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "5",
        title: "Event Feedback Survey",
        description: "Collect feedback from event attendees",
        category: "Event Feedback",
        questions: [
          { id: "q1", type: "rating", question: "How would you rate the overall event?", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "How relevant was the content?", ratingScale: 5, required: true },
          { id: "q3", type: "rating", question: "How well was the event organized?", ratingScale: 5, required: true },
          { id: "q4", type: "textarea", question: "What topics would you like to see at future events?", required: false }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "6",
        title: "Customer Service Quality",
        description: "Measure customer satisfaction with support services",
        category: "Customer Service",
        questions: [
          { id: "q1", type: "rating", question: "How quickly was your issue resolved?", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "Was the support representative helpful?", ratingScale: 5, required: true },
          { id: "q3", type: "nps", question: "How likely are you to recommend us to others?", required: true },
          { id: "q4", type: "textarea", question: "Additional comments", required: false }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "7",
        title: "Website Usability Test",
        description: "Evaluate website user experience and navigation",
        category: "Usability",
        questions: [
          { id: "q1", type: "rating", question: "How easy was it to find what you needed?", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "How intuitive was the navigation?", ratingScale: 5, required: true },
          { id: "q3", type: "textarea", question: "What was confusing or difficult?", required: false }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "8",
        title: "Program Evaluation",
        description: "Comprehensive program assessment and impact measurement",
        category: "Program Evaluation",
        questions: [
          { id: "q1", type: "rating", question: "Did the program meet your expectations?", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "How applicable is the knowledge to your work?", ratingScale: 5, required: true },
          { id: "q3", type: "rating", question: "Would you recommend this program to others?", ratingScale: 5, required: true },
          { id: "q4", type: "textarea", question: "How will you apply what you learned?", required: false }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "9",
        title: "Onboarding Experience",
        description: "Assess new employee onboarding effectiveness",
        category: "Onboarding",
        questions: [
          { id: "q1", type: "rating", question: "How well were you prepared for your role?", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "How effective was the onboarding process?", ratingScale: 5, required: true },
          { id: "q3", type: "textarea", question: "What could improve the onboarding experience?", required: false }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
      {
        id: "10",
        title: "Skills Assessment",
        description: "Evaluate proficiency in key competencies",
        category: "Assessment",
        questions: [
          { id: "q1", type: "rating", question: "Communication skills", ratingScale: 5, required: true },
          { id: "q2", type: "rating", question: "Problem-solving ability", ratingScale: 5, required: true },
          { id: "q3", type: "rating", question: "Technical knowledge", ratingScale: 5, required: true },
          { id: "q4", type: "rating", question: "Teamwork and collaboration", ratingScale: 5, required: true }
        ],
        scoreConfig: undefined,
        createdAt: new Date(),
      },
    ];
    defaultTemplates.forEach(t => this.templates.set(t.id, t));
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async saveAsTemplate(survey: Survey, title: string, description: string, category: string): Promise<Template> {
    const templateId = `custom_${randomUUID()}`;
    const template: Template = {
      id: templateId,
      title,
      description,
      category,
      questions: survey.questions,
      scoreConfig: survey.scoreConfig,
      createdAt: new Date(),
    };
    this.templates.set(templateId, template);
    return template;
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
  // Simple response count cache with 30-second TTL
  private responseCountCache = new Map<string, { count: number; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

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

  async getAllTemplates(): Promise<Template[]> {
    return db.select().from(templates).orderBy(sql`${templates.createdAt} DESC`);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
    return result[0];
  }
}

export const storage = new DbStorage();
