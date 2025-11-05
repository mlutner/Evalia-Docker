import { type User, type InsertUser, type Survey, type InsertSurvey } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Survey operations
  getSurvey(id: string): Promise<Survey | undefined>;
  getAllSurveys(): Promise<Survey[]>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: string, survey: Partial<InsertSurvey>): Promise<Survey | undefined>;
  deleteSurvey(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private surveys: Map<string, Survey>;

  constructor() {
    this.users = new Map();
    this.surveys = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSurvey(id: string): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }

  async getAllSurveys(): Promise<Survey[]> {
    return Array.from(this.surveys.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const id = randomUUID();
    const now = new Date();
    const survey: Survey = {
      id,
      ...insertSurvey,
      description: insertSurvey.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.surveys.set(id, survey);
    return survey;
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
}

export const storage = new MemStorage();
