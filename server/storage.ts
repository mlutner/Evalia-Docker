import { type User, type UpsertUser, type Survey, type InsertSurvey, users, surveys, surveyResponses, type SurveyResponse } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Survey operations
  getSurvey(id: string): Promise<Survey | undefined>;
  getAllSurveys(userId: string): Promise<Survey[]>;
  createSurvey(survey: InsertSurvey, userId: string): Promise<Survey>;
  updateSurvey(id: string, survey: Partial<InsertSurvey>): Promise<Survey | undefined>;
  deleteSurvey(id: string): Promise<boolean>;
  checkSurveyOwnership(surveyId: string, userId: string): Promise<boolean>;
  
  // Response operations
  createResponse(surveyId: string, answers: Record<string, string | string[]>): Promise<SurveyResponse>;
  getResponses(surveyId: string): Promise<SurveyResponse[]>;
  getResponseCount(surveyId: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private surveys: Map<string, Survey>;
  private responses: Map<string, SurveyResponse>;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
    this.responses = new Map();
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
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(user.id, user);
    return user;
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
      ...updates,
      updatedAt: new Date(),
    };
    this.surveys.set(id, updatedSurvey);
    return updatedSurvey;
  }

  async deleteSurvey(id: string): Promise<boolean> {
    return this.surveys.delete(id);
  }

  async createResponse(surveyId: string, answers: Record<string, string | string[]>): Promise<SurveyResponse> {
    const response: SurveyResponse = {
      id: randomUUID(),
      surveyId,
      answers,
      completedAt: new Date(),
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
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(surveyResponses)
      .where(eq(surveyResponses.surveyId, surveyId));
    return Number(result[0]?.count || 0);
  }
}

export const storage = new DbStorage();
