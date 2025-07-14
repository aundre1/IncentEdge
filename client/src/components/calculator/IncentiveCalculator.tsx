import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CALCULATOR_PROJECT_TYPES } from "@/lib/constants";
import { calculateIncentive, formatCurrency } from "@/lib/utils";

const formSchema = z.object({
  projectType: z.string().min(1, "Project type is required"),
  squareFootage: z.coerce
    .number()
    .positive("Square footage must be a positive number")
    .int("Square footage must be a whole number"),
  budget: z.coerce
    .number()
    .positive("Budget must be a positive number"),
  location: z.string().min(1, "Location is required"),
  buildingType: z.string().min(1, "Building type is required"),
  energyEfficiencyMeasures: z.array(z.string()).min(1, "Select at least one energy efficiency measure"),
  ownershipType: z.string().min(1, "Ownership type is required"),
  constructionYear: z.coerce
    .number()
    .min(1900, "Construction year must be after 1900")
    .max(new Date().getFullYear(), "Construction year cannot be in the future"),
  annualEnergyUsage: z.coerce
    .number()
    .positive("Annual energy usage must be a positive number")
    .optional(),
  isCertifiedGreen: z.boolean().default(false),
  targetEnergyReduction: z.coerce
    .number()
    .min(0, "Energy reduction must be non-negative")
    .max(100, "Energy reduction cannot exceed 100%")
    .optional(),
  projectTimeline: z.string().min(1, "Project timeline is required"),
  existingIncentives: z.boolean().default(false),
  lowIncomeQualified: z.boolean().default(false),
  affordableHousing: z.boolean().default(false)
});

interface CalculatorResult {
  totalIncentive: number;
  breakdownByProgram: Record<string, number>;
}

export default function IncentiveCalculator() {
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectType: "",
      squareFootage: undefined,
      budget: undefined,
      location: "",
      buildingType: "",
      energyEfficiencyMeasures: [],
      ownershipType: "",
      constructionYear: undefined,
      annualEnergyUsage: undefined,
      isCertifiedGreen: false,
      targetEnergyReduction: undefined,
      projectTimeline: "",
      existingIncentives: false,
      lowIncomeQualified: false,
      affordableHousing: false,
    },
  });

  const calculateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest(
        "POST",
        "/api/calculator",
        values
      );
      return res.json();
    },
    onSuccess: (data: CalculatorResult) => {
      setResult(data);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Call API for calculation
    calculateMutation.mutate(values);
    
    // Also calculate locally for immediate feedback
    // (this would normally just rely on the API response)
    const localResult = calculateIncentive(
      values.projectType,
      values.squareFootage,
      values.budget
    );
    setResult(localResult);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 rounded-t-2xl p-8 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Incentive Calculator</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Estimate the available incentives for your sustainable building project to maximize your financial benefits.
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Project Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Basic Project Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="projectType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Project Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12">
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CALCULATOR_PROJECT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new-york">New York</SelectItem>
                            <SelectItem value="new-jersey">New Jersey</SelectItem>
                            <SelectItem value="connecticut">Connecticut</SelectItem>
                            <SelectItem value="massachusetts">Massachusetts</SelectItem>
                            <SelectItem value="pennsylvania">Pennsylvania</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                          Project location affects available incentives
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="buildingType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Building Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12">
                              <SelectValue placeholder="Select building type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="residential-single">Residential Single-Family</SelectItem>
                            <SelectItem value="residential-multi">Residential Multi-Family</SelectItem>
                            <SelectItem value="industrial">Industrial</SelectItem>
                            <SelectItem value="institutional">Institutional</SelectItem>
                            <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Project Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="squareFootage"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Square Footage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="10000"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                          Total building square footage
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Project Budget ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500000"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                          Total project cost
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="constructionYear"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Construction Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2020"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                          Year building was constructed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Energy & Sustainability */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Energy & Sustainability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="energyEfficiencyMeasures"
                    render={() => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Energy Efficiency Measures</FormLabel>
                        <div className="space-y-2">
                          {[
                            { id: "hvac", label: "HVAC Upgrades" },
                            { id: "insulation", label: "Insulation & Weatherization" },
                            { id: "windows", label: "Energy-Efficient Windows" },
                            { id: "lighting", label: "LED Lighting Systems" },
                            { id: "solar", label: "Solar Panels/Renewable Energy" },
                            { id: "storage", label: "Energy Storage Systems" },
                            { id: "controls", label: "Smart Building Controls" },
                            { id: "appliances", label: "Energy-Efficient Appliances" },
                          ].map((measure) => (
                            <FormField
                              key={measure.id}
                              control={form.control}
                              name="energyEfficiencyMeasures"
                              render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={measure.id}
                                    checked={field.value?.includes(measure.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValue, measure.id]);
                                      } else {
                                        field.onChange(currentValue.filter((value: string) => value !== measure.id));
                                      }
                                    }}
                                  />
                                  <label htmlFor={measure.id} className="text-sm text-gray-700 dark:text-gray-300">
                                    {measure.label}
                                  </label>
                                </div>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="annualEnergyUsage"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Annual Energy Usage (kWh)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50000"
                              className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                            Current annual energy consumption (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetEnergyReduction"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Target Energy Reduction (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="30"
                              className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                            Expected percentage reduction in energy use
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Ownership & Qualifications */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Ownership & Qualifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ownershipType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Ownership Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12">
                              <SelectValue placeholder="Select ownership type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="private">Private</SelectItem>
                            <SelectItem value="nonprofit">Non-Profit</SelectItem>
                            <SelectItem value="government">Government</SelectItem>
                            <SelectItem value="cooperative">Cooperative</SelectItem>
                            <SelectItem value="reit">REIT</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectTimeline"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium">Project Timeline</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl h-12">
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-6months">0-6 months</SelectItem>
                            <SelectItem value="6-12months">6-12 months</SelectItem>
                            <SelectItem value="1-2years">1-2 years</SelectItem>
                            <SelectItem value="2-5years">2-5 years</SelectItem>
                            <SelectItem value="5+years">5+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-gray-500 dark:text-gray-400 text-sm">
                          Expected project completion timeframe
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isCertifiedGreen"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Green Building Certification
                          </FormLabel>
                          <FormDescription className="text-gray-500 dark:text-gray-400">
                            Planning to achieve LEED, ENERGY STAR, or other green certification
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="affordableHousing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Affordable Housing Project
                          </FormLabel>
                          <FormDescription className="text-gray-500 dark:text-gray-400">
                            Project includes affordable housing units
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowIncomeQualified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Low-Income Community
                          </FormLabel>
                          <FormDescription className="text-gray-500 dark:text-gray-400">
                            Project located in designated low-income area
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="existingIncentives"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Currently Receiving Incentives
                          </FormLabel>
                          <FormDescription className="text-gray-500 dark:text-gray-400">
                            Already receiving other government incentives for this project
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-12 font-medium text-base" 
                disabled={calculateMutation.isPending}
              >
                {calculateMutation.isPending ? (
                  <>
                    <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Calculating your incentives...
                  </>
                ) : "Calculate Available Incentives"}
              </Button>
            </form>
          </Form>
          
          {result && (
            <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                    <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z" clipRule="evenodd" />
                    <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Estimated Incentives</h3>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 p-8 rounded-xl border border-green-100 dark:border-green-900/20 mb-8 flex flex-col md:flex-row justify-between items-center">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Available Incentives:</p>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(result.totalIncentive)}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 py-2 px-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                  This represents approximately <span className="font-semibold">{Math.round((result.totalIncentive / form.getValues().budget) * 100)}%</span> of your project budget
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Breakdown by Program:</h4>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                {Object.entries(result.breakdownByProgram).map(([program, amount], index) => (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center px-6 py-4 ${
                      index !== Object.entries(result.breakdownByProgram).length - 1 
                        ? 'border-b border-gray-100 dark:border-gray-700' 
                        : ''
                    } ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}`}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-3"></div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{program}</span>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex">
                <div className="text-blue-500 mr-3 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  <p>This is an estimate based on the information provided. Actual incentives may vary based on specific project details, timing, and eligibility requirements.</p>
                  <p className="mt-2 font-medium">Contact our team for a detailed analysis and application assistance.</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-md hover:shadow-xl transition-all duration-300 px-6"
                >
                  Get Expert Help
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {!result && (
          <div className="text-center p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-sm rounded-b-2xl">
            Enter your project details above to see potential incentives and subsidies available to you
          </div>
        )}
      </div>
    </div>
  );
}
