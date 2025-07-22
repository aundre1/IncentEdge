import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Incentives table for storing incentive data
export const incentives = pgTable("incentives", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  level: text("level").notNull(), // Federal, State, Local, Utility, Foundation
  amount: text("amount").notNull(),
  deadline: text("deadline").notNull(),
  projectTypes: json("project_types").notNull().$type<string[]>(),
  requirements: json("requirements").notNull().$type<string[]>(),
  description: text("description").notNull(),
  contactInfo: text("contact_info"),
  applicationUrl: text("application_url"),
  status: text("status").default("active").notNull(),
  technology: text("technology").default("efficiency").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Verification fields
  verificationLevel: integer("verification_level").default(0).notNull(),
  verificationDate: timestamp("verification_date"),
  verificationSource: text("verification_source"),
  verificationNotes: text("verification_notes"),
  // Data tracking fields
  lastDataCheck: timestamp("last_data_check"),
  dataSource: text("data_source"), // Official website URL or API endpoint
  deadlineStatus: text("deadline_status").default("unknown").notNull(), // active, expiring, expired, ongoing, unknown
  amountVerified: boolean("amount_verified").default(false).notNull(),
  deadlineVerified: boolean("deadline_verified").default(false).notNull(),
  nextCheckDue: timestamp("next_check_due"),
});

export const insertIncentiveSchema = createInsertSchema(incentives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Leads table for storing contact form submissions
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  projectType: text("project_type").notNull(),
  message: text("message").notNull(),
  subscribe: boolean("subscribe").default(false).notNull(),
  propertyType: text("property_type"),
  squareFootage: text("square_footage"),
  incentiveInterest: text("incentive_interest"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").default("new").notNull(), // new, contacted, qualified, closed
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  status: true,
});

// Calculator submissions for tracking usage
export const calculatorSubmissions = pgTable("calculator_submissions", {
  id: serial("id").primaryKey(),
  projectType: text("project_type").notNull(),
  squareFootage: integer("square_footage").notNull(),
  budget: integer("budget").notNull(),
  estimatedIncentive: integer("estimated_incentive").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Program updates tracking table
export const programUpdates = pgTable("program_updates", {
  id: serial("id").primaryKey(),
  incentiveId: integer("incentive_id").notNull(),
  updateType: text("update_type").notNull(), // deadline_change, amount_change, status_change, expired
  oldValue: text("old_value"),
  newValue: text("new_value"),
  source: text("source").notNull(), // manual, automated, api, scraper
  confidence: text("confidence").default("medium").notNull(), // low, medium, high
  verifiedBy: text("verified_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  applied: boolean("applied").default(false).notNull(),
});

// Data monitoring schedule
export const monitoringSchedule = pgTable("monitoring_schedule", {
  id: serial("id").primaryKey(),
  incentiveId: integer("incentive_id").notNull(),
  checkType: text("check_type").notNull(), // deadline, amount, status, availability
  frequency: text("frequency").notNull(), // daily, weekly, monthly, quarterly
  lastCheck: timestamp("last_check"),
  nextCheck: timestamp("next_check").notNull(),
  priority: text("priority").default("medium").notNull(), // low, medium, high, critical
  automated: boolean("automated").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCalculatorSubmissionSchema = createInsertSchema(calculatorSubmissions).omit({
  id: true,
  createdAt: true,
});

// Scraper jobs table for tracking scraping operations
export const scraperJobs = pgTable("scraper_jobs", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  source: text("source").notNull(), // e.g., "federal", "state", "local", "utility"
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  recordsFound: integer("records_found").default(0),
  recordsImported: integer("records_imported").default(0),
  errorMessage: text("error_message"),
  metadata: json("metadata").$type<Record<string, any>>(),
});

export const insertScraperJobSchema = createInsertSchema(scraperJobs).omit({
  id: true,
  startedAt: true,
});

// Scraped incentives table for raw scraped data before processing
export const scrapedIncentives = pgTable("scraped_incentives", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => scraperJobs.id).notNull(),
  rawData: json("raw_data").notNull().$type<Record<string, any>>(),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
  processed: boolean("processed").default(false).notNull(),
  processedAt: timestamp("processed_at"),
  incentiveId: integer("incentive_id").references(() => incentives.id),
});

export const insertScrapedIncentiveSchema = createInsertSchema(scrapedIncentives).omit({
  id: true,
  scrapedAt: true,
});

// Data sources configuration table
export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "government", "utility", "foundation"
  baseUrl: text("base_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastScrapedAt: timestamp("last_scraped_at"),
  scrapingInterval: integer("scraping_interval").default(86400), // seconds
  config: json("config").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDataSourceSchema = createInsertSchema(dataSources).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Incentive = typeof incentives.$inferSelect;
export type InsertIncentive = z.infer<typeof insertIncentiveSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type CalculatorSubmission = typeof calculatorSubmissions.$inferSelect;
export type InsertCalculatorSubmission = z.infer<typeof insertCalculatorSubmissionSchema>;

export type ScraperJob = typeof scraperJobs.$inferSelect;
export type InsertScraperJob = z.infer<typeof insertScraperJobSchema>;

export type ScrapedIncentive = typeof scrapedIncentives.$inferSelect;
export type InsertScrapedIncentive = z.infer<typeof insertScrapedIncentiveSchema>;

export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
