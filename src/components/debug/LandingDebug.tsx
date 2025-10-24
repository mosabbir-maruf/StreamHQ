"use client";

import { Button } from "@heroui/react";
import { testLanding } from "@/utils/landing";
import { useState, useEffect } from "react";

const LandingDebug = () => {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    setState(testLanding.getState());
  }, []);

  const refreshState = () => {
    setState(testLanding.getState());
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="text-sm font-semibold text-foreground mb-2">Landing Page Debug</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>Has Visited:</strong> {state?.hasVisited ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Storage Value:</strong> {state?.storageValue || 'null'}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-3">
        <Button
          size="sm"
          variant="bordered"
          onClick={() => {
            testLanding.showLanding();
          }}
        >
          Show Landing
        </Button>
        
        <Button
          size="sm"
          variant="bordered"
          onClick={() => {
            testLanding.skipLanding();
          }}
        >
          Skip Landing
        </Button>
        
        <Button
          size="sm"
          variant="bordered"
          onClick={refreshState}
        >
          Refresh State
        </Button>
      </div>
    </div>
  );
};

export default LandingDebug;
