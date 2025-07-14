import IncentiveCalculator from "@/components/calculator/IncentiveCalculator";
import WhyUseSection from "@/components/common/WhyUseSection";

export default function CalculatorPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Incentive Calculator</h1>
        
        <p className="text-muted-foreground mb-8">
          Our calculator helps you estimate potential incentives for your sustainable building project. 
          Enter your project details below to get an instant estimate of available incentives.
        </p>
        
        <IncentiveCalculator />
        
        <div className="mt-12">
          <WhyUseSection />
        </div>
        
        <div className="mt-12 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">How Our Calculator Works</h2>
          
          <p className="text-muted-foreground mb-4">
            The IncentEdge calculator uses data from our comprehensive incentives database to estimate 
            the potential financial benefits available for your project. Here's how it works:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>We analyze your project type, size, and budget</li>
            <li>Our algorithm identifies applicable incentives based on your project parameters</li>
            <li>We calculate estimated amounts based on current program rules and requirements</li>
            <li>The results show both total potential incentives and a breakdown by program</li>
          </ol>
          
          <p className="mt-4 text-sm text-muted-foreground">
            <strong>Note:</strong> This calculator provides estimates only. Actual incentive amounts may vary 
            based on specific project details, application timing, and program funding availability. 
            Contact our team for a detailed analysis tailored to your project.
          </p>
        </div>
      </div>
    </div>
  );
}
