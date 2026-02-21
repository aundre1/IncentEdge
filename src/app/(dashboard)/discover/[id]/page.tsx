'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Landmark,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Building2,
  Loader2,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';

interface Incentive {
  id: number;
  title: string;
  agency: string;
  program_type: string;
  state: string;
  funding_amount: number;
  category: string;
  source: string;
  award_year?: number;
  recipient?: string;
  description?: string;
}

function formatCurrency(value: number) {
  if (!value) return 'Varies';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function getCategoryColor(category: string) {
  switch (category?.toLowerCase()) {
    case 'tax credit': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    case 'grant': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'rebate': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'loan': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    case 'property tax': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
    default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }
}

export default function IncentiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [incentive, setIncentive] = useState<Incentive | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [relatedIncentives, setRelatedIncentives] = useState<Incentive[]>([]);

  useEffect(() => {
    async function fetchIncentive() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('incentive_awards')
        .select('*')
        .eq('id', params.id)
        .single();

      if (!error && data) {
        setIncentive(data);

        // Fetch related incentives from same state or category
        const { data: related } = await supabase
          .from('incentive_awards')
          .select('*')
          .neq('id', params.id)
          .or(`state.eq.${data.state},category.eq.${data.category}`)
          .limit(4);

        if (related) {
          setRelatedIncentives(related);
        }
      }

      setLoading(false);
    }

    if (params.id) {
      fetchIncentive();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!incentive) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discover
        </Button>
        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold">Incentive not found</h3>
            <p className="mt-2 text-sm text-slate-500">
              This incentive may have been removed or the ID is invalid.
            </p>
            <Button className="mt-4" onClick={() => router.push('/discover')}>
              Browse Incentives
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Discover
      </Button>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Landmark className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {incentive.title}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
                      {incentive.agency}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge className={getCategoryColor(incentive.category)}>
                        {incentive.category || 'Other'}
                      </Badge>
                      {incentive.state && (
                        <Badge variant="outline" className="border-slate-200 dark:border-slate-700">
                          <MapPin className="mr-1 h-3 w-3" />
                          {incentive.state}
                        </Badge>
                      )}
                      {incentive.program_type && (
                        <Badge variant="outline" className="border-slate-200 dark:border-slate-700">
                          {incentive.program_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSaved(!saved)}
                    className={saved ? 'text-blue-600 border-blue-600' : ''}
                  >
                    {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Program Details */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Program Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Funding Amount</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(incentive.funding_amount)}
                  </p>
                </div>
                {incentive.award_year && (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-500">Award Year</p>
                    <p className="text-lg font-semibold">{incentive.award_year}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Program Type</p>
                  <p className="text-lg font-semibold">{incentive.program_type || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Source</p>
                  <p className="text-lg font-semibold">{incentive.source || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {incentive.description ||
                    `This ${incentive.category?.toLowerCase() || 'incentive'} program is administered by ${incentive.agency}. ` +
                    `It provides funding opportunities for eligible projects in ${incentive.state || 'various locations'}.`}
                </p>
              </div>

              {incentive.recipient && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Past Recipient</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {incentive.recipient}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Typical Eligibility Requirements</CardTitle>
              <CardDescription>Common criteria for this type of program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Project Location</p>
                    <p className="text-sm text-slate-500">
                      Must be located in {incentive.state || 'eligible jurisdiction'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Project Type</p>
                    <p className="text-sm text-slate-500">
                      Must meet program-specific project requirements
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Application Timeline</p>
                    <p className="text-sm text-slate-500">
                      Submit before funding cycle deadline
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Related */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <FileText className="mr-2 h-4 w-4" />
                Check Eligibility
              </Button>
              <Button variant="outline" className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                Add to Project
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Agency Website
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 text-slate-400" />
                <span className="text-blue-600 hover:underline cursor-pointer">
                  {incentive.agency?.toLowerCase().replace(/\s+/g, '') || 'agency'}.gov
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">(800) 555-0123</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-blue-600 hover:underline cursor-pointer">
                  info@{incentive.agency?.toLowerCase().replace(/\s+/g, '') || 'agency'}.gov
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related Incentives */}
          {relatedIncentives.length > 0 && (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Related Incentives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedIncentives.map((related) => (
                  <Link
                    key={related.id}
                    href={`/discover/${related.id}`}
                    className="block p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-colors"
                  >
                    <p className="font-medium text-sm truncate">{related.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{related.agency}</span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {formatCurrency(related.funding_amount)}
                      </span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
