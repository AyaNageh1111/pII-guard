'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { captureError } from '@/lib/error-tracking';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-destructive/5 p-8 rounded-lg shadow-lg border border-destructive/20 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-destructive mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          We've been notified and are working to fix the issue.
        </p>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          <Button
            variant="default"
            onClick={() => reset()}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}