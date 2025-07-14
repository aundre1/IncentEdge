import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResourcesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Resources</h1>
      <p className="text-muted-foreground mb-8">
        Explore our library of resources to help you navigate sustainable building incentives.
      </p>
      
      <Tabs defaultValue="updates" className="mb-12">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
        </TabsList>
        
        <TabsContent value="updates" id="updates">
          <h2 className="text-2xl font-bold mb-6">Incentive Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Updates */}
            <Card>
              <CardHeader>
                <CardTitle>New Federal Tax Credits for Energy Storage</CardTitle>
                <CardDescription>May 15, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p>The IRS has released new guidance on qualifying for the enhanced energy storage tax credits under the Inflation Reduction Act.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Update</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>NYSERDA Increases Heat Pump Incentives</CardTitle>
                <CardDescription>April 28, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p>NYSERDA has announced a 20% increase in incentive rates for air source heat pumps in multifamily buildings.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Update</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Con Edison Extends Commercial Efficiency Program</CardTitle>
                <CardDescription>April 10, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Con Edison's Commercial & Industrial Energy Efficiency Program has been extended through 2026 with increased funding.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Update</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="guides" id="guides">
          <h2 className="text-2xl font-bold mb-6">Application Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Guides */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Guide to 179D Tax Deductions</CardTitle>
                <CardDescription>For Commercial Building Owners</CardDescription>
              </CardHeader>
              <CardContent>
                <p>A step-by-step guide to qualifying for and claiming the 179D Energy Efficient Commercial Buildings Tax Deduction.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Download Guide</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Navigating NYSERDA's Clean Heat Program</CardTitle>
                <CardDescription>For Multifamily Buildings</CardDescription>
              </CardHeader>
              <CardContent>
                <p>How to access incentives for heat pump installations in multifamily buildings through NYSERDA's Clean Heat Program.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Download Guide</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Maximizing Solar + Storage Incentives</CardTitle>
                <CardDescription>Federal, State and Utility Programs</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Learn how to stack multiple incentives for solar PV and battery storage systems to maximize financial benefits.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Download Guide</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="case-studies" id="case-studies">
          <h2 className="text-2xl font-bold mb-6">Case Studies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Manhattan Office Building Retrofit</CardTitle>
                <CardDescription>$1.2M in Incentives Secured</CardDescription>
              </CardHeader>
              <CardContent>
                <p>How a 250,000 sq ft office building in Midtown Manhattan secured over $1.2 million in incentives for a comprehensive energy efficiency retrofit.</p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
                  <li>HVAC system replacement</li>
                  <li>Lighting controls upgrade</li>
                  <li>Building envelope improvements</li>
                  <li>Rooftop solar installation</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Case Study</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Brooklyn Multifamily Electrification</CardTitle>
                <CardDescription>$850K in Incentives Secured</CardDescription>
              </CardHeader>
              <CardContent>
                <p>How a 120-unit multifamily building in Brooklyn secured $850,000 in incentives for a comprehensive electrification project.</p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
                  <li>Heat pump heating and cooling</li>
                  <li>Heat pump water heaters</li>
                  <li>Electric cooking conversion</li>
                  <li>Building envelope improvements</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Case Study</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Other tab content would be implemented similarly */}
        <TabsContent value="faq" id="faq">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How does IncentEdge's fee structure work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>We primarily operate on a success-based fee model, meaning we charge a percentage of the incentives we help you secure. This aligns our interests with yours and minimizes your upfront costs. For certain programs or services, we may charge fixed fees based on project complexity.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>How long does the incentive application process take?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Timeframes vary significantly depending on the program. Tax incentives like 179D can be claimed on tax returns. Rebate programs may take 4-12 weeks for processing. Grant programs can take 3-6 months from application to award. We provide detailed timelines for each program in our application planning process.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Can incentives be combined or "stacked"?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Yes, in many cases multiple incentives can be combined for the same project. For example, federal tax incentives can often be combined with state rebates and utility programs. However, specific rules vary by program. We specialize in identifying maximum-allowed incentive stacking opportunities to optimize your benefits.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="blog" id="blog">
          <h2 className="text-2xl font-bold mb-6">Blog Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blog content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>The Future of Building Electrification Incentives</CardTitle>
                <CardDescription>May 2, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p>An analysis of upcoming policy changes and funding opportunities for building electrification projects in New York State.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Post</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Five Overlooked Tax Incentives for Sustainable Buildings</CardTitle>
                <CardDescription>April 18, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Discover these lesser-known tax incentives that could significantly improve your project's financial performance.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Post</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Navigating Local Law 97 Compliance and Incentives</CardTitle>
                <CardDescription>April 5, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p>How NYC building owners can leverage incentives to achieve compliance with Local Law 97 carbon emissions requirements.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Read Post</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="webinars" id="webinars">
          <h2 className="text-2xl font-bold mb-6">Webinars & Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Webinar content would go here */}
            <Card>
              <CardHeader>
                <CardTitle>Maximizing IRA Incentives for Commercial Buildings</CardTitle>
                <CardDescription>Upcoming: June 15, 2025 • 2:00 PM ET</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Join our experts for a comprehensive overview of how commercial building owners can maximize incentives available through the Inflation Reduction Act.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Register Now</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>NYC Local Law 97: Compliance Strategies and Incentives</CardTitle>
                <CardDescription>Upcoming: June 28, 2025 • 11:00 AM ET</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Learn about cost-effective compliance strategies for NYC's carbon emissions law and the incentives available to help fund required upgrades.</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Register Now</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Heat Pump Incentives for Multifamily Buildings</CardTitle>
                <CardDescription>Recorded: May 5, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p>A comprehensive review of federal, state, and utility incentives available for heat pump installations in multifamily buildings.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Watch Recording</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Solar + Storage: Financial Analysis and Incentives</CardTitle>
                <CardDescription>Recorded: April 12, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Expert analysis of the financial benefits of combined solar and battery storage systems, including available incentives and financing options.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Watch Recording</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
