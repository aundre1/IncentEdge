import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Settings,
  Eye,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AdminProtection from "@/components/AdminProtection";
import type { ScraperJobSummary, ScraperJob, ScrapedIncentive } from "@shared/types";

export default function AdminScraperPage() {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch scraper summary
  const { data: summary, isLoading: summaryLoading } = useQuery<ScraperJobSummary>({
    queryKey: ["/api/scraper/summary"],
    refetchInterval: 5000,
  });

  // Fetch scraper jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery<{ jobs: ScraperJob[]; total: number }>({
    queryKey: ["/api/scraper/jobs"],
    refetchInterval: 10000,
  });

  // Fetch scraped data for selected job
  const { data: scrapedData } = useQuery<ScrapedIncentive[]>({
    queryKey: ["/api/scraper/data", selectedJobId],
    enabled: !!selectedJobId && showResults,
  });

  // Start scraping mutation
  const startScrapingMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/scraper/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sources: selectedSources,
          immediate: true 
        }),
      });
      if (!response.ok) throw new Error("Failed to start scraping");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scraping Started",
        description: `Started scraping ${selectedSources.length} sources`,
      });
      setSelectedSources([]);
      queryClient.invalidateQueries({ queryKey: ["/api/scraper/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scraper/jobs"] });
    },
    onError: (error) => {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sourcesConfig = [
    { id: "irs", name: "IRS Tax Credits", category: "federal" },
    { id: "doe", name: "Department of Energy", category: "federal" },
    { id: "nyserda", name: "NYSERDA Programs", category: "state" },
    { id: "hud", name: "HUD Housing Programs", category: "federal" },
    { id: "epa_greenhouse", name: "EPA Greenhouse Gas", category: "federal" },
    { id: "cdfi", name: "CDFI Fund", category: "federal" },
    { id: "dsire", name: "DSIRE Database", category: "federal" },
  ];

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-600" />;
      case "running": return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200", 
      running: "bg-blue-100 text-blue-800 border-blue-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200"
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  if (summaryLoading || jobsLoading) {
    return (
      <AdminProtection>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-blue-600" />
              Admin: AI Scraper Control
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Technical interface for managing government data scraping operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin/monitoring'}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Data Monitoring
            </Button>
            <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700 px-3 py-1">
              Admin Only
            </Badge>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalJobs || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary?.activeJobs || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary?.completedJobs || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary?.failedJobs || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="control" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="control">Scraping Control</TabsTrigger>
            <TabsTrigger value="jobs">Job History</TabsTrigger>
            <TabsTrigger value="data">Scraped Data</TabsTrigger>
          </TabsList>

          {/* Scraping Control Tab */}
          <TabsContent value="control" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Start New Scraping Job</CardTitle>
                <CardDescription>
                  Select sources to scrape for new government incentive data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sourcesConfig.map((source) => (
                    <div key={source.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={source.id}
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={() => handleSourceToggle(source.id)}
                      />
                      <div className="flex-1">
                        <label htmlFor={source.id} className="text-sm font-medium cursor-pointer">
                          {source.name}
                        </label>
                        <div className="text-xs text-muted-foreground capitalize">
                          {source.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => startScrapingMutation.mutate()}
                    disabled={selectedSources.length === 0 || startScrapingMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    {startScrapingMutation.isPending ? "Starting..." : "Start Scraping"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSources(sourcesConfig.map(s => s.id))}
                  >
                    Select All
                  </Button>
                  
                  <Button
                    variant="outline" 
                    onClick={() => setSelectedSources([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job History Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Recent Jobs
                  <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobsData?.jobs?.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(job.status)}
                        <div>
                          <div className="font-medium">Job #{job.id}</div>
                          <div className="text-sm text-muted-foreground">
                            Sources: {job.source} • Started: {new Date(job.startedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={getStatusBadge(job.status)}>
                            {job.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {job.recordsImported || 0} records
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedJobId(job.id);
                              setShowResults(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scraped Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Scraped Data Viewer</CardTitle>
                <CardDescription>
                  View raw data extracted from government sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedJobId && scrapedData ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Showing data from Job #{selectedJobId} ({scrapedData.length} records)
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {scrapedData.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg text-sm">
                          <div className="font-medium">{item.extractedData.name || 'Unnamed Program'}</div>
                          <div className="text-muted-foreground">
                            Provider: {item.extractedData.provider || 'Unknown'} | 
                            Amount: {item.extractedData.amount || 'Not specified'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a job from the Job History tab to view scraped data
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AdminProtection>
  );
}