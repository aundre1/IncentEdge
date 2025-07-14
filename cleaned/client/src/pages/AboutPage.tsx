import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About IncentEdge</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="lead text-xl text-muted-foreground mb-8">
            IncentEdge helps property owners and developers navigate the complex landscape of 
            sustainable building incentives, maximizing their financial benefits while 
            contributing to a greener future.
          </p>
          
          <h2>Our Mission</h2>
          <p>
            Our mission is to accelerate sustainable building development by making incentive 
            programs more accessible and easier to navigate. We believe that financial 
            barriers should not stand in the way of creating energy-efficient, 
            environmentally-friendly buildings.
          </p>
          
          <h2>What We Do</h2>
          <p>
            IncentEdge provides a comprehensive solution for property owners and developers 
            seeking to leverage available incentives for sustainable building projects. 
            Our services include:
          </p>
          
          <ul>
            <li>Maintaining the most comprehensive database of incentives across federal, state, local, utility, and foundation levels</li>
            <li>Providing detailed analytics and estimation tools to quantify potential benefits</li>
            <li>Offering end-to-end application management with success-based fees</li>
            <li>Delivering expert guidance to maximize incentive stacking and compliance</li>
          </ul>
          
          <h2>Our Team</h2>
          <p>
            Our team consists of experts in sustainable building incentives, energy 
            policy, tax credits, grants, and rebate programs. With backgrounds in 
            energy engineering, finance, tax, and policy, we bring together the 
            diverse expertise needed to navigate this complex landscape.
          </p>
          
          <h2>Our Approach</h2>
          <p>
            Unlike traditional consultants who charge high upfront fees, IncentEdge 
            operates primarily on a success-based model. We only charge when we 
            successfully help you secure incentives, aligning our interests with yours.
          </p>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg my-8">
            <h3 className="text-xl font-bold mb-4">Ready to maximize your incentives?</h3>
            <p className="mb-4">
              Whether you're planning a new development or retrofitting an existing property, 
              our team is ready to help you navigate the incentive landscape.
            </p>
            <Button asChild>
              <Link href="/contact">Contact Us Today</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
