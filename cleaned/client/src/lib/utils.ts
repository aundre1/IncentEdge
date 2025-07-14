import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return 'N/A';
  
  // Handle millions
  if (numAmount >= 1000000) {
    return `$${(numAmount / 1000000).toFixed(1)}M`;
  }
  
  // Handle thousands
  if (numAmount >= 1000) {
    return `$${(numAmount / 1000).toFixed(1)}K`;
  }
  
  return `$${numAmount.toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // Return as is if invalid date
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function getStatusClass(deadline: string): string {
  if (!deadline) return '';
  
  // For special statuses like "Ongoing" or "Permanent"
  if (['ongoing', 'permanent', 'active'].includes(deadline.toLowerCase())) {
    return 'deadline-ongoing';
  }
  
  // Try to parse as date
  try {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 30) return 'deadline-urgent';
    if (daysUntilDeadline <= 90) return 'deadline-soon';
    return 'deadline-ongoing';
  } catch (e) {
    return '';
  }
}

export function getLevelClass(level: string): string {
  if (!level) return '';
  
  const normalizedLevel = level.toLowerCase();
  
  if (normalizedLevel.includes('federal')) return 'level-federal';
  if (normalizedLevel.includes('state')) return 'level-state';
  if (normalizedLevel.includes('local') || normalizedLevel.includes('nyc')) return 'level-local';
  if (normalizedLevel.includes('utility')) return 'level-utility';
  if (normalizedLevel.includes('foundation')) return 'level-foundation';
  
  return '';
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function calculateIncentive(
  projectType: string,
  squareFootage: number,
  budget: number
): { totalIncentive: number; breakdownByProgram: Record<string, number> } {
  // Default return
  const result = { 
    totalIncentive: 0, 
    breakdownByProgram: {} as Record<string, number> 
  };
  
  if (!projectType || !squareFootage || !budget) {
    return result;
  }
  
  // These calculations would be based on actual formulas for different programs
  // This is a simplified example based on project type
  if (projectType.includes('commercial')) {
    // Commercial buildings might qualify for 179D
    const d179Incentive = Math.min(squareFootage * 5, budget * 0.1);
    result.breakdownByProgram['179D Tax Deduction'] = d179Incentive;
    
    // Maybe ITC for solar if commercial
    const itcIncentive = budget * 0.3 * 0.2; // Assuming 20% of budget is solar
    result.breakdownByProgram['Investment Tax Credit (ITC)'] = itcIncentive;
    
    // Additional programs based on retrofit or new
    if (projectType.includes('retrofit')) {
      const retrofitIncentive = squareFootage * 2;
      result.breakdownByProgram['Energy Efficiency Rebates'] = retrofitIncentive;
    } else {
      const newConstructionIncentive = squareFootage * 1.5;
      result.breakdownByProgram['New Construction Incentives'] = newConstructionIncentive;
    }
  } else if (projectType.includes('multifamily')) {
    // Multifamily specific incentives
    const l45Incentive = Math.min(budget * 0.05, 500000);
    result.breakdownByProgram['45L Tax Credit'] = l45Incentive;
    
    // NYSERDA incentives for multifamily
    const nyserdaIncentive = squareFootage * 1.2;
    result.breakdownByProgram['NYSERDA Multifamily Program'] = nyserdaIncentive;
    
    // If affordable housing, add additional incentives
    if (projectType.includes('affordable')) {
      const affordableIncentive = squareFootage * 3;
      result.breakdownByProgram['Affordable Housing Bonus'] = affordableIncentive;
    }
  }
  
  // Calculate total incentive
  result.totalIncentive = Object.values(result.breakdownByProgram).reduce((acc, val) => acc + val, 0);
  
  return result;
}
