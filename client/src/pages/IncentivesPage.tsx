import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FilterSidebar from "@/components/incentives/FilterSidebar";
import IncentivesTable from "@/components/incentives/IncentivesTable";
import { Incentive } from "@shared/types";

export default function IncentivesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState({
    level: "",
    projectTypes: [] as string[],
    technology: "",
    status: "",
    amount: 0
  });
  const [sortBy, setSortBy] = useState("relevance");
  
  // Fetch all incentives
  const { data: allIncentives, isLoading } = useQuery<Incentive[]>({
    queryKey: ["/api/incentives"],
  });
  
  // Fetch summary data for real-time funding amount
  const { data: summaryData } = useQuery<{totalFunding: string; totalPrograms: number}>({
    queryKey: ["/api/incentives/summary"],
  });
  
  // Filter incentives based on search and tab selection
  const filteredIncentives = (allIncentives || []).filter(incentive => {
    // Filter by search term
    if (searchTerm && !incentive.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !incentive.provider.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by tab (level)
    if (activeTab !== "all" && !incentive.level.toLowerCase().includes(activeTab.toLowerCase())) {
      return false;
    }
    
    // Filter by custom filters
    if (filters.level && filters.level !== "all" && !incentive.level.toLowerCase().includes(filters.level.toLowerCase())) {
      return false;
    }
    
    // Filter by project types - Comprehensive matching for all 907 active programs
    if (filters.projectTypes.length > 0) {
      const matchesProjectType = incentive.projectTypes.some(type => 
        filters.projectTypes.some(filterType => {
          const typeLower = type.toLowerCase();
          const filterLower = filterType.toLowerCase();
          
          // Handle energy efficiency filtering
          if (filterLower === 'energy efficiency') {
            return typeLower.includes('energy efficiency') ||
                   typeLower.includes('efficiency') ||
                   typeLower.includes('residential efficiency') ||
                   typeLower.includes('commercial efficiency') ||
                   typeLower.includes('hvac') ||
                   typeLower.includes('lighting') ||
                   typeLower.includes('building envelope') ||
                   typeLower.includes('hot water systems') ||
                   typeLower.includes('custom measures') ||
                   typeLower.includes('prescriptive') ||
                   typeLower.includes('whole building');
          }
          
          // Handle renewable energy filtering
          if (filterLower === 'renewable energy') {
            return typeLower.includes('renewable energy') ||
                   typeLower.includes('renewable') ||
                   typeLower.includes('clean energy') ||
                   typeLower.includes('biomass') ||
                   typeLower.includes('geothermal') ||
                   typeLower.includes('heat pumps') ||
                   typeLower.includes('vrf systems');
          }
          
          // Handle energy storage filtering
          if (filterLower === 'energy storage') {
            return typeLower.includes('energy storage') ||
                   typeLower.includes('storage') ||
                   typeLower.includes('battery');
          }
          
          // Handle solar filtering
          if (filterLower === 'solar') {
            return typeLower.includes('solar') ||
                   typeLower.includes('solar pv') ||
                   typeLower.includes('solar water heating') ||
                   typeLower.includes('photovoltaic');
          }
          
          // Handle wind filtering
          if (filterLower === 'wind') {
            return typeLower.includes('wind') ||
                   typeLower.includes('wind energy');
          }
          
          // Handle residential filtering
          if (filterLower === 'residential') {
            return typeLower.includes('residential') ||
                   typeLower.includes('home') ||
                   typeLower.includes('housing') ||
                   typeLower.includes('new construction') ||
                   typeLower.includes('multifamily') ||
                   typeLower.includes('energy star');
          }
          
          // Handle commercial filtering
          if (filterLower === 'commercial') {
            return typeLower.includes('commercial') ||
                   typeLower.includes('business') ||
                   typeLower.includes('industrial') ||
                   typeLower.includes('c&i') ||
                   typeLower.includes('buildings');
          }
          
          // Handle transportation/EV filtering
          if (filterLower === 'transportation') {
            return typeLower.includes('electric vehicles') ||
                   typeLower.includes('plug-in hybrids') ||
                   typeLower.includes('ev charging') ||
                   typeLower.includes('hydrogen fueling') ||
                   typeLower.includes('cng stations') ||
                   typeLower.includes('lpg stations') ||
                   typeLower.includes('vehicle') ||
                   typeLower.includes('transportation');
          }
          
          // Handle climate & resilience filtering
          if (filterLower === 'climate') {
            return typeLower.includes('climate innovation') ||
                   typeLower.includes('climate resilience') ||
                   typeLower.includes('environmental justice') ||
                   typeLower.includes('community benefits') ||
                   typeLower.includes('social justice') ||
                   typeLower.includes('community solutions') ||
                   typeLower.includes('energy studies') ||
                   typeLower.includes('feasibility') ||
                   typeLower.includes('indoor air quality');
          }
          
          // Handle manufacturing filtering
          if (filterLower === 'manufacturing') {
            return typeLower.includes('manufacturing') ||
                   typeLower.includes('clean energy manufacturing') ||
                   typeLower.includes('production');
          }
          
          // Handle rural projects filtering
          if (filterLower === 'rural') {
            return typeLower.includes('rural') ||
                   typeLower.includes('rural energy projects') ||
                   typeLower.includes('high energy cost areas');
          }
          
          // Handle advanced technologies filtering
          if (filterLower === 'advanced') {
            return typeLower.includes('net-zero') ||
                   typeLower.includes('carbon neutral') ||
                   typeLower.includes('deep retrofit') ||
                   typeLower.includes('decarbonization') ||
                   typeLower.includes('compliance') ||
                   typeLower.includes('technical support') ||
                   typeLower.includes('advanced energy') ||
                   typeLower.includes('grid services') ||
                   typeLower.includes('customer solutions') ||
                   typeLower.includes('energy innovation') ||
                   typeLower.includes('demonstration projects') ||
                   typeLower.includes('market facilitation') ||
                   typeLower.includes('general');
          }
          
          // Direct match for any other project types
          return typeLower.includes(filterLower) || filterLower.includes(typeLower);
        })
      );
      if (!matchesProjectType) return false;
    }
    
    // Filter by technology
    if (filters.technology && filters.technology !== "all") {
      const matchesTechnology = incentive.projectTypes.some(type => {
        const typeLower = type.toLowerCase();
        const techLower = filters.technology.toLowerCase();
        
        // Handle energy efficiency filtering
        if (techLower === 'energy efficiency') {
          return typeLower.includes('efficiency') ||
                 typeLower.includes('hvac') ||
                 typeLower.includes('lighting') ||
                 typeLower.includes('insulation') ||
                 typeLower.includes('envelope');
        }
        
        // Handle solar/renewable filtering
        if (techLower === 'solar') {
          return typeLower.includes('solar') ||
                 typeLower.includes('renewable') ||
                 typeLower.includes('wind') ||
                 typeLower.includes('geothermal');
        }
        
        // Handle HVAC filtering
        if (techLower === 'hvac') {
          return typeLower.includes('hvac') ||
                 typeLower.includes('heat pump') ||
                 typeLower.includes('heating') ||
                 typeLower.includes('cooling');
        }
        
        // Handle energy storage filtering
        if (techLower === 'energy storage') {
          return typeLower.includes('storage') ||
                 typeLower.includes('battery');
        }
        
        // Handle EV/transportation filtering
        if (techLower === 'electric vehicle') {
          return typeLower.includes('electric vehicle') ||
                 typeLower.includes('ev') ||
                 typeLower.includes('transportation') ||
                 typeLower.includes('charging');
        }
        
        // Handle research/innovation filtering
        if (techLower === 'research') {
          return typeLower.includes('research') ||
                 typeLower.includes('innovation') ||
                 typeLower.includes('advanced') ||
                 typeLower.includes('development');
        }
        
        return typeLower.includes(techLower);
      });
      if (!matchesTechnology) return false;
    }
    
    // Filter by status
    if (filters.status && filters.status !== "all") {
      const deadline = incentive.deadline.toLowerCase();
      const filterStatus = filters.status;
      
      // Comprehensive category-based matching
      if (filterStatus === 'ongoing_category') {
        const isOngoing = deadline.includes('ongoing') || 
                         deadline.includes('permanent') ||
                         deadline.includes('subscription-based') ||
                         deadline.includes('block-based') ||
                         deadline.includes('first-come basis') ||
                         deadline.includes('through mw');
        if (!isOngoing) return false;
      }
      
      if (filterStatus === 'multiyear_category') {
        const isMultiYear = deadline.includes('multi-year');
        if (!isMultiYear) return false;
      }
      
      if (filterStatus === 'annual_category') {
        const isAnnual = deadline.includes('annual') ||
                        deadline.includes('competition cycles') ||
                        deadline.includes('decade-long');
        if (!isAnnual) return false;
      }
      
      if (filterStatus === 'expiring_category') {
        const isExpiring = deadline.includes('2024') ||
                          deadline.includes('2025') ||
                          deadline.includes('feb') ||
                          deadline.includes('may') ||
                          deadline.includes('dec');
        if (!isExpiring) return false;
      }
      
      if (filterStatus === 'dated_category') {
        const isDated = deadline.includes('2030-12-31') ||
                       deadline.includes('2032-12-31') ||
                       deadline.includes('through 2030') ||
                       deadline.includes('through 2032') ||
                       deadline.includes('through 2034') ||
                       deadline.includes('available through') ||
                       deadline.includes('long-term');
        if (!isDated) return false;
      }
    }
    
    // Filter by minimum amount
    if (filters.amount > 0) {
      const amountText = incentive.amount.toLowerCase();
      const filterAmount = filters.amount;
      
      // Enhanced numeric extraction for various amount formats
      const extractAmount = (text: string): number => {
        // Handle percentages, MW, exemptions - allow through
        if (text.includes('%') || text.includes('mw') || text.includes('free') || text.includes('exemption')) {
          return Number.MAX_SAFE_INTEGER;
        }
        
        // Extract numbers with multipliers (billion first, then million, then thousand)
        const billionMatch = text.match(/\$?([\d,\.]+)\s*billion/i);
        if (billionMatch) {
          return parseFloat(billionMatch[1].replace(/,/g, '')) * 1000000000;
        }
        
        const millionMatch = text.match(/\$?([\d,\.]+)\s*million/i);
        if (millionMatch) {
          return parseFloat(millionMatch[1].replace(/,/g, '')) * 1000000;
        }
        
        const thousandMatch = text.match(/\$?([\d,\.]+)\s*thousand/i);
        if (thousandMatch) {
          return parseFloat(thousandMatch[1].replace(/,/g, '')) * 1000;
        }
        
        // Handle per-unit rates (treat as representative amounts)
        const perKwhMatch = text.match(/\$?([\d\.]+)\s*per\s*kwh/i);
        if (perKwhMatch) {
          return parseFloat(perKwhMatch[1]) * 1000; // Scale up per-kWh rates
        }
        
        const perWattMatch = text.match(/\$?([\d\.]+)\s*per\s*watt/i);
        if (perWattMatch) {
          return parseFloat(perWattMatch[1]) * 1000; // Scale up per-watt rates
        }
        
        const perSqFtMatch = text.match(/\$?([\d\.]+)\s*per\s*sq\s*ft/i);
        if (perSqFtMatch) {
          return parseFloat(perSqFtMatch[1]) * 1000; // Scale up per-sq-ft rates
        }
        
        // Extract "Up to $X" amounts
        const upToMatch = text.match(/up\s+to\s+\$?([\d,]+)/i);
        if (upToMatch) {
          return parseFloat(upToMatch[1].replace(/,/g, ''));
        }
        
        // Extract plain dollar amounts
        const dollarMatch = text.match(/\$[\d,]+/);
        if (dollarMatch) {
          const numericPart = dollarMatch[0].replace(/[$,]/g, '');
          return parseFloat(numericPart);
        }
        
        // For non-dollar amounts, allow through
        return Number.MAX_SAFE_INTEGER;
      };
      
      const incentiveAmount = extractAmount(amountText);
      if (incentiveAmount < filterAmount) return false;
    }
    
    return true;
  });
  
  // Sort filtered incentives based on sortBy selection
  const sortedIncentives = [...filteredIncentives].sort((a, b) => {
    switch (sortBy) {
      case "amount-high":
        // Extract numeric amounts for comparison
        const extractAmount = (amountText: string): number => {
          const text = amountText.toLowerCase();
          
          // Handle percentage cases
          if (text.includes('%')) {
            const percentMatch = text.match(/([\d\.]+)%/);
            if (percentMatch) {
              return parseFloat(percentMatch[1]) * 1000; // Scale up percentages
            }
          }
          
          // Handle "per" unit rates
          const perMatch = text.match(/\$?([\d,\.]+)\s*per/i);
          if (perMatch) {
            return parseFloat(perMatch[1].replace(/,/g, '')) * 100; // Scale per-unit rates
          }
          
          // Handle "up to" amounts
          const upToMatch = text.match(/up\s+to\s+\$?([\d,\.]+)/i);
          if (upToMatch) {
            return parseFloat(upToMatch[1].replace(/,/g, ''));
          }
          
          // Handle millions/billions
          const millionMatch = text.match(/\$?([\d,\.]+)\s*million/i);
          if (millionMatch) {
            return parseFloat(millionMatch[1].replace(/,/g, '')) * 1000000;
          }
          
          const billionMatch = text.match(/\$?([\d,\.]+)\s*billion/i);
          if (billionMatch) {
            return parseFloat(billionMatch[1].replace(/,/g, '')) * 1000000000;
          }
          
          // Extract plain dollar amounts
          const dollarMatch = text.match(/\$?([\d,]+)/);
          if (dollarMatch) {
            return parseFloat(dollarMatch[1].replace(/,/g, ''));
          }
          
          return 0; // Default for non-numeric amounts
        };
        
        const amountA = extractAmount(a.amount);
        const amountB = extractAmount(b.amount);
        return amountB - amountA; // High to low
        
      case "deadline":
        // Sort by deadline, treating "Ongoing" as furthest future
        const getDeadlineValue = (deadline: string): number => {
          if (deadline.toLowerCase().includes('ongoing')) return Number.MAX_SAFE_INTEGER;
          if (deadline.toLowerCase().includes('permanent')) return Number.MAX_SAFE_INTEGER;
          
          // Try to extract year
          const yearMatch = deadline.match(/(\d{4})/);
          if (yearMatch) {
            return parseInt(yearMatch[1]);
          }
          
          // Try to extract month/day
          const dateMatch = deadline.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (dateMatch) {
            return new Date(parseInt(dateMatch[3]), parseInt(dateMatch[1]) - 1, parseInt(dateMatch[2])).getTime();
          }
          
          return 0;
        };
        
        return getDeadlineValue(a.deadline) - getDeadlineValue(b.deadline);
        
      case "updated":
        // Sort by recently updated (would need timestamp field, for now sort by name)
        return b.name.localeCompare(a.name);
        
      case "relevance":
      default:
        // Default relevance sort (by name alphabetically)
        return a.name.localeCompare(b.name);
    }
  });

  // Apply pagination to sorted results
  const totalIncentives = allIncentives || [];
  const filteredCount = sortedIncentives.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedIncentives = sortedIncentives.slice(startIndex, endIndex);
  
  // Pagination metadata
  const pagination = {
    page: currentPage,
    limit: pageSize,
    total: filteredCount,
    totalPages: Math.ceil(filteredCount / pageSize),
    hasNext: currentPage < Math.ceil(filteredCount / pageSize),
    hasPrev: currentPage > 1
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(parseInt(newSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Export filtered incentives to CSV
  const handleExportCSV = () => {
    const csvHeaders = [
      'Program Name',
      'Provider',
      'Level',
      'Amount Available',
      'Deadline/Status',
      'Project Types',
      'Description',
      'Requirements'
    ];

    const csvData = sortedIncentives.map(incentive => [
      `"${incentive.name}"`,
      `"${incentive.provider}"`,
      `"${incentive.level}"`,
      `"${incentive.amount}"`,
      `"${incentive.deadline}"`,
      `"${incentive.projectTypes.join(', ')}"`,
      `"${incentive.description || 'N/A'}"`,
      `"${incentive.requirements.join(', ') || 'N/A'}"`
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `incentives-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Government Incentives Database
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {totalIncentives.length} programs • {summaryData?.totalFunding || '$78.6B+'} in available funding
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Show:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-slate-600 dark:text-slate-400">per page</span>
            </div>
            <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar onFilterChange={handleFilterChange} incentives={allIncentives} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search incentives..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-6">
                <TabsTrigger value="all">All Incentives</TabsTrigger>
                <TabsTrigger value="federal">Federal</TabsTrigger>
                <TabsTrigger value="state">State</TabsTrigger>
                <TabsTrigger value="local">Local</TabsTrigger>
                <TabsTrigger value="utility">Utility</TabsTrigger>
                <TabsTrigger value="foundation">Foundation</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Results Info */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">{Math.min(endIndex, filteredCount)}</span> of{" "}
                <span className="font-medium">{filteredCount}</span> incentives
              </p>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
                    <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
                    <SelectItem value="updated">Recently Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Incentives Table */}
            <IncentivesTable 
              incentives={paginatedIncentives} 
              isLoading={isLoading}
            />
            
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i;
                      if (pageNum > pagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}