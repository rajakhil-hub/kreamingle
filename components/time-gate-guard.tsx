"use client";

import { useTimeGate } from "@/hooks/use-time-gate";
import { CountdownTimer } from "./countdown-timer";

export function TimeGateGuard({ children }: { children: React.ReactNode }) {
  const { isOpen, formattedCountdown } = useTimeGate();

  if (!isOpen) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold">Chat is currently closed</h2>
          <CountdownTimer formattedCountdown={formattedCountdown} />
          <p className="text-sm text-[var(--muted)]">
            Available daily from 11 PM to 2 AM
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
