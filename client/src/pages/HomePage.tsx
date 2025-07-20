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
import ProgramDistributionChart from "@/components/charts/ProgramDistributionChart";
import TechnologyDistributionChart from "@/components/charts/TechnologyDistributionChart";
import { IncentivesSummary } from "@shared/types";

export default function HomePage() {
  const { data: summary, isLoading } = useQuery<IncentivesSummary>({
    queryKey: ["/api/incentives/summary"],
  });

  const programDistribution = summary?.programDistribution || {
    federal: 32,
    state: 45,
    local: 18,
    utility: 12,
    foundation: 4
  };

  const technologyDistribution = summary?.technologyDistribution || {
    efficiency: 42,
    renewable: 28,
    hvac: 22,
    storage: 15,
    ev: 8,
    research: 6
  };

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
                  Access our database of 2,240+ incentives across federal, state, local, utility, and foundation levels.
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
      
      <section className="py-12 bg-white dark:bg-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Incentive Distribution Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Program Distribution by Level</CardTitle>
                <CardDescription>
                  Breakdown of incentives by government level
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ProgramDistributionChart data={programDistribution} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Program Distribution by Technology</CardTitle>
                <CardDescription>
                  Breakdown of incentives by technology type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <TechnologyDistributionChart data={technologyDistribution} />
              </CardContent>
            </Card>
          </div>
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
