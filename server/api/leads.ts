import { Request, Response } from "express";
import { storage } from "../storage";
import { insertLeadSchema } from "@shared/schema";

// Create a new lead from contact form
async function createLead(req: Request, res: Response) {
  try {
    // Validate request body against schema
    const validationResult = insertLeadSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: "Invalid lead data", errors: validationResult.error.errors });
    }
    
    // Create the lead
    const lead = await storage.createLead(validationResult.data);
    
    // In a real application, you might send an email notification here
    // or integrate with a CRM system
    
    return res.status(201).json({
      id: lead.id,
      message: "Lead created successfully"
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return res.status(500).json({ message: "Error creating lead" });
  }
}

export default {
  createLead
};
