import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle, AlertTriangle, RefreshCw, Database, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PendingUpdate {
  update: {
    id: number;
    updateType: string;
    oldValue: string;
    newValue: string;
    confidence: string;
    source: string;
    createdAt: string;
  };
  program: {
    id: number;
    name: string;
    provider: string;
    amount: string;
    deadline: string;
  };
}

interface MonitoringStatus {
  pendingUpdates: number;
  updates: PendingUpdate[];
}

export default function DataMonitoringPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: monitoringStatus, isLoading } = useQuery<MonitoringStatus>({
    queryKey: ['/api/monitoring/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const setupMonitoringMutation = useMutation({
    mutationFn: () => apiRequest('/api/monitoring/setup', 'POST'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Monitoring schedule set up successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/status'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to setup monitoring schedule",
        variant: "destructive",
      });
    },
  });

  const checkProgramsMutation = useMutation({
    mutationFn: () => apiRequest('/api/monitoring/check', 'POST'),
    onSuccess: (data: any) => {
      toast({
        title: "Check Complete",
        description: `Checked ${data.checkedCount} programs`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/status'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check programs",
        variant: "destructive",
      });
    },
  });

  const applyUpdateMutation = useMutation({
    mutationFn: (updateId: number) => apiRequest(`/api/monitoring/update/${updateId}/apply`, 'POST'),
    onSuccess: () => {
      toast({
        title: "Update Applied",
        description: "Program data updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/status'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply update",
        variant: "destructive",
      });
    },
  });

  const analyzeDeadlinesMutation = useMutation({
    mutationFn: () => apiRequest('/api/monitoring/analyze-deadlines', 'POST'),
    onSuccess: () => {
      toast({
        title: "Analysis Complete",
        description: "Deadline analysis completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/monitoring/status'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze deadlines",
        variant: "destructive",
      });
    },
  });

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'deadline': return Calendar;
      case 'amount': return DollarSign;
      case 'status': return CheckCircle;
      default: return Database;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return variants[confidence as keyof typeof variants] || variants.medium;
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Data Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time tracking of program deadlines and incentive amounts
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => setupMonitoringMutation.mutate()}
            disabled={setupMonitoringMutation.isPending}
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Setup Monitoring
          </Button>
          <Button 
            variant="outline"
            onClick={() => checkProgramsMutation.mutate()}
            disabled={checkProgramsMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${checkProgramsMutation.isPending ? 'animate-spin' : ''}`} />
            Check Programs
          </Button>
          <Button 
            variant="outline"
            onClick={() => analyzeDeadlinesMutation.mutate()}
            disabled={analyzeDeadlinesMutation.isPending}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Analyze Deadlines
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Pending Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : monitoringStatus?.pendingUpdates || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Updates awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Monitoring Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              408
            </div>
            <p className="text-xs text-muted-foreground">
              High-confidence programs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Next Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              24h
            </div>
            <p className="text-xs text-muted-foreground">
              Until next automated check
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Pending Updates
          </CardTitle>
          <CardDescription>
            Review and approve detected changes to program data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading updates...</p>
            </div>
          ) : monitoringStatus?.updates.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
              <p className="text-lg font-medium mb-2">All Up to Date</p>
              <p className="text-muted-foreground">
                No pending updates at this time. All program data is current.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {monitoringStatus?.updates.map((pendingUpdate) => {
                const Icon = getUpdateIcon(pendingUpdate.update.updateType);
                return (
                  <div key={pendingUpdate.update.id} className="border rounded-lg p-4 space-y-3">
                    {/* Update Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{pendingUpdate.program.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {pendingUpdate.program.provider}
                          </p>
                        </div>
                      </div>
                      <Badge className={getConfidenceBadge(pendingUpdate.update.confidence)}>
                        {pendingUpdate.update.confidence} confidence
                      </Badge>
                    </div>

                    {/* Update Details */}
                    <div className="ml-11 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium capitalize">
                          {pendingUpdate.update.updateType} Update:
                        </span>
                        <span className="text-muted-foreground">
                          from "{pendingUpdate.update.oldValue}"
                        </span>
                        <span>→</span>
                        <span className="font-medium">
                          "{pendingUpdate.update.newValue}"
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {pendingUpdate.update.source}</span>
                        <span>
                          Detected: {new Date(pendingUpdate.update.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-11 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => applyUpdateMutation.mutate(pendingUpdate.update.id)}
                        disabled={applyUpdateMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Apply Update
                      </Button>
                      <Button size="sm" variant="outline">
                        Review Manually
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}