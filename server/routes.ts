import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import incentivesRoutes from "./api/incentives";
import calculatorRoutes from "./api/calculator";
import leadsRoutes from "./api/leads";
import * as scraperRoutes from "./api/scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API routes
  // All routes are prefixed with /api
  
  // Incentives routes
  app.get("/api/incentives", incentivesRoutes.getAllIncentives);
  app.get("/api/incentives/summary", incentivesRoutes.getIncentivesSummary);
  app.get("/api/incentives/:id", incentivesRoutes.getIncentiveById);
  
  // Calculator routes
  app.post("/api/calculator", calculatorRoutes.calculateIncentives);
  app.post("/api/calculator/save", calculatorRoutes.saveCalculation);
  
  // Lead capture routes
  app.post("/api/leads", leadsRoutes.createLead);
  
  // Scraper routes
  app.get("/api/scraper/summary", scraperRoutes.getScraperSummary);
  app.get("/api/scraper/jobs", scraperRoutes.getScraperJobs);
  app.get("/api/scraper/jobs/:id/logs", scraperRoutes.getJobLogs);
  app.post("/api/scraper/trigger", scraperRoutes.triggerScraping);
  app.get("/api/scraper/sources", scraperRoutes.getDataSources);
  app.post("/api/scraper/sources", scraperRoutes.upsertDataSource);
  app.get("/api/scraper/data/:jobId", scraperRoutes.getScrapedData);
  app.get("/api/scraper/data", scraperRoutes.getScrapedData);
  app.post("/api/scraper/process", scraperRoutes.processScrapedData);
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
