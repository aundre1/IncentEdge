import { useState } from "react";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn, getStatusClass, getLevelClass } from "@/lib/utils";
import { Incentive } from "@shared/types";

interface IncentivesTableProps {
  incentives: Incentive[];
  isLoading?: boolean;
}

export default function IncentivesTable({ incentives, isLoading = false }: IncentivesTableProps) {
  const [sortField, setSortField] = useState<keyof Incentive | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sorting
  const handleSort = (field: keyof Incentive) => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort incentives (pagination handled by parent component)
  const sortedIncentives = [...incentives].sort((a, b) => {
    if (!sortField) return 0;
    
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
    // Handle null/undefined values
    if (fieldA == null && fieldB == null) return 0;
    if (fieldA == null) return sortDirection === 'asc' ? 1 : -1;
    if (fieldB == null) return sortDirection === 'asc' ? -1 : 1;
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA);
    }
    
    // Fallback for non-string comparisons
    if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Sort icon component
  const SortIcon = ({ field }: { field: keyof Incentive }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/80">
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-gray-700">
              <TableHead 
                className="cursor-pointer py-4 text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Program Name
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer py-4 text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => handleSort('provider')}
              >
                <div className="flex items-center">
                  Provider/Level
                  <SortIcon field="provider" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer py-4 text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Amount Available
                  <SortIcon field="amount" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer py-4 text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => handleSort('deadline')}
              >
                <div className="flex items-center">
                  Deadline/Status
                  <SortIcon field="deadline" />
                </div>
              </TableHead>
              <TableHead className="py-4 text-gray-700 dark:text-gray-300 font-semibold">
                Project Types
              </TableHead>
              <TableHead className="text-right py-4 text-gray-700 dark:text-gray-300 font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedIncentives.map((incentive, index) => (
              <TableRow 
                key={incentive.id} 
                className={`hover:bg-blue-50/40 dark:hover:bg-blue-900/10 group transition-colors border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}
              >
                <TableCell className="font-medium text-gray-800 dark:text-gray-200 py-4">
                  <div className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {incentive.name}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {incentive.provider}
                  </div>
                  <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getLevelClass(incentive.level))}>
                    {incentive.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-green-600 dark:text-green-400 font-medium py-4">
                  {incentive.amount}
                </TableCell>
                <TableCell className="py-4">
                  <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusClass(incentive.deadline))}>
                    {incentive.deadline}
                  </Badge>
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {incentive.projectTypes.slice(0, 3).map((type, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full px-2.5 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {type}
                      </Badge>
                    ))}
                    {incentive.projectTypes.length > 3 && (
                      <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400 rounded-full px-2.5 py-0.5">
                        +{incentive.projectTypes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/30" 
                    asChild
                  >
                    <Link href={`/incentives/${incentive.id}`}>
                      View Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}