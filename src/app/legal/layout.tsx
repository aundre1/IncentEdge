'use client';

import Link from 'next/link';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LegalLayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">IncentEdge</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/legal/terms"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
            <Link
              href="/legal/privacy"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </header>

      {/* Back Button */}
      <div className="container px-4 pt-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-blue-900 dark:bg-slate-950">
        <div className="container flex h-16 items-center justify-between px-4 text-sm text-white">
          <div>&copy; {currentYear} AoRa Development LLC. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="hover:text-white/80">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-white/80">
              Terms
            </Link>
            <a href="mailto:legal@incentedge.com" className="hover:text-white/80">
              Contact
            </a>
          </div>
        </div>
      </footer>

      {/* Print Styles - using Tailwind's print: modifier instead of styled-jsx */}
      <style>{`
        @media print {
          header, footer, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          .container {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
