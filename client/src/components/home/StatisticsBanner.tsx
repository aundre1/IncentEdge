import { useQuery } from "@tanstack/react-query";
import { Database, DollarSign, TrendingUp, Clock, ArrowUpRight } from "lucide-react";
import { IncentivesSummary } from "@shared/types";

export default function StatisticsBanner() {
  const { data: summary, isLoading } = useQuery<IncentivesSummary>({
    queryKey: ['/api/incentives/summary'],
  });

  const stats = [
    {
      title: "Total Programs",
      value: summary?.totalPrograms || 0,
      icon: Database,
      color: "blue",
      description: "Active incentive programs",
      change: "+12%"
    },
    {
      title: "Available Funding",
      value: summary?.totalFunding || "$0",
      icon: DollarSign,
      color: "emerald",
      description: "Total funding pool",
      change: "+8.3%"
    },
    {
      title: "Average Value",
      value: summary?.avgIncentive || "$0",
      icon: TrendingUp,
      color: "purple",
      description: "Per project incentive",
      change: "+15.2%"
    },
    {
      title: "Expiring Soon",
      value: summary?.expiringCount || 0,
      icon: Clock,
      color: "orange",
      description: "Within 90 days",
      change: "-3"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6">
            <TrendingUp className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-semibold text-primary">Live Market Intelligence</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gradient">
            Real-Time Market Data
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade analytics and insights from comprehensive incentive tracking
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="group card-modern p-8 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 to-${stat.color}-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30 group-hover:bg-${stat.color}-500 transition-all duration-300`}>
                      <Icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:text-white transition-colors duration-300`} />
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <span className={`text-${stat.color === 'orange' ? 'red' : 'emerald'}-600 dark:text-${stat.color === 'orange' ? 'red' : 'emerald'}-400 font-medium`}>
                        {stat.change}
                      </span>
                      <ArrowUpRight className={`h-3 w-3 text-${stat.color === 'orange' ? 'red' : 'emerald'}-600 dark:text-${stat.color === 'orange' ? 'red' : 'emerald'}-400`} />
                    </div>
                  </div>

                  {/* Value */}
                  <div className="mb-4">
                    {isLoading ? (
                      <div className="h-10 bg-muted animate-pulse rounded-lg"></div>
                    ) : (
                      <div className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 border-2 border-${stat.color}-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="glass-effect rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to maximize your investment returns?</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Join institutional investors using our platform to identify and secure optimal incentive packages
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary-modern">
                Schedule Consultation
              </button>
              <button className="btn-secondary-modern">
                View Case Studies
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}