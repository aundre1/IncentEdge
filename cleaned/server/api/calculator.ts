import { Request, Response } from "express";
import { storage } from "../storage";
import { insertCalculatorSubmissionSchema } from "@shared/schema";
import { z } from "zod";

// Define schema for calculation request
const calculationRequestSchema = z.object({
  projectType: z.string().min(1, "Project type is required"),
  squareFootage: z.coerce.number().positive("Square footage must be a positive number"),
  budget: z.coerce.number().positive("Budget must be a positive number")
});

// Schema for saving calculation
const saveCalculationSchema = calculationRequestSchema.extend({
  estimatedIncentive: z.number().nonnegative(),
  email: z.string().email().optional()
});

// Calculate incentives based on project parameters
async function calculateIncentives(req: Request, res: Response) {
  try {
    // Validate request body
    const requestResult = calculationRequestSchema.safeParse(req.body);
    if (!requestResult.success) {
      return res.status(400).json({ message: "Invalid request parameters", errors: requestResult.error.errors });
    }
    
    const { projectType, squareFootage, budget } = requestResult.data;
    
    // Calculate incentives using the storage interface
    const result = await storage.calculateIncentives(projectType, squareFootage, budget);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error calculating incentives:", error);
    return res.status(500).json({ message: "Error calculating incentives" });
  }
}

// Save a calculator submission for future reference
async function saveCalculation(req: Request, res: Response) {
  try {
    // Validate request body
    const requestResult = saveCalculationSchema.safeParse(req.body);
    if (!requestResult.success) {
      return res.status(400).json({ message: "Invalid request parameters", errors: requestResult.error.errors });
    }
    
    const submission = requestResult.data;
    
    // Validate against schema
    const validationResult = insertCalculatorSubmissionSchema.safeParse(submission);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Invalid submission data", errors: validationResult.error.errors });
    }
    
    // Save the submission
    const savedSubmission = await storage.saveCalculatorSubmission(validationResult.data);
    
    return res.status(201).json(savedSubmission);
  } catch (error) {
    console.error("Error saving calculation:", error);
    return res.status(500).json({ message: "Error saving calculation" });
  }
}

export default {
  calculateIncentives,
  saveCalculation
};
