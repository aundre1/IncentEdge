'use client';

/**
 * Tax Credit Marketplace — Section 6418 Transfers & C-PACE Financing
 *
 * REGULATORY CONTEXT:
 * - Section 6418 (IRA): Direct cash-for-credit sales. NOT securities.
 *   IncentEdge facilitates matching and documentation only — not a broker-dealer.
 *   Revenue: 1% platform fee on matched deals (seller-paid).
 *
 * - C-PACE: 100% debt financing repaid via property tax assessment. NOT securities.
 *   IncentEdge is a referral platform connecting developers with lenders — not a lender.
 *   Revenue: referral fee from lenders ($500–$2,000 per closed deal).
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight,
  Building2,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Send,
  Shield,
  ShieldCheck,
  X,
  Check,
  ChevronRight,
  Info,
  Zap,
  Landmark,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

// ============================================================================
// Types
// ============================================================================

interface TaxCreditListing {
  id: string;
  organization_id: string;
  credit_type: string;
  credit_amount: number;
  asking_price_cents_on_dollar: number | null;
  minimum_purchase: number | null;
  irs_pre_filing_complete: boolean;
  direct_pay_elected: boolean;
  status: string;
  title: string;
  description: string | null;
  state: string | null;
  listing_date: string | null;
  expires_at: string | null;
  created_at: string;
  platform_fee_pct: number;
  organization?: {
    id: string;
    name: string;
  };
}

interface CpaceReferral {
  id: string;
  project_name: string;
  project_type: string | null;
  state: string;
  county: string | null;
  property_value: number | null;
  financing_amount_requested: number;
  use_of_proceeds: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

// ============================================================================
// Constants
// ============================================================================

const CREDIT_TYPES = [
  { value: 'ITC_48', label: 'ITC (Section 48)', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300' },
  { value: 'PTC_45', label: 'PTC (Section 45)', color: 'bg-teal-500', textColor: 'text-teal-700 dark:text-teal-300' },
  { value: 'CARBON_45Q', label: 'Carbon Capture (45Q)', color: 'bg-slate-500', textColor: 'text-slate-700 dark:text-slate-300' },
  { value: 'HYDROGEN_45V', label: 'Clean Hydrogen (45V)', color: 'bg-indigo-500', textColor: 'text-indigo-700 dark:text-indigo-300' },
  { value: 'MANUFACTURING_45X', label: 'Manufacturing (45X)', color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-300' },
  { value: 'OTHER', label: 'Other', color: 'bg-gray-500', textColor: 'text-gray-700 dark:text-gray-300' },
] as const;

const CPACE_PROJECT_TYPES = [
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed_use', label: 'Mixed Use' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
] as const;

const BUYER_TYPES = [
  { value: 'corporate', label: 'Corporate' },
  { value: 'financial_institution', label: 'Financial Institution' },
  { value: 'insurance', label: 'Insurance Company' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'other', label: 'Other' },
] as const;

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const CPACE_STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'matched_to_lender', label: 'Matched to Lender' },
  { key: 'in_underwriting', label: 'In Underwriting' },
  { key: 'closed', label: 'Closed' },
];

// ============================================================================
// Helpers
// ============================================================================

function getCreditTypeInfo(creditType: string) {
  return CREDIT_TYPES.find(ct => ct.value === creditType) ?? CREDIT_TYPES[CREDIT_TYPES.length - 1];
}

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatFullCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getListingStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    matched: { label: 'Matched', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    sold: { label: 'Sold', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };
  return map[status] ?? { label: status, className: 'bg-slate-100 text-slate-700' };
}

function getCpaceStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    matched_to_lender: { label: 'Matched to Lender', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    in_underwriting: { label: 'In Underwriting', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    closed: { label: 'Closed', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    declined: { label: 'Declined', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  };
  return map[status] ?? { label: status, className: 'bg-slate-100 text-slate-700' };
}

// ============================================================================
// Sub-components
// ============================================================================

function ListingSkeleton() {
  return (
    <Card className="card-v41">
      <CardContent className="p-5">
        <div className="space-y-3 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Dismissible info banner about regulatory status */
function RegulatoryBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <Card className="card-v41 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
      <CardContent className="p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            IncentEdge facilitates credit matching and documentation. We are not a broker-dealer
            or financial intermediary. Section 6418 transfers are direct sales permitted under the
            Inflation Reduction Act.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </CardContent>
    </Card>
  );
}

/** Credit type badge with color coding */
function CreditTypeBadge({ creditType }: { creditType: string }) {
  const info = getCreditTypeInfo(creditType);
  return (
    <Badge
      variant="outline"
      className={`${info.textColor} border-current/30`}
    >
      <span className={`w-2 h-2 rounded-full ${info.color} mr-1.5`} />
      {info.label}
    </Badge>
  );
}

/** C-PACE status progress tracker */
function CpaceStatusTracker({ status }: { status: string }) {
  const currentIndex = CPACE_STATUS_STEPS.findIndex(s => s.key === status);
  const isDeclined = status === 'declined';

  if (isDeclined) {
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Declined
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {CPACE_STATUS_STEPS.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                isComplete
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
              }`}
              title={step.label}
            >
              {isComplete && !isCurrent ? (
                <Check className="w-3 h-3" />
              ) : (
                index + 1
              )}
            </div>
            {index < CPACE_STATUS_STEPS.length - 1 && (
              <div
                className={`w-4 h-0.5 ${
                  index < currentIndex
                    ? 'bg-blue-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Express Interest Modal
// ============================================================================

function ExpressInterestModal({
  listing,
  open,
  onOpenChange,
}: {
  listing: TaxCreditListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_email: '',
    buyer_type: '' as string,
    purchase_amount_interested: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/marketplace/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listing.id,
          buyer_name: formData.buyer_name,
          buyer_email: formData.buyer_email,
          buyer_type: formData.buyer_type || null,
          purchase_amount_interested: formData.purchase_amount_interested
            ? parseFloat(formData.purchase_amount_interested)
            : null,
          message: formData.message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setSubmitted(false);
      setError(null);
      setFormData({ buyer_name: '', buyer_email: '', buyer_type: '', purchase_amount_interested: '', message: '' });
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sora">Express Interest</DialogTitle>
          <DialogDescription>
            {listing
              ? `Submit your interest in: ${listing.title}`
              : 'Submit your interest in this tax credit listing'}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">Inquiry Submitted</p>
            <p className="text-sm text-slate-500 text-center">
              The seller will be notified of your interest. You will receive a response via email.
            </p>
            <Button onClick={handleClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="buyer_name">Your Name *</Label>
                <Input
                  id="buyer_name"
                  required
                  value={formData.buyer_name}
                  onChange={e => setFormData(p => ({ ...p, buyer_name: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="buyer_email">Email *</Label>
                <Input
                  id="buyer_email"
                  type="email"
                  required
                  value={formData.buyer_email}
                  onChange={e => setFormData(p => ({ ...p, buyer_email: e.target.value }))}
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="buyer_type">Organization Type</Label>
                <Select
                  value={formData.buyer_type}
                  onValueChange={val => setFormData(p => ({ ...p, buyer_type: val }))}
                >
                  <SelectTrigger id="buyer_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUYER_TYPES.map(bt => (
                      <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="purchase_amount">Interested Amount ($)</Label>
                <Input
                  id="purchase_amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.purchase_amount_interested}
                  onChange={e => setFormData(p => ({ ...p, purchase_amount_interested: e.target.value }))}
                  placeholder="e.g. 5000000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">Message (optional)</Label>
              <textarea
                id="message"
                rows={3}
                value={formData.message}
                onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                placeholder="Tell the seller about your interest, timeline, and any requirements..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Inquiry
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Tax Credit Transfers Tab
// ============================================================================

function TaxCreditTransfersTab() {
  const [subTab, setSubTab] = useState<'browse' | 'my' | 'post'>('browse');

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
        {[
          { key: 'browse' as const, label: 'Browse Listings' },
          { key: 'my' as const, label: 'My Listings' },
          { key: 'post' as const, label: 'Post a Credit' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              subTab === tab.key
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'browse' && <BrowseListings />}
      {subTab === 'my' && <MyListings />}
      {subTab === 'post' && <PostCreditForm onPosted={() => setSubTab('my')} />}
    </div>
  );
}

// ============================================================================
// Browse Listings
// ============================================================================

function BrowseListings() {
  const [listings, setListings] = useState<TaxCreditListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters
  const [filterCreditType, setFilterCreditType] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');

  // Inquiry modal
  const [selectedListing, setSelectedListing] = useState<TaxCreditListing | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: 'active', page: String(page), pageSize: '20' });
    if (filterCreditType) params.set('creditType', filterCreditType);
    if (filterState) params.set('state', filterState);
    if (filterMinAmount) params.set('minAmount', filterMinAmount);
    if (filterMaxAmount) params.set('maxAmount', filterMaxAmount);

    try {
      const res = await fetch(`/api/marketplace/listings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filterCreditType, filterState, filterMinAmount, filterMaxAmount]);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

  const handleExpressInterest = (listing: TaxCreditListing) => {
    setSelectedListing(listing);
    setInquiryOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="card-v41">
        <CardContent className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Credit Type</Label>
              <Select value={filterCreditType} onValueChange={setFilterCreditType}>
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {CREDIT_TYPES.map(ct => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">State</Label>
              <Select value={filterState} onValueChange={setFilterState}>
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All States</SelectItem>
                  {STATES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Min Amount</Label>
              <Input
                type="number"
                min="0"
                placeholder="$0"
                value={filterMinAmount}
                onChange={e => setFilterMinAmount(e.target.value)}
                className="bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 block">Max Amount</Label>
              <Input
                type="number"
                min="0"
                placeholder="No limit"
                value={filterMaxAmount}
                onChange={e => setFilterMaxAmount(e.target.value)}
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {loading ? 'Searching...' : `${total} active listing${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ListingSkeleton />
          <ListingSkeleton />
          <ListingSkeleton />
          <ListingSkeleton />
        </div>
      ) : listings.length === 0 ? (
        <Card className="card-v41">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ArrowLeftRight className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-semibold font-sora text-slate-900 dark:text-white">
              No Active Listings
            </h3>
            <p className="mt-2 text-sm text-slate-500 text-center max-w-md">
              No active listings match your filters. Try broadening your search or check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listings.map(listing => {
            const ctInfo = getCreditTypeInfo(listing.credit_type);
            return (
              <Card key={listing.id} className="card-v41 hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold font-sora text-slate-900 dark:text-white truncate">
                        {listing.title}
                      </h3>
                      {listing.organization?.name && (
                        <p className="text-xs text-slate-400 mt-0.5">{listing.organization.name}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(listing.credit_amount)}
                      </p>
                      {listing.asking_price_cents_on_dollar && (
                        <p className="text-xs text-slate-500 font-mono">
                          {listing.asking_price_cents_on_dollar}&cent; on the dollar
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <CreditTypeBadge creditType={listing.credit_type} />
                    {listing.state && (
                      <Badge variant="outline" className="text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3 h-3 mr-1" />
                        {listing.state}
                      </Badge>
                    )}
                    {listing.irs_pre_filing_complete && (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        IRS Pre-Filing
                      </Badge>
                    )}
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  {/* Actions */}
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleExpressInterest(listing)}
                  >
                    <Send className="w-3.5 h-3.5 mr-2" />
                    Express Interest
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Express Interest Modal */}
      <ExpressInterestModal
        listing={selectedListing}
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
      />
    </div>
  );
}

// ============================================================================
// My Listings
// ============================================================================

function MyListings() {
  const [listings, setListings] = useState<TaxCreditListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyListings() {
      setLoading(true);
      try {
        const res = await fetch('/api/marketplace/listings?status=all');
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings);
        }
      } catch (err) {
        console.error('Error fetching my listings:', err);
      } finally {
        setLoading(false);
      }
    }
    void fetchMyListings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <ListingSkeleton />
        <ListingSkeleton />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <Card className="card-v41">
        <CardContent className="flex flex-col items-center py-12">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold font-sora text-slate-900 dark:text-white">
            No Listings Yet
          </h3>
          <p className="mt-2 text-sm text-slate-500 text-center max-w-md">
            You have not posted any tax credit listings. Use the &quot;Post a Credit&quot; tab to create your first listing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop table header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <div className="col-span-4">Title</div>
        <div className="col-span-2">Credit Type</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-2 text-right">Asking Price</div>
        <div className="col-span-2 text-center">Status</div>
      </div>

      {listings.map(listing => {
        const statusBadge = getListingStatusBadge(listing.status);
        return (
          <Card key={listing.id} className="card-v41">
            <CardContent className="p-4 md:p-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 md:items-center">
                <div className="md:col-span-4">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{listing.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{listing.state || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <CreditTypeBadge creditType={listing.credit_type} />
                </div>
                <div className="md:col-span-2 md:text-right">
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(listing.credit_amount)}
                  </span>
                </div>
                <div className="md:col-span-2 md:text-right">
                  <span className="font-mono text-slate-600 dark:text-slate-300">
                    {listing.asking_price_cents_on_dollar
                      ? `${listing.asking_price_cents_on_dollar}\u00A2`
                      : '---'}
                  </span>
                </div>
                <div className="md:col-span-2 md:text-center">
                  <Badge className={statusBadge.className}>
                    {statusBadge.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// Post a Credit Form
// ============================================================================

function PostCreditForm({ onPosted }: { onPosted: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    credit_type: '' as string,
    credit_amount: '',
    asking_price_cents_on_dollar: '',
    title: '',
    description: '',
    state: '',
    irs_pre_filing_complete: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credit_type: formData.credit_type,
          credit_amount: parseFloat(formData.credit_amount),
          asking_price_cents_on_dollar: formData.asking_price_cents_on_dollar
            ? parseFloat(formData.asking_price_cents_on_dollar)
            : null,
          title: formData.title,
          description: formData.description || null,
          state: formData.state || null,
          irs_pre_filing_complete: formData.irs_pre_filing_complete,
          status: 'draft',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create listing');
      }

      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="card-v41">
      <CardHeader>
        <CardTitle className="font-sora text-lg">Post a Tax Credit for Transfer</CardTitle>
        <p className="text-sm text-slate-500">
          List your Section 6418 transferable tax credit for potential buyers.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="post_title">Listing Title *</Label>
              <Input
                id="post_title"
                required
                maxLength={200}
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. 30MW Solar ITC — Texas"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post_credit_type">Credit Type *</Label>
              <Select
                value={formData.credit_type}
                onValueChange={val => setFormData(p => ({ ...p, credit_type: val }))}
              >
                <SelectTrigger id="post_credit_type">
                  <SelectValue placeholder="Select credit type" />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_TYPES.map(ct => (
                    <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="post_amount">Credit Amount ($) *</Label>
              <Input
                id="post_amount"
                type="number"
                required
                min="1"
                step="1"
                value={formData.credit_amount}
                onChange={e => setFormData(p => ({ ...p, credit_amount: e.target.value }))}
                placeholder="e.g. 5000000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post_asking">Asking Price (cents/dollar)</Label>
              <Input
                id="post_asking"
                type="number"
                min="50"
                max="100"
                step="0.5"
                value={formData.asking_price_cents_on_dollar}
                onChange={e => setFormData(p => ({ ...p, asking_price_cents_on_dollar: e.target.value }))}
                placeholder="e.g. 92"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post_state">State</Label>
              <Select
                value={formData.state}
                onValueChange={val => setFormData(p => ({ ...p, state: val }))}
              >
                <SelectTrigger id="post_state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">N/A</SelectItem>
                  {STATES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post_description">Description</Label>
            <textarea
              id="post_description"
              rows={3}
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the project and credit details, qualification status, timeline..."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="post_prefiling"
              checked={formData.irs_pre_filing_complete}
              onChange={e => setFormData(p => ({ ...p, irs_pre_filing_complete: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="post_prefiling" className="text-sm cursor-pointer">
              IRS pre-filing registration complete
            </Label>
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500">
            <p>
              <strong>Platform fee:</strong> IncentEdge charges a 1% platform fee on the credit
              amount for matched and closed transactions (paid by the seller). No fees are
              charged for listing or draft credits.
            </p>
          </div>

          <Button type="submit" disabled={submitting || !formData.credit_type || !formData.credit_amount || !formData.title} className="bg-blue-600 hover:bg-blue-700">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Post Credit Listing
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// C-PACE Financing Tab
// ============================================================================

function CpaceFinancingTab() {
  const [referrals, setReferrals] = useState<CpaceReferral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(true);

  const fetchReferrals = useCallback(async () => {
    setLoadingReferrals(true);
    try {
      const res = await fetch('/api/marketplace/cpace');
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoadingReferrals(false);
    }
  }, []);

  useEffect(() => {
    void fetchReferrals();
  }, [fetchReferrals]);

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <Card className="card-v41 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/20 dark:to-slate-900">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-xl font-bold font-sora text-slate-900 dark:text-white">
                  Access 100% Financing for Clean Energy Projects
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                C-PACE is commercial property-assessed financing — no upfront capital, repaid
                through your property tax assessment over 10-25 years.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { icon: Check, text: '100% financing available' },
                { icon: Shield, text: 'No personal guarantee' },
                { icon: ArrowLeftRight, text: 'Transfers with sale' },
                { icon: Landmark, text: '40+ states available' },
                { icon: TrendingUp, text: '10-25 year terms' },
                { icon: DollarSign, text: 'Tax deductible interest' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span className="text-xs text-slate-700 dark:text-slate-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Form */}
      <CpaceReferralForm onSubmitted={fetchReferrals} />

      {/* My Referrals */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-sora text-slate-900 dark:text-white">
          My Referrals
        </h3>

        {loadingReferrals ? (
          <div className="space-y-3">
            <ListingSkeleton />
            <ListingSkeleton />
          </div>
        ) : referrals.length === 0 ? (
          <Card className="card-v41">
            <CardContent className="flex flex-col items-center py-8">
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm text-slate-500">
                No referral requests yet. Submit one above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {referrals.map(referral => {
              const statusBadge = getCpaceStatusBadge(referral.status);
              return (
                <Card key={referral.id} className="card-v41">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {referral.project_name}
                          </p>
                          <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {referral.state}
                            {referral.county && `, ${referral.county}`}
                          </span>
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(referral.financing_amount_requested)}
                          </span>
                        </div>
                      </div>
                      <CpaceStatusTracker status={referral.status} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// C-PACE Referral Form
// ============================================================================

function CpaceReferralForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    project_type: '' as string,
    state: '',
    county: '',
    property_value: '',
    financing_amount_requested: '',
    use_of_proceeds: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/marketplace/cpace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: formData.project_name,
          project_type: formData.project_type || null,
          state: formData.state,
          county: formData.county || null,
          property_value: formData.property_value
            ? parseFloat(formData.property_value)
            : null,
          financing_amount_requested: parseFloat(formData.financing_amount_requested),
          use_of_proceeds: formData.use_of_proceeds || null,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit referral');
      }

      setSuccess(true);
      setFormData({
        project_name: '', project_type: '', state: '', county: '',
        property_value: '', financing_amount_requested: '', use_of_proceeds: '',
        contact_name: '', contact_email: '', contact_phone: '',
      });
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="card-v41">
      <CardHeader>
        <CardTitle className="font-sora text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          Submit a C-PACE Referral Request
        </CardTitle>
        <p className="text-sm text-slate-500">
          Our lending partners typically respond within 48 hours.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              Referral submitted successfully. Our lending partners will be in touch within 48 hours.
            </div>
          )}

          {/* Project Details */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Project Details</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="cpace_project_name">Project Name *</Label>
                <Input
                  id="cpace_project_name"
                  required
                  value={formData.project_name}
                  onChange={e => setFormData(p => ({ ...p, project_name: e.target.value }))}
                  placeholder="e.g. 225 Main Street Solar"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpace_project_type">Project Type</Label>
                <Select
                  value={formData.project_type}
                  onValueChange={val => setFormData(p => ({ ...p, project_type: val }))}
                >
                  <SelectTrigger id="cpace_project_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CPACE_PROJECT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpace_state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={val => setFormData(p => ({ ...p, state: val }))}
                >
                  <SelectTrigger id="cpace_state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpace_county">County</Label>
                <Input
                  id="cpace_county"
                  value={formData.county}
                  onChange={e => setFormData(p => ({ ...p, county: e.target.value }))}
                  placeholder="e.g. Westchester"
                />
              </div>
            </div>
          </div>

          {/* Financing Details */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Financing Details</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="cpace_property_value">Property Value ($)</Label>
                <Input
                  id="cpace_property_value"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.property_value}
                  onChange={e => setFormData(p => ({ ...p, property_value: e.target.value }))}
                  placeholder="e.g. 15000000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpace_amount">Financing Amount Requested ($) *</Label>
                <Input
                  id="cpace_amount"
                  type="number"
                  required
                  min="1"
                  step="1000"
                  value={formData.financing_amount_requested}
                  onChange={e => setFormData(p => ({ ...p, financing_amount_requested: e.target.value }))}
                  placeholder="e.g. 2500000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpace_use">Use of Proceeds</Label>
                <Input
                  id="cpace_use"
                  value={formData.use_of_proceeds}
                  onChange={e => setFormData(p => ({ ...p, use_of_proceeds: e.target.value }))}
                  placeholder="e.g. Solar, HVAC, EV chargers"
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Contact Information</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="cpace_contact_name">Contact Name *</Label>
                <Input
                  id="cpace_contact_name"
                  required
                  value={formData.contact_name}
                  onChange={e => setFormData(p => ({ ...p, contact_name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpace_contact_email">Contact Email *</Label>
                <Input
                  id="cpace_contact_email"
                  type="email"
                  required
                  value={formData.contact_email}
                  onChange={e => setFormData(p => ({ ...p, contact_email: e.target.value }))}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpace_contact_phone">Phone</Label>
                <Input
                  id="cpace_contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={e => setFormData(p => ({ ...p, contact_phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !formData.project_name || !formData.state || !formData.financing_amount_requested || !formData.contact_name || !formData.contact_email}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Referral Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <ArrowLeftRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora tracking-tight text-slate-900 dark:text-white">
              Tax Credit Marketplace
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Section 6418 transfers &amp; C-PACE financing
            </p>
          </div>
        </div>
      </div>

      {/* Regulatory Info Banner */}
      <RegulatoryBanner />

      {/* Main Tabs */}
      <Tabs defaultValue="transfers" className="space-y-6">
        <TabsList className="h-10">
          <TabsTrigger value="transfers" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Tax Credit Transfers
          </TabsTrigger>
          <TabsTrigger value="cpace" className="gap-2">
            <Building2 className="w-4 h-4" />
            C-PACE Financing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfers">
          <TaxCreditTransfersTab />
        </TabsContent>

        <TabsContent value="cpace">
          <CpaceFinancingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
