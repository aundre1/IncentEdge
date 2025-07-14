import { Search, File, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function WhyUseSection() {
  return (
    <div className="bg-white dark:bg-neutral-800 shadow-sm rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-medium leading-6 text-foreground">Why Use IncentEdge?</h3>
      </div>
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="text-foreground font-medium mb-2">Discover Hidden Incentives</h4>
            <p className="text-muted-foreground text-sm">
              We uncover lesser-known funding opportunities that most developers miss.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mb-4">
              <File className="h-6 w-6" />
            </div>
            <h4 className="text-foreground font-medium mb-2">Success-Based Fees</h4>
            <p className="text-muted-foreground text-sm">
              We only charge when you successfully secure funding for your projects.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-4">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h4 className="text-foreground font-medium mb-2">End-to-End Support</h4>
            <p className="text-muted-foreground text-sm">
              From application to funding, we handle all the paperwork and follow-up.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/contact">Book a Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
