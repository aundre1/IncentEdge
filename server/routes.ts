import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import incentivesRoutes from "./api/incentives";
import calculatorRoutes from "./api/calculator";
import leadsRoutes from "./api/leads";
import * as scraperRoutes from "./api/scraper";
import { dataMonitoring } from "./dataMonitoring";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up API routes
  // All routes are prefixed with /api
  
  // Incentives routes
  app.get("/api/incentives", incentivesRoutes.getAllIncentives);
  app.get("/api/incentives/summary", incentivesRoutes.getIncentivesSummary);
  app.get("/api/incentives/:id", incentivesRoutes.getIncentiveById);
  app.post("/api/incentives", incentivesRoutes.createIncentive);
  
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
  
  // Data Monitoring routes
  app.get("/api/monitoring/status", async (req, res) => {
    try {
      const pendingUpdates = await dataMonitoring.getPendingUpdates();
      res.json({
        pendingUpdates: pendingUpdates.length,
        updates: pendingUpdates.slice(0, 10)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get monitoring status" });
    }
  });
  
  app.post("/api/monitoring/setup", async (req, res) => {
    try {
      await dataMonitoring.setupMonitoringSchedule();
      res.json({ success: true, message: "Monitoring schedule set up successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to setup monitoring schedule" });
    }
  });
  
  app.post("/api/monitoring/check", async (req, res) => {
    try {
      const checkedCount = await dataMonitoring.checkDuePrograms();
      res.json({ 
        success: true, 
        message: `Checked ${checkedCount} programs`,
        checkedCount 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check programs" });
    }
  });
  
  app.post("/api/monitoring/update/:id/apply", async (req, res) => {
    try {
      const updateId = parseInt(req.params.id);
      await dataMonitoring.applyUpdate(updateId);
      res.json({ success: true, message: "Update applied successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to apply update" });
    }
  });
  
  app.post("/api/monitoring/analyze-deadlines", async (req, res) => {
    try {
      await dataMonitoring.analyzeDeadlines();
      res.json({ success: true, message: "Deadline analysis complete" });
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze deadlines" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
