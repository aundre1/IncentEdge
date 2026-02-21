'use client';

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Human-readable error messages for common OAuth errors
const errorMessages: Record<string, string> = {
  access_denied: 'You cancelled the sign-in process or denied access to your account.',
  invalid_callback: 'The authentication callback was invalid. Please try signing in again.',
  session_exchange_failed: 'We were unable to complete your sign-in. Please try again.',
  server_error: 'The authentication server encountered an error. Please try again later.',
  temporarily_unavailable: 'The authentication service is temporarily unavailable. Please try again later.',
  invalid_request: 'The sign-in request was invalid. Please try again.',
  unauthorized_client: 'This application is not authorized to use this sign-in method.',
  unsupported_response_type: 'The authentication method is not supported. Please contact support.',
  invalid_scope: 'The requested permissions are invalid. Please contact support.',
  auth_callback_error: 'An error occurred during authentication. Please try again.',
};

function getErrorMessage(error: string | null, message: string | null): string {
  if (message) {
    return message;
  }
  if (error && errorMessages[error]) {
    return errorMessages[error];
  }
  if (error) {
    return `Authentication error: ${error.replace(/_/g, ' ')}`;
  }
  return 'An unexpected error occurred during authentication.';
}

function getErrorTitle(error: string | null): string {
  switch (error) {
    case 'access_denied':
      return 'Sign-in Cancelled';
    case 'session_exchange_failed':
      return 'Sign-in Failed';
    case 'server_error':
    case 'temporarily_unavailable':
      return 'Service Unavailable';
    default:
      return 'Authentication Error';
  }
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  const errorTitle = getErrorTitle(error);
  const errorMessage = getErrorMessage(error, message);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{errorTitle}</CardTitle>
          <CardDescription className="text-base">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="mb-2 text-sm font-medium">What can you do?</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>- Try signing in again</li>
              <li>- Use a different sign-in method</li>
              <li>- Clear your browser cookies and try again</li>
              <li>- Contact support if the problem persists</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/login" className="w-full">
            <Button className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthErrorContent />
    </Suspense>
  );
}
