import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getStatusClass, getLevelClass } from "@/lib/utils";
import { Incentive } from "@shared/types";

interface IncentiveDetailsProps {
  id: string;
}

export default function IncentiveDetails({ id }: IncentiveDetailsProps) {
  const { data: incentive, isLoading, error } = useQuery<Incentive>({
    queryKey: [`/api/incentives/${id}`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          </div>
          <div className="mt-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !incentive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Incentive</CardTitle>
          <CardDescription>
            We couldn't load the details for this incentive. Please try again.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild>
            <Link href="/incentives">Back to Incentives</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header section with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-t-2xl p-8 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={cn("px-3 py-1 rounded-full text-xs font-semibold", getLevelClass(incentive.level))}>
              {incentive.level}
            </Badge>
            <Badge className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusClass(incentive.deadline))}>
              {incentive.deadline}
            </Badge>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-3">{incentive.name}</h1>
          <p className="text-blue-100 mb-4">{incentive.provider}</p>
          
          <div className="flex items-center">
            <div className="text-xl font-bold text-white bg-white/10 px-4 py-2 rounded-lg">
              {incentive.amount}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-lg border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {/* Description section */}
        <div className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">About This Incentive</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {incentive.description}
          </p>
        </div>
        
        {/* Project types section */}
        <div className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Qualifying Projects</h2>
          <div className="flex flex-wrap gap-2">
            {incentive.projectTypes.map((type, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-3 py-1 rounded-full text-sm"
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Requirements section */}
        <div className="p-6 md:p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Requirements</h2>
          <ul className="space-y-3">
            {incentive.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="ml-2 text-gray-700 dark:text-gray-300">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* How we can help section */}
        <div className="p-6 md:p-8 bg-blue-50 dark:bg-blue-900/10">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm-4.34 7.964a.75.75 0 01-1.061-1.06 5.236 5.236 0 013.73-1.538 5.236 5.236 0 013.695 1.538.75.75 0 11-1.061 1.06 3.736 3.736 0 00-2.639-1.098 3.736 3.736 0 00-2.664 1.098z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How IncentEdge Can Help</h2>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our team of experts can help you maximize your benefits and streamline the application process:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Energy Modeling</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-8">We conduct detailed energy modeling to verify all savings requirements</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Expert Connections</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-8">We connect you with qualified certifiers and specialists</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Documentation</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-8">We prepare all necessary documentation and applications</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Maximize Benefits</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-8">We identify complementary incentives for stacking</p>
            </div>
          </div>
        </div>
        
        {/* Contact/Application section */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Ready to get started?</h2>
              <p className="text-gray-600 dark:text-gray-400">Let us handle the paperwork and maximize your benefits.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300">
                Apply With Our Help
              </Button>
              <Button variant="outline" asChild className="rounded-full border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 dark:border-gray-700 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:border-blue-800">
                <Link href="/incentives">Back to Incentives</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
