"use client";

interface CountdownTimerProps {
  formattedCountdown: string;
}

export function CountdownTimer({ formattedCountdown }: CountdownTimerProps) {
  return (
    <div className="text-center space-y-4">
      <div className="text-6xl font-mono font-bold text-purple-400 tracking-wider">
        {formattedCountdown}
      </div>
      <p className="text-[var(--muted)] text-lg">
        Chat opens at 11 PM
      </p>
    </div>
  );
}
