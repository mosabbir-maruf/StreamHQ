"use client";

import { useEffect, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { env } from "@/utils/env";

interface TurnstileErrorBoundaryProps {
  onSuccess: (token: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function TurnstileErrorBoundary({ 
  onSuccess, 
  onError,
  className = "flex h-fit w-full items-center justify-center"
}: TurnstileErrorBoundaryProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;

  const handleError = (error: string) => {
    console.error("Turnstile error:", error);
    onError?.(error);
    
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsRetrying(false);
      }, 2000);
    }
  };

  const handleSuccess = (token: string) => {
    setRetryCount(0);
    onSuccess(token);
  };

  // Reset retry count when component mounts
  useEffect(() => {
    setRetryCount(0);
  }, []);

  if (retryCount >= maxRetries) {
    return (
      <div className={className}>
        <div className="text-center p-4">
          <p className="text-sm text-foreground/70 mb-2">
            Security verification failed. Please refresh the page and try again.
          </p>
          <button
            onClick={() => {
              setRetryCount(0);
              window.location.reload();
            }}
            className="text-primary hover:underline text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {isRetrying && (
        <div className="text-center p-2">
          <p className="text-xs text-foreground/50">
            Retrying verification... ({retryCount + 1}/{maxRetries})
          </p>
        </div>
      )}
      <Turnstile
        siteKey={env.NEXT_PUBLIC_CAPTCHA_SITE_KEY}
        onSuccess={handleSuccess}
        onError={handleError}
        onExpire={() => handleError("Token expired")}
        onTimeout={() => handleError("Verification timeout")}
        options={{
          theme: "auto",
          size: "normal",
          retry: "auto",
          retryInterval: 8000,
        }}
      />
    </div>
  );
}
