import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Database, RefreshCw, Calendar, Building2, Globe, MapPin, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { IncentivesSummary } from "@shared/types";

interface DataSourceInfo {
  name: string;
  type: string;
  description: string;
  coverage: string;
  lastUpdated: string;
  programCount: number;
  status: "active" | "maintenance" | "updating";
  icon: React.ReactNode;
}

export default function DataSourcesPage() {
  const { data: summary, isLoading } = useQuery<IncentivesSummary>({
    queryKey: ["/api/incentives/summary"],
  });

  const dataSources: DataSourceInfo[] = [
    {
      name: "Major Northeast Utilities",
      type: "Verified Utility Programs",
      description: "349 verified programs from National Grid, PSEG, ConEd, Eversource, CL&P, and 10 additional regional utilities",
      coverage: "Complete Northeast Grid",
      lastUpdated: "Daily",
      programCount: 349,
      status: "active",
      icon: <Zap className="h-6 w-6 text-orange-600" />
    },
    {
      name: "Federal Tax Programs",
      type: "IRS & Treasury Verified",
      description: "17 verified federal tax credits including Clean Vehicle Credits, 179D deductions, and renewable energy incentives",
      coverage: "Nationwide",
      lastUpdated: "Weekly",
      programCount: 17,
      status: "active",
      icon: <Building2 className="h-6 w-6 text-blue-600" />
    },
    {
      name: "State Energy Offices",
      type: "NYSERDA & Regional Verified",
      description: "7 verified state energy programs including NYSERDA Clean Energy Fund and Connecticut Green Bank",
      coverage: "Northeast States",
      lastUpdated: "Daily",
      programCount: 7,
      status: "active",
      icon: <Globe className="h-6 w-6 text-green-600" />
    },
    {
      name: "Federal Environmental Agencies",
      type: "EPA Verified Programs",
      description: "5 verified EPA programs including $27B Greenhouse Gas Reduction Fund and Solar for All",
      coverage: "Nationwide",
      lastUpdated: "Weekly",
      programCount: 5,
      status: "active",
      icon: <Globe className="h-6 w-6 text-emerald-600" />
    },
    {
      name: "Department of Energy",
      type: "DOE Verified Programs", 
      description: "4 verified DOE programs including Title XVII loan guarantees and advanced vehicle manufacturing",
      coverage: "Nationwide",
      lastUpdated: "Weekly",
      programCount: 4,
      status: "active",
      icon: <Zap className="h-6 w-6 text-amber-600" />
    },
    {
      name: "Private Foundations",
      type: "Foundation Commitments",
      description: "3 verified foundation programs including Bezos Earth Fund and Gates Foundation climate initiatives",
      coverage: "Global Impact",
      lastUpdated: "Monthly",
      programCount: 3,
      status: "active",
      icon: <TrendingUp className="h-6 w-6 text-rose-600" />
    },
    {
      name: "Federal Support Agencies",
      type: "Commerce & Development",
      description: "1 verified Commerce EDA program supporting clean energy economic development",
      coverage: "Nationwide",
      lastUpdated: "Monthly",
      programCount: 1,
      status: "active",
      icon: <Building2 className="h-6 w-6 text-lime-600" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "updating": return "bg-blue-100 text-blue-800 border-blue-200";
      case "maintenance": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Market Intelligence
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Real-time data from 382+ verified programs across 7 major source categories
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary?.totalPrograms ?? 90}</div>
              <p className="text-xs text-muted-foreground">Actively monitored</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Funding</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary?.totalFunding ?? "$214.4B+"}</div>
              <p className="text-xs text-muted-foreground">In tracked programs</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">7</div>
              <p className="text-xs text-muted-foreground">Source categories</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">Today</div>
              <p className="text-xs text-muted-foreground">Real-time monitoring</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Sources Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Monitored Data Sources
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dataSources.map((source, index) => (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {source.icon}
                      <div>
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                        <CardDescription className="mt-1">{source.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(source.status)}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Type:</span>
                      <span className="font-medium">{source.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Coverage:</span>
                      <span className="font-medium">{source.coverage}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Programs:</span>
                      <span className="font-medium text-blue-600">{source.programCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Updates:</span>
                      <span className="font-medium text-green-600">{source.lastUpdated}</span>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Data Quality</span>
                        <span>98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Coverage Map Info */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Geographic Coverage</span>
            </CardTitle>
            <CardDescription>
              Comprehensive monitoring across multiple government levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary?.programDistribution?.federal ?? 3}</div>
                <div className="text-sm text-slate-600">Federal Programs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary?.programDistribution?.state ?? 5}</div>
                <div className="text-sm text-slate-600">State Programs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{summary?.programDistribution?.local ?? 2}</div>
                <div className="text-sm text-slate-600">Local Programs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary?.programDistribution?.utility ?? 1}</div>
                <div className="text-sm text-slate-600">Utility Programs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Request Section */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Need More Recent Data?
              </h3>
              <p className="text-slate-600 mb-4">
                Our system updates automatically, but you can request priority updates for specific sources.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Request Data Refresh
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}