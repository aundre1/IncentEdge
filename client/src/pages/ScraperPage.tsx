import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Play, 
  RefreshCw, 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  Download,
  Eye
} from "lucide-react";
import { ScraperJobSummary, ScrapingRequest } from "@shared/types";
import { apiRequest } from "@/lib/queryClient";

export default function ScraperPage() {
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [showYAMLGenerator, setShowYAMLGenerator] = useState(false);
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const viewScrapedData = (jobId: number) => {
    setSelectedJobId(jobId);
    setShowResults(true);
  };

  // Fetch scraped data for a specific job
  const { data: scrapedData, isLoading: scrapedDataLoading, error: scrapedDataError } = useQuery({
    queryKey: ['/api/scraper/data', selectedJobId],
    queryFn: () => fetch(`/api/scraper/data?jobId=${selectedJobId}`).then(res => res.json()),
    enabled: !!selectedJobId && showResults,
  });

  console.log('Scraped data query:', { selectedJobId, showResults, scrapedData, scrapedDataError });
  
  // Debug log to see the actual data structure
  if (scrapedData && scrapedData.length > 0) {
    console.log('First scraped item structure:', scrapedData[0]);
    console.log('Raw data field:', scrapedData[0]?.rawData);
  }

  // Fetch scraper summary
  const { data: summary, isLoading: summaryLoading } = useQuery<ScraperJobSummary>({
    queryKey: ['/api/scraper/summary'],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Fetch scraper jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['/api/scraper/jobs'],
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Trigger scraping mutation
  const triggerScraping = useMutation({
    mutationFn: async (request: ScrapingRequest) => 
      apiRequest('/api/scraper/trigger', 'POST', request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraper'] });
      setSelectedSources([]);
    },
  });

  // Generate YAML config mutation
  const generateYAML = useMutation({
    mutationFn: async (data: { url: string; name: string }) => 
      apiRequest('/api/scraper/yaml/generate', 'POST', data),
    onSuccess: () => {
      setShowYAMLGenerator(false);
      setNewSiteUrl('');
      setNewSiteName('');
      queryClient.invalidateQueries({ queryKey: ['/api/scraper'] });
    },
  });

  const availableSources = [
    { id: 'federal', name: 'Federal Programs', description: 'IRS, DOE, and other federal agencies' },
    { id: 'state', name: 'State Programs', description: 'NYSERDA and NY state incentives' },
    { id: 'local', name: 'Local Programs', description: 'NYC and municipal incentives' },
    { id: 'utility', name: 'Utility Programs', description: 'Con Edison and utility rebates' },
  ];

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleTriggerScraping = () => {
    if (selectedSources.length === 0) return;
    
    triggerScraping.mutate({
      sources: selectedSources,
      immediate: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Data Scraper</h1>
          <p className="text-muted-foreground mt-2">Live government incentive data collection and processing</p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configure Sources
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
              <p className="text-3xl font-bold">{summary?.totalJobs || 0}</p>
            </div>
            <Database className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
              <p className="text-3xl font-bold text-blue-600">{summary?.activeJobs || 0}</p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-green-600">{summary?.completedJobs || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="card-modern p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed</p>
              <p className="text-3xl font-bold text-red-600">{summary?.failedJobs || 0}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Scraping Controls */}
      <Card className="card-modern p-8">
        <h2 className="text-2xl font-semibold mb-6">Start New Scraping Job</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {availableSources.map((source) => (
            <div
              key={source.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                selectedSources.includes(source.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleSourceToggle(source.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{source.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
                </div>
                {selectedSources.includes(source.id) && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleTriggerScraping}
            disabled={selectedSources.length === 0 || triggerScraping.isPending}
            className="btn-primary-modern"
          >
            {triggerScraping.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Start Scraping
          </Button>
          
          <p className="text-sm text-muted-foreground">
            {selectedSources.length === 0 
              ? 'Select sources to begin scraping'
              : `${selectedSources.length} source${selectedSources.length === 1 ? '' : 's'} selected`
            }
          </p>
        </div>
      </Card>

      {/* Recent Jobs */}
      <Card className="card-modern">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Jobs</h2>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {jobsLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job ID</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary?.recentJobs?.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-mono">#{job.id}</TableCell>
                  <TableCell className="capitalize">{job.source}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{new Date(job.startedAt).toLocaleString()}</TableCell>
                  <TableCell>{job.recordsImported.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          fetch(`/api/scraper/jobs/${job.id}/logs`)
                            .then(res => {
                              if (!res.ok) throw new Error(`HTTP ${res.status}`);
                              return res.json();
                            })
                            .then(data => {
                              console.log(`=== JOB #${job.id} DETAILED LOGS ===`);
                              console.log('Job Status:', data.job?.status);
                              console.log('Started At:', data.job?.startedAt);
                              console.log('Completed At:', data.job?.completedAt);
                              console.log('Records Imported:', data.job?.recordsImported);
                              console.log('\n--- SCRAPER OUTPUT ---');
                              console.log(data.job?.results?.output || 'No output available');
                              console.log('\n--- ERROR DETAILS ---');
                              console.log(data.job?.results?.error || 'No errors reported');
                              console.log('\n--- SCRAPED DATA ---');
                              console.log(data.job?.results?.data || 'No data extracted');
                              console.log('================================');
                              alert(`✓ Job #${job.id} logs printed to console\n\nPress F12 → Console tab to view detailed output, errors, and scraped data.`);
                            })
                            .catch(err => {
                              console.error('Failed to fetch logs:', err);
                              alert('✗ Failed to fetch logs - check browser console for details.');
                            });
                        }}
                        title="View detailed job logs in browser console"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewScrapedData(job.id)}
                        title="View extracted data from this job"
                      >
                        <Database className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No scraping jobs found. Start your first job above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-6xl w-full max-h-[80vh] overflow-auto mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scraped Results - Job {selectedJobId}</h3>
              <Button variant="ghost" onClick={() => setShowResults(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            {scrapedDataLoading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading scraped data...</span>
              </div>
            ) : scrapedData && scrapedData.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found {scrapedData.length} scraped records for Job #{selectedJobId}
                </p>
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {scrapedData.map((item: any, index: number) => {
                    // Parse the rawData field properly
                    const data = item.rawData || item.raw_data || item;
                    return (
                      <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                              {data.title || data.name || 'Government Incentive Program'}
                            </h4>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {item.source || 'Government'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-blue-600 min-w-[80px]">Provider:</span> 
                              <span className="text-gray-700 dark:text-gray-300">{data.provider || 'Government Agency'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-green-600 min-w-[80px]">Amount:</span> 
                              <span className="text-gray-700 dark:text-gray-300 font-medium">{data.funding_amount || data.amount || 'Contact for details'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-orange-600 min-w-[80px]">Deadline:</span> 
                              <span className="text-gray-700 dark:text-gray-300">{data.deadline || 'Ongoing program'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-purple-600 min-w-[80px]">Project Types:</span> 
                              <span className="text-gray-700 dark:text-gray-300">{data.project_types || 'Multiple technologies'}</span>
                            </div>
                          </div>
                          {data.eligibility && (
                            <div className="text-sm">
                              <span className="font-medium">Eligibility:</span> 
                              <span className="ml-2 text-gray-600">{data.eligibility}</span>
                            </div>
                          )}
                          {data.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                              {data.description}
                            </p>
                          )}
                          {(data.url || item.source_url) && (
                            <a 
                              href={data.url || item.source_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Official Program Details →
                            </a>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-2">No scraped data found for this job.</p>
                <p className="text-sm text-gray-400">
                  The scraper may have completed but encountered issues saving data to the database.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}