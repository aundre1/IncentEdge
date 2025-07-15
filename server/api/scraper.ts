import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertScraperJobSchema, insertDataSourceSchema } from "@shared/schema";
import { ScrapingRequest, DataSourceConfig } from "@shared/types";
import { spawn } from "child_process";
import path from "path";

// Validation schemas
const scrapingRequestSchema = z.object({
  sources: z.array(z.string()),
  immediate: z.boolean().optional().default(false),
  config: z.record(z.any()).optional(),
});

const dataSourceConfigSchema = z.object({
  name: z.string(),
  type: z.enum(["government", "utility", "foundation"]),
  baseUrl: z.string().url(),
  selectors: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  rateLimit: z.number().optional().default(1000),
  timeout: z.number().optional().default(30000),
});

// Get scraper job summary and status
export async function getScraperSummary(req: Request, res: Response) {
  try {
    const summary = await storage.getScraperJobSummary();
    res.json(summary);
  } catch (error) {
    console.error("Error fetching scraper summary:", error);
    res.status(500).json({ error: "Failed to fetch scraper summary" });
  }
}

// Get all scraper jobs with pagination
export async function getScraperJobs(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    
    const jobs = await storage.getScraperJobs({ page, limit, status });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching scraper jobs:", error);
    res.status(500).json({ error: "Failed to fetch scraper jobs" });
  }
}

export async function getJobLogs(req: Request, res: Response) {
  try {
    const jobId = parseInt(req.params.id);
    const jobs = await storage.getScraperJobs({ page: 1, limit: 100 });
    const job = jobs.jobs.find(j => j.id === jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    const results = (job as any ).results || {};

    res.json({
      job: job,
      logs: results,
      output: results.output || '',
      error: results.error || null
    });
  } catch (error) {
    console.error('Error fetching job logs:', error);
    res.status(500).json({ error: 'Failed to fetch job logs' });
  }
}

// Trigger manual scraping
export async function triggerScraping(req: Request, res: Response) {
  try {
    const validatedData = scrapingRequestSchema.parse(req.body);
    
    // Create scraper job record
    const job = await storage.createScraperJob({
      source: validatedData.sources.join(","),
      status: "pending",
      metadata: validatedData.config || {},
    });

    // Execute Python scraper in background
    const jobId = await executePythonScraper(job.id, validatedData);
    
    res.json({ 
      success: true, 
      jobId: job.id,
      message: "Scraping job started successfully" 
    });
  } catch (error) {
    console.error("Error triggering scraping:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to start scraping job" });
    }
  }
}

// Get data sources configuration
export async function getDataSources(req: Request, res: Response) {
  try {
    const sources = await storage.getDataSources();
    res.json(sources);
  } catch (error) {
    console.error("Error fetching data sources:", error);
    res.status(500).json({ error: "Failed to fetch data sources" });
  }
}

// Create or update data source
export async function upsertDataSource(req: Request, res: Response) {
  try {
    const validatedData = dataSourceConfigSchema.parse(req.body);
    
    const source = await storage.upsertDataSource({
      name: validatedData.name,
      type: validatedData.type,
      baseUrl: validatedData.baseUrl,
      config: {
        selectors: validatedData.selectors ? [validatedData.selectors] : [{}],
        headers: validatedData.headers ? [validatedData.headers] : [{}],
        rateLimit: [validatedData.rateLimit ?? 0],
        timeout: [validatedData.timeout ?? 0],
      },
    });
    
    res.json(source);
  } catch (error) {
    console.error("Error upserting data source:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid data source configuration", details: error.errors });
    } else {
      res.status(500).json({ error: "Failed to save data source" });
    }
  }
}

// Get scraped data with processing status
export async function getScrapedData(req: Request, res: Response) {
  try {
    const jobId = parseInt(req.params.jobId as string);
    const processed = req.query.processed === "true";
    
    const data = await storage.getScrapedData(jobId, processed);
    res.json(data);
  } catch (error) {
    console.error("Error fetching scraped data:", error);
    res.status(500).json({ error: "Failed to fetch scraped data" });
  }
}

// Process scraped data into incentives
export async function processScrapedData(req: Request, res: Response) {
  try {
    const { scrapedIds } = req.body;
    
    if (!Array.isArray(scrapedIds)) {
      return res.status(400).json({ error: "scrapedIds must be an array" });
    }
    
    const processed = await storage.processScrapedData(scrapedIds);
    res.json({ 
      success: true, 
      processedCount: processed.length,
      incentives: processed 
    });
  } catch (error) {
    console.error("Error processing scraped data:", error);
    res.status(500).json({ error: "Failed to process scraped data" });
  }
}

// Execute Python scraper
async function executePythonScraper(jobId: number, request: ScrapingRequest): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      // Update job status to running
      storage.updateScraperJob(jobId, { status: "running" });
      
      // Store request sources for later use
      const requestSources = request.sources;
      
      // Prepare Python script arguments
      const args = [
        "--job-id", jobId.toString(),
        "--sources", requestSources.join(","),
        "--output-format", "json",
      ];
      
      if (request.config) {
        args.push("--config", JSON.stringify(request.config));
      }
      
      // Execute Python scraper script
      console.log(`Executing: python3 scraper/main.py ${args.join(' ')}`);
      const pythonProcess = spawn("python3", ["scraper/main.py", ...args], {
        cwd: process.cwd(),
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          PYTHONPATH: `${process.cwd()}:${process.cwd()}/scraper:${process.env.PYTHONPATH || ''}`
        }
      });
      
      let output = "";
      let errorOutput = "";
      
      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on("close", async (code) => {
        try {
          console.log(`Python process completed with code: ${code}`);
          console.log(`Python output: ${output.substring(0, 500)}...`);
          
          if (code === 0) {
            // Parse output and save scraped data
            let scrapedData = [];
            try {
              const parsed = JSON.parse(output);
              // Handle different output formats from Python scraper
              if (parsed.data && Array.isArray(parsed.data)) {
                scrapedData = parsed.data;
              } else if (Array.isArray(parsed)) {
                scrapedData = parsed;
              } else if (parsed.total_records > 0) {
                scrapedData = parsed.data || [];
              }
            } catch (parseError) {
              console.log('Failed to parse scraper output as JSON, treating as empty result');
              scrapedData = [];
            }
            
            console.log(`Processing ${scrapedData.length} scraped records`);
            if (scrapedData.length > 0) {
              // Transform data to match database schema using stored source reference
              const sourceReference = requestSources[0] || 'unknown';
              const dbData = scrapedData.map((item: any) => ({
                jobId,
                rawData: item,
                source: sourceReference,
                sourceUrl: item.sourceUrl || item.url || ""
              }));
              
              const savedData = await storage.saveScrapedData(jobId, dbData);
              console.log(`Saved ${savedData.length} records to scraped_incentives table`);
              
              // Auto-process scraped data into main incentives database
              const processedCount = await storage.autoProcessScrapedData(jobId);
              console.log(`Auto-processed ${processedCount} incentives into main database`);
              
              // Update job with successful completion
              await storage.updateScraperJob(jobId, { 
                status: "completed",
                completedAt: new Date(),
                recordsFound: scrapedData.length,
                recordsImported: processedCount,
              });
            } else {
              // No data found but job completed successfully
              await storage.updateScraperJob(jobId, { 
                status: "completed",
                completedAt: new Date(),
                recordsFound: 0,
                recordsImported: 0,
              });
            }
            await storage.updateScraperJob(jobId, { 
              status: "completed",
              completedAt: new Date(),
              recordsFound: scrapedData.length,
            });
            resolve(jobId);
          } else {
            await storage.updateScraperJob(jobId, {
              status: "failed",
              completedAt: new Date(),
              errorMessage: errorOutput || `Process exited with code ${code}`,
            });
            reject(new Error(`Scraper process failed with code ${code}: ${errorOutput}`));
          }
        } catch (error) {
          await storage.updateScraperJob(jobId, {
            status: "failed",
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
          reject(error);
        }
      });
      
      pythonProcess.on("error", async (error) => {
        await storage.updateScraperJob(jobId, {
          status: "failed",
          completedAt: new Date(),
          errorMessage: error.message,
        });
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}
