import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  INCENTIVE_LEVELS,
  PROJECT_TYPES,
  TECHNOLOGY_TYPES,
  STATUS_TYPES,
  AMOUNT_RANGES
} from "@/lib/constants";

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  incentives?: any[];
}

export default function FilterSidebar({ onFilterChange, incentives }: FilterSidebarProps) {
  const [level, setLevel] = useState('all');
  const [projectTypes, setProjectTypes] = useState<string[]>(['all']);
  const [technology, setTechnology] = useState('all');
  const [status, setStatus] = useState('all');
  const [amount, setAmount] = useState('any');

  // Handle project type checkbox changes
  const handleProjectTypeChange = (value: string, checked: boolean) => {
    if (value === 'all' && checked) {
      // If "All Projects" is checked, uncheck others
      setProjectTypes(['all']);
    } else if (checked) {
      // If any specific project type is checked, remove 'all' and add the new value
      const newProjectTypes = projectTypes.filter(t => t !== 'all').concat(value);
      setProjectTypes(newProjectTypes);
    } else {
      // If unchecked, remove from array
      const newProjectTypes = projectTypes.filter(t => t !== value);
      // If no specific types are selected, default back to 'all'
      setProjectTypes(newProjectTypes.length ? newProjectTypes : ['all']);
    }
  };

  // Apply filters automatically when any filter changes
  const applyFilters = () => {
    const filters = {
      level: level === 'all' ? '' : level,
      projectTypes: projectTypes.includes('all') ? [] : projectTypes,
      technology: technology === 'all' ? '' : technology,
      status: status === 'all' ? '' : status,
      amount: amount === 'any' ? 0 : parseInt(amount)
    };
    onFilterChange(filters);
  };

  // Auto-apply filters when any value changes
  useEffect(() => {
    applyFilters();
  }, [level, projectTypes, technology, status, amount]);

  // Reset filters
  const resetFilters = () => {
    setLevel('all');
    setProjectTypes(['all']);
    setTechnology('all');
    setStatus('all');
    setAmount('any');
  };

  return (
    <Card className="sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle>Filter Incentives</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level Filter */}
        <div>
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
            Incentive Level
          </Label>
          <RadioGroup value={level} onValueChange={setLevel} className="space-y-2">
            {INCENTIVE_LEVELS.map((option) => (
              <div className="flex items-center" key={option.value}>
                <RadioGroupItem value={option.value} id={`level-${option.value}`} />
                <Label htmlFor={`level-${option.value}`} className="ml-3 text-sm text-neutral-700 dark:text-neutral-300">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        {/* Project Type Filter */}
        <div>
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
            Project Type
          </Label>
          <div className="space-y-2">
            {PROJECT_TYPES.map((option) => (
              <div className="flex items-center" key={option.value}>
                <Checkbox 
                  id={`project-${option.value}`} 
                  checked={projectTypes.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleProjectTypeChange(option.value, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`project-${option.value}`} 
                  className="ml-3 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Technology Filter */}
        <div>
          <Label htmlFor="technology-select" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
            Technology Type
          </Label>
          <Select value={technology} onValueChange={setTechnology}>
            <SelectTrigger id="technology-select">
              <SelectValue placeholder="Select Technology" />
            </SelectTrigger>
            <SelectContent>
              {TECHNOLOGY_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Status Filter */}
        <div>
          <Label htmlFor="status-select" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status-select">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_TYPES.map((option) => {
                // Calculate real-time counts based on current incentives data
                let count = 0;
                if (option.value === 'all') {
                  count = incentives?.length || 0;
                } else if (option.value === 'ongoing_category') {
                  count = incentives?.filter(i => {
                    const deadline = i.deadline.toLowerCase();
                    return deadline.includes('ongoing') || deadline.includes('permanent') || 
                           deadline.includes('subscription-based') || deadline.includes('rolling');
                  }).length || 0;
                } else if (option.value === 'multiyear_category') {
                  count = incentives?.filter(i => {
                    const deadline = i.deadline.toLowerCase();
                    return deadline.includes('multi-year') || deadline.includes('multiyear') ||
                           deadline.includes('5-year') || deadline.includes('10-year');
                  }).length || 0;
                } else if (option.value === 'annual_category') {
                  count = incentives?.filter(i => {
                    const deadline = i.deadline.toLowerCase();
                    return deadline.includes('annual') || deadline.includes('competition cycles') ||
                           deadline.includes('decade-long');
                  }).length || 0;
                } else if (option.value === 'expiring_category') {
                  count = incentives?.filter(i => {
                    const deadline = i.deadline.toLowerCase();
                    return deadline.includes('2024') || deadline.includes('2025') ||
                           deadline.includes('feb') || deadline.includes('may') || deadline.includes('dec');
                  }).length || 0;
                } else if (option.value === 'dated_category') {
                  count = incentives?.filter(i => {
                    const deadline = i.deadline.toLowerCase();
                    return deadline.includes('2030-12-31') || deadline.includes('2032-12-31') ||
                           deadline.includes('through 2030') || deadline.includes('through 2032') ||
                           deadline.includes('available through');
                  }).length || 0;
                }
                
                return (
                  <SelectItem key={option.value} value={option.value}>
                    {option.baseLabel} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        
        {/* Amount Range */}
        <div>
          <Label htmlFor="amount-select" className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
            Minimum Incentive Amount
          </Label>
          <Select value={amount} onValueChange={setAmount}>
            <SelectTrigger id="amount-select">
              <SelectValue placeholder="Select Amount" />
            </SelectTrigger>
            <SelectContent>
              {AMOUNT_RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 flex flex-col gap-2">
        <Button className="w-full" onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button className="w-full" variant="outline" onClick={resetFilters}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
