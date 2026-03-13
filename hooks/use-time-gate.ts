"use client";

import { useState, useEffect } from "react";
import { isWithinTimeGate, getSecondsUntilOpen, formatCountdown } from "@/lib/time-utils";

export function useTimeGate() {
  const [isOpen, setIsOpen] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    function update() {
      const open = isWithinTimeGate();
      setIsOpen(open);
      if (!open) {
        setRemainingSeconds(getSecondsUntilOpen());
      } else {
        setRemainingSeconds(0);
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isOpen,
    remainingSeconds,
    formattedCountdown: formatCountdown(remainingSeconds),
  };
}
