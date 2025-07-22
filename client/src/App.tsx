import React from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HomePage from "@/pages/HomePage";
import IncentivesPage from "@/pages/IncentivesPage";
import CalculatorPage from "@/pages/CalculatorPage";
import IncentiveDetailPage from "@/pages/IncentiveDetailPage";
import AboutPage from "@/pages/AboutPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ContactPage from "@/pages/ContactPage";
import DataSourcesPage from "@/pages/DataSourcesPage";
import AdminScraperPage from "@/pages/AdminScraperPage";
import DataMonitoringPage from "@/pages/DataMonitoringPage";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/incentives" component={IncentivesPage} />
          <Route path="/incentives/:id" component={IncentiveDetailPage} />
          <Route path="/calculator" component={CalculatorPage} />
          <Route path="/data-sources" component={DataSourcesPage} />
          <Route path="/admin/scraper" component={AdminScraperPage} />
          <Route path="/admin/monitoring" component={DataMonitoringPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route path="/contact" component={ContactPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
