import { Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Define schemas for validation
const idParamSchema = z.object({
  id: z.coerce.number().positive()
});

const filterQuerySchema = z.object({
  level: z.string().optional(),
  projectType: z.string().optional(),
  technology: z.string().optional(),
  status: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  search: z.string().optional()
}).optional();

// Schema for creating a new incentive
const createIncentiveSchema = z.object({
  name: z.string().min(1),
  provider: z.string().min(1),
  level: z.string().min(1),
  amount: z.string().min(1),
  deadline: z.string().min(1),
  project_types: z.array(z.string()).optional().default([]),
  technology: z.string().optional().default("Energy Efficiency"),
  status: z.string().optional().default("Active"),
  requirements: z.array(z.string()).optional().default([]),
  description: z.string().optional().default(""),
  contact_info: z.string().optional().default(""),
  application_url: z.string().optional().default("")
});

// Get all incentives with optional filters
async function getAllIncentives(req: Request, res: Response) {
  try {
    // Validate query parameters
    const filterResult = filterQuerySchema.safeParse(req.query);
    if (!filterResult.success) {
      return res.status(400).json({ message: "Invalid filter parameters", errors: filterResult.error.errors });
    }
    
    // Check for pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Get all incentives
    const incentives = await storage.getAllIncentives();
    
    // Apply filters if provided
    const filters = filterResult.data;
    let filteredIncentives = incentives;
    
    if (filters) {
      if (filters.level) {
        filteredIncentives = filteredIncentives.filter(
          incentive => incentive.level.toLowerCase().includes(filters.level!.toLowerCase())
        );
      }
      
      if (filters.projectType) {
        filteredIncentives = filteredIncentives.filter(
          incentive => incentive.projectTypes.some(
            type => type.toLowerCase().includes(filters.projectType!.toLowerCase())
          )
        );
      }
      
      if (filters.technology) {
        filteredIncentives = filteredIncentives.filter(
          incentive => incentive.projectTypes.some(
            type => type.toLowerCase().includes(filters.technology!.toLowerCase())
          )
        );
      }
      
      // Status filtering would require parsing deadlines, simplified here
      if (filters.status) {
        filteredIncentives = filteredIncentives.filter(
          incentive => incentive.deadline.toLowerCase().includes(filters.status!.toLowerCase())
        );
      }
      
      if (filters.minAmount) {
        // This is a simplified approach - in a real app we'd need to parse the amount string
        filteredIncentives = filteredIncentives.filter(
          incentive => {
            const amountStr = incentive.amount.replace(/[^0-9.]/g, '');
            return amountStr ? parseFloat(amountStr) >= filters.minAmount! : true;
          }
        );
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredIncentives = filteredIncentives.filter(
          incentive => 
            incentive.name.toLowerCase().includes(searchTerm) || 
            incentive.provider.toLowerCase().includes(searchTerm) ||
            incentive.description.toLowerCase().includes(searchTerm)
        );
      }
    }
    
    // If no pagination requested, return all filtered incentives (for backward compatibility)
    if (!req.query.page && !req.query.limit) {
      return res.status(200).json(filteredIncentives);
    }
    
    // Apply pagination
    const total = filteredIncentives.length;
    const paginatedIncentives = filteredIncentives.slice(offset, offset + limit);
    
    return res.status(200).json({
      incentives: paginatedIncentives,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Error getting incentives:", error);
    return res.status(500).json({ message: "Error getting incentives" });
  }
}

// Get a specific incentive by ID
async function getIncentiveById(req: Request, res: Response) {
  try {
    // Validate ID parameter
    const paramResult = idParamSchema.safeParse({ id: req.params.id });
    if (!paramResult.success) {
      return res.status(400).json({ message: "Invalid incentive ID", errors: paramResult.error.errors });
    }
    
    const { id } = paramResult.data;
    const incentive = await storage.getIncentiveById(id);
    
    if (!incentive) {
      return res.status(404).json({ message: "Incentive not found" });
    }
    
    return res.status(200).json(incentive);
  } catch (error) {
    console.error("Error getting incentive:", error);
    return res.status(500).json({ message: "Error getting incentive" });
  }
}

// Get summary of incentives for dashboard
async function getIncentivesSummary(req: Request, res: Response) {
  try {
    const summary = await storage.getIncentivesSummary();
    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error getting incentives summary:", error);
    return res.status(500).json({ message: "Error getting incentives summary" });
  }
}

// Create a new incentive
async function createIncentive(req: Request, res: Response) {
  try {
    // Validate request body
    const validationResult = createIncentiveSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid incentive data", 
        errors: validationResult.error.errors 
      });
    }
    
    const incentiveData = validationResult.data;
    
    // Convert to the format expected by storage
    const insertData = {
      name: incentiveData.name,
      provider: incentiveData.provider,
      level: incentiveData.level,
      amount: incentiveData.amount,
      deadline: incentiveData.deadline,
      projectTypes: incentiveData.project_types,
      technology: incentiveData.technology,
      status: incentiveData.status,
      requirements: incentiveData.requirements,
      description: incentiveData.description,
      contactInfo: incentiveData.contact_info,
      applicationUrl: incentiveData.application_url
    };
    
    const newIncentive = await storage.createIncentive(insertData);
    return res.status(200).json(newIncentive);
  } catch (error) {
    console.error("Error creating incentive:", error);
    return res.status(500).json({ message: "Error creating incentive" });
  }
}

export default {
  getAllIncentives,
  getIncentiveById,
  getIncentivesSummary,
  createIncentive
};
