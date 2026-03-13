import { TIME_GATE_START_HOUR, TIME_GATE_END_HOUR, TIMEZONE } from "./constants";

export function isWithinTimeGate(): boolean {
  const now = new Date();
  const timeStr = now.toLocaleString("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    hour12: false,
  });
  const currentHour = parseInt(timeStr);

  if (TIME_GATE_START_HOUR > TIME_GATE_END_HOUR) {
    return currentHour >= TIME_GATE_START_HOUR || currentHour < TIME_GATE_END_HOUR;
  }
  return currentHour >= TIME_GATE_START_HOUR && currentHour < TIME_GATE_END_HOUR;
}

export function getSecondsUntilOpen(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)!.value);

  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");

  const currentSeconds = hour * 3600 + minute * 60 + second;
  const targetSeconds = TIME_GATE_START_HOUR * 3600;

  if (currentSeconds < targetSeconds) {
    return targetSeconds - currentSeconds;
  }
  return 24 * 3600 - currentSeconds + targetSeconds;
}

export function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}
