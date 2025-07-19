import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, Mail, Phone, MapPin } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  subscribe: z.boolean().default(false),
  propertyType: z.string().optional(),
  squareFootage: z.string().optional(),
  incentiveInterest: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      projectType: "",
      message: "",
      subscribe: false,
      propertyType: "",
      squareFootage: "",
      incentiveInterest: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest("POST", "/api/leads", values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Form submitted",
        description: "We'll get back to you shortly.",
        variant: "default",
      });
      setIsSubmitted(true);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error submitting form",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    submitMutation.mutate(values);
  };

  const projectTypes = [
    { value: "commercial-new", label: "Commercial New Construction" },
    { value: "commercial-retrofit", label: "Commercial Retrofit" },
    { value: "multifamily-new", label: "Multifamily New Construction" },
    { value: "multifamily-retrofit", label: "Multifamily Retrofit" },
    { value: "affordable", label: "Affordable Housing" },
    { value: "other", label: "Other" },
  ];

  const propertyTypes = [
    { value: "office", label: "Office" },
    { value: "retail", label: "Retail" },
    { value: "hospitality", label: "Hospitality" },
    { value: "industrial", label: "Industrial" },
    { value: "residential", label: "Residential" },
    { value: "mixed", label: "Mixed-Use" },
  ];

  const incentiveInterests = [
    { value: "tax-credits", label: "Tax Credits & Deductions" },
    { value: "rebates", label: "Rebates & Incentives" },
    { value: "grants", label: "Grants" },
    { value: "financing", label: "Low-Interest Financing" },
    { value: "all", label: "All Available Incentives" },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
            <p className="text-muted-foreground mb-8">
              Ready to maximize your sustainable building incentives? Reach out to our team of experts to discuss your project and discover how we can help you.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="text-primary mt-1 mr-4 h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Office Location</h3>
                  <p className="text-muted-foreground">350 5th Avenue, New York, NY 10118</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="text-primary mt-1 mr-4 h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-muted-foreground">(212) 555-0123</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="text-primary mt-1 mr-4 h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">info@incentedge.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <Building className="text-primary mt-1 mr-4 h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Service Areas</h3>
                  <p className="text-muted-foreground">NYC, New York State, Westchester County, New Jersey, Pennsylvania, Rhode Island, Maine, Massachusetts, Delaware, Vermont, and New Hampshire</p>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Why Work With Us?</CardTitle>
                  <CardDescription>
                    IncentEdge offers a unique success-based fee model and comprehensive support
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Success-Based Fees</h3>
                    <p className="text-sm text-muted-foreground">We primarily charge a percentage of secured incentives, minimizing your upfront costs.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Comprehensive Database</h3>
                    <p className="text-sm text-muted-foreground">Access to 187+ incentives across federal, state, local, utility, and foundation levels.</p>
                  </div>
                  <div>
                    <h3 className="font-medium">End-to-End Support</h3>
                    <p className="text-sm text-muted-foreground">From application to funding disbursement, we handle the entire process.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            {isSubmitted ? (
              <Card className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                <CardHeader>
                  <CardTitle>Thank You!</CardTitle>
                  <CardDescription>
                    Your message has been submitted successfully.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-6">
                    One of our incentive specialists will review your information and contact you within 1-2 business days to discuss your project and potential incentives.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)}>
                    Submit Another Inquiry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Fill out the form below to discuss your project and incentive opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="John Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email*</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(212) 555-0123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Company" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Project Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Project Information</h3>

                        <FormField
                          control={form.control}
                          name="projectType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Type*</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select project type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {projectTypes.map((type) => (
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="propertyType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Property Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select property type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {propertyTypes.map((type) => (
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
                            name="squareFootage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Square Footage</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 10,000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="incentiveInterest"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Incentive Interest</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your primary interest" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {incentiveInterests.map((type) => (
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
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message*</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please provide details about your project and any specific incentives you're interested in."
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subscribe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Stay informed</FormLabel>
                                <FormDescription>
                                  Receive updates about incentive programs and opportunities.
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={submitMutation.isPending}
                      >
                        {submitMutation.isPending ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                            Submitting...
                          </>
                        ) : "Submit"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
