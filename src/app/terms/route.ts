import { redirect } from 'next/navigation';

/**
 * Redirect /terms → /legal/terms
 *
 * Canonical URL is /legal/terms. This route exists so that short-form links
 * (e.g. in emails or older marketing copy) continue to resolve without a 404.
 */
export async function GET() {
  redirect('/legal/terms');
}
