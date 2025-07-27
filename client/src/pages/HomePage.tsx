import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import HeroSection from "@/components/home/HeroSection";
import StatisticsBanner from "@/components/home/StatisticsBanner";
import WhyUseSection from "@/components/common/WhyUseSection";
import FundingTimelineChart from "@/components/charts/FundingTimelineChart";
import OpportunityHeatmapChart from "@/components/charts/OpportunityHeatmapChart";
import IncentiveROIChart from "@/components/charts/IncentiveROIChart";
import { IncentivesSummary } from "@shared/types";

export default function HomePage() {
  const { data: summary, isLoading } = useQuery<IncentivesSummary>({
    queryKey: ["/api/incentives/summary"],
  });



  return (
    <>
      <HeroSection />
      <StatisticsBanner />
      
      <section className="py-12 bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Maximize Your Sustainable Building Incentives</h2>
            <p className="text-muted-foreground text-lg">
              IncentEdge helps property owners and developers navigate the complex landscape of grants, tax credits, and rebates for sustainable building projects.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Comprehensive Database</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access our comprehensive database of 907 verified active incentives across federal, state, local, utility, and foundation levels.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/incentives">Browse Incentives</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-white dark:bg-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Calculate Your Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our custom calculator helps you estimate potential incentives based on your project specifications.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/calculator">Try Calculator</Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-white dark:bg-neutral-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our team of specialists handles the entire application process to maximize your incentives.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white dark:bg-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Market Intelligence & Investment Analysis</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Real-time insights into funding opportunities, market trends, and projected returns for sustainable building investments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200">Funding Growth Timeline</CardTitle>
                <CardDescription>
                  Historical and projected funding availability across program levels
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <FundingTimelineChart />
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="text-emerald-800 dark:text-emerald-200">Sector Opportunity Matrix</CardTitle>
                <CardDescription>
                  Funding opportunities by building sector and timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <OpportunityHeatmapChart />
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-purple-800 dark:text-purple-200">Investment ROI Analysis</CardTitle>
              <CardDescription>
                Return on investment and payback periods for different sustainable building projects
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <IncentiveROIChart />
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="py-12 bg-neutral-50 dark:bg-neutral-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <WhyUseSection />
        </div>
      </section>
      
      <section className="py-12 bg-primary-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Maximize Your Incentives?</h2>
            <p className="text-xl opacity-80 mb-8">
              Join property owners who have secured millions in sustainable building incentives.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 max-w-xs"
              />
              <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90">
                Get Started
              </Button>
            </div>
            
            <p className="text-sm opacity-70">
              We'll send you information about available incentives for your property type.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
