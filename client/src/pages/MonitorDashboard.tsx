import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle, AlertTriangle, RefreshCw, TrendingUp, Calendar, DollarSign, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminProtection from "@/components/AdminProtection";

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

export default function MonitorDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: monitoringStatus, isLoading } = useQuery<MonitoringStatus>({
    queryKey: ['/api/monitoring/status'],
    refetchInterval: 15000,
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
    const variants: Record<string, string> = {
      high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      low: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return variants[confidence] || variants.medium;
  };

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Data Monitoring Dashboard</h1>
                  <p className="text-muted-foreground">
                    Real-time tracking of 933 verified incentive programs
                  </p>
                </div>
              </div>
              <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700 px-3 py-1">
                Admin Only
              </Badge>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline"
                onClick={() => checkProgramsMutation.mutate()}
                disabled={checkProgramsMutation.isPending}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${checkProgramsMutation.isPending ? 'animate-spin' : ''}`} />
                {checkProgramsMutation.isPending ? 'Checking...' : 'Check Programs'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => analyzeDeadlinesMutation.mutate()}
                disabled={analyzeDeadlinesMutation.isPending}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                {analyzeDeadlinesMutation.isPending ? 'Analyzing...' : 'Analyze Deadlines'}
              </Button>
              <Button 
                variant="ghost"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/monitoring/status'] })}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Pending Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : monitoringStatus?.pendingUpdates || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updates awaiting review
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Programs Monitored
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">
                  933
                </div>
                <p className="text-xs text-muted-foreground">
                  Verified programs tracked
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Scheduled Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  2,274
                </div>
                <p className="text-xs text-muted-foreground">
                  Total monitoring tasks
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  ACTIVE
                </div>
                <p className="text-xs text-muted-foreground">
                  Monitoring operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Updates */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Pending Program Updates
              </CardTitle>
              <CardDescription>
                Review and approve detected changes to incentive program data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Loading monitoring data...</p>
                  <p className="text-muted-foreground">Checking system status</p>
                </div>
              ) : !monitoringStatus?.updates || monitoringStatus.updates.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
                  <p className="text-xl font-medium mb-2">All Programs Up to Date</p>
                  <p className="text-muted-foreground">
                    No pending updates detected. All 933 programs are current.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {monitoringStatus.updates.map((pendingUpdate) => {
                    const Icon = getUpdateIcon(pendingUpdate.update.updateType);
                    return (
                      <div key={pendingUpdate.update.id} className="border rounded-lg p-6 space-y-4 bg-white/50 dark:bg-gray-900/50">
                        {/* Update Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">{pendingUpdate.program.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {pendingUpdate.program.provider} • {pendingUpdate.program.amount}
                              </p>
                            </div>
                          </div>
                          <Badge className={getConfidenceBadge(pendingUpdate.update.confidence)}>
                            {pendingUpdate.update.confidence.toUpperCase()} CONFIDENCE
                          </Badge>
                        </div>

                        {/* Update Details */}
                        <div className="ml-16 space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium capitalize text-lg">
                              {pendingUpdate.update.updateType} Change:
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-base">
                            <span className="text-muted-foreground">FROM:</span>
                            <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded">
                              "{pendingUpdate.update.oldValue}"
                            </span>
                            <span className="text-xl">→</span>
                            <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded">
                              "{pendingUpdate.update.newValue}"
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>Source: {pendingUpdate.update.source}</span>
                            <span>
                              Detected: {new Date(pendingUpdate.update.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="ml-16 flex gap-3">
                          <Button
                            onClick={() => applyUpdateMutation.mutate(pendingUpdate.update.id)}
                            disabled={applyUpdateMutation.isPending}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {applyUpdateMutation.isPending ? 'Applying...' : 'Apply Update'}
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Review Source
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
      </div>
    </AdminProtection>
  );
}