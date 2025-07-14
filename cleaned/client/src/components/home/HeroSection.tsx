import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Building2, Calculator } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IncentivesSummary } from "@shared/types";

export default function HeroSection() {
  const { data: summary, isLoading } = useQuery<IncentivesSummary>({
    queryKey: ["/api/incentives/summary"],
  });

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Premium Background with Glass Morphism */}
      <div className="absolute inset-0 gradient-dark"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500 rounded-full filter blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
             backgroundSize: '50px 50px'
           }}>
      </div>

      <div className="container relative z-10 mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 animate-slide-up">
            {/* Executive Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 glass-effect rounded-full">
              <TrendingUp className="h-4 w-4 text-emerald-400 mr-2" />
              <span className="text-sm font-semibold text-white">Professional Investment Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Maximize</span>
              <br />
              <span className="text-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Real Estate ROI
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Access comprehensive sustainable building incentives, grants, and tax credits. 
              Professional-grade analytics for institutional investors and developers.
            </p>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {isLoading ? "..." : summary?.totalFunding || "$2.8B+"}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Available Funding</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {isLoading ? "..." : `${summary?.totalPrograms || 0}+`}
                </div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Active Programs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">35%</div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Avg. Cost Reduction</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="group bg-white text-black hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold shadow-modern hover:shadow-modern-hover transition-all duration-300">
                <Link href="/calculator" className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculate ROI
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Link href="/incentives" className="inline-flex items-center justify-center group border-2 border-white/30 text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-xl font-semibold backdrop-blur-sm transition-all duration-300 text-base">
                <Building2 className="h-5 w-5 mr-2" />
                View Programs
              </Link>
            </div>
          </div>

          {/* Right Content - Stats Dashboard */}
          <div className="lg:col-span-5 animate-fade-in delay-300">
            <div className="glass-effect rounded-2xl p-8 shadow-modern">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Live Market Data</h3>
                <p className="text-gray-400 text-sm">Real-time incentive tracking</p>
              </div>
              
              {/* Mini Dashboard */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Federal Programs</span>
                  </div>
                  <span className="text-green-400 font-semibold">
                    {isLoading ? "..." : `${summary?.programDistribution.federal || 0} Active`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">State Incentives</span>
                  </div>
                  <span className="text-blue-400 font-semibold">
                    {isLoading ? "..." : `${summary?.programDistribution.state || 0} Available`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Local Programs</span>
                  </div>
                  <span className="text-purple-400 font-semibold">
                    {isLoading ? "..." : `${summary?.programDistribution.local || 0} Open`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Utility Rebates</span>
                  </div>
                  <span className="text-orange-400 font-semibold">
                    {isLoading ? "..." : `${summary?.programDistribution.utility || 0} Ongoing`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Foundation Programs</span>
                  </div>
                  <span className="text-pink-400 font-semibold">
                    {isLoading ? "..." : `${summary?.programDistribution.foundation || 0} Available`}
                  </span>
                </div>
              </div>

              {/* Quick Action */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <Link href="/incentives">
                  <Button className="w-full bg-gradient-primary text-white hover:opacity-90 transition-opacity rounded-lg py-3 font-semibold">
                    Access Full Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}