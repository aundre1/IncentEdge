import { Link, useLocation } from "wouter";
import { Moon, Sun, Menu, X, TrendingUp, Building2, Calculator, FileText, Info, Phone, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import IncentEdgeLogo from "@/assets/icons/IncentEdgeLogo";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: TrendingUp },
    { name: "Incentives", href: "/incentives", icon: Building2 },
    { name: "Calculator", href: "/calculator", icon: Calculator },
    { name: "Data Sources", href: "/data-sources", icon: Database },
    { name: "Resources", href: "/resources", icon: FileText },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full nav-modern animate-fade-in">
      <div className="container mx-auto px-2 lg:px-4">
        <div className="flex h-40 items-center justify-between">
          {/* Premium Logo Section */}
          <div className="flex items-center -ml-4">
            <Link href="/" className="group flex items-center transition-transform hover:scale-105">
              <IncentEdgeLogo className="text-gradient" />
            </Link>
          </div>

          {/* Executive Navigation - Only show on larger screens */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Professional Controls */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-10 w-10 rounded-lg hover:bg-muted/50 transition-all duration-200"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Admin Links - Desktop */}
            <div className="hidden xl:flex items-center gap-2">
              <Link href="/admin/scraper">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-all duration-300"
                >
                  Admin
                </Button>
              </Link>
              <Link href="/admin/monitoring">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs bg-blue-100/50 dark:bg-blue-900/50 border border-blue-200/50 dark:border-blue-700/50 hover:bg-blue-200/70 dark:hover:bg-blue-700/70 transition-all duration-300"
                >
                  Monitor
                </Button>
              </Link>
            </div>

            {/* CTA Button - Desktop */}
            <Button className="hidden xl:flex btn-primary-modern">
              Get Started
            </Button>

            {/* Mobile/Tablet menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="xl:hidden h-10 w-10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Executive Mobile/Tablet Navigation */}
        {isMobileMenuOpen && (
          <div className="xl:hidden animate-slide-up">
            <div className="px-4 pt-4 pb-6 space-y-2 glass-effect rounded-xl m-4 mt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile/Tablet CTA & Admin */}
              <div className="pt-4 mt-4 border-t border-border space-y-3">
                <Button className="w-full btn-primary-modern">
                  Get Started
                </Button>
                
                <div className="space-y-2">
                  <Link href="/admin/scraper" className="block">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Button>
                  </Link>
                  <Link href="/admin/monitoring" className="block">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Data Monitor
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}