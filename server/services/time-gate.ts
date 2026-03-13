import cron from "node-cron";
import type { Server } from "socket.io";
import { config } from "../config.js";
import { queueService } from "./queue.js";
import { roomService } from "./room.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../../shared/socket-events";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

/**
 * Check if the current time is within the allowed chat window.
 * Handles the overnight wrap (e.g., 23:00 → 02:00).
 */
export function isWithinTimeGate(): boolean {
  const now = new Date();
  const timeStr = now.toLocaleString("en-US", {
    timeZone: config.TIME_GATE_TIMEZONE,
    hour: "numeric",
    hour12: false,
  });
  const currentHour = parseInt(timeStr);

  const start = config.TIME_GATE_START_HOUR; // 23
  const end = config.TIME_GATE_END_HOUR;     // 2

  // Overnight window: 23 <= hour || hour < 2
  if (start > end) {
    return currentHour >= start || currentHour < end;
  }
  // Same-day window (e.g., 10-14)
  return currentHour >= start && currentHour < end;
}

/**
 * Get seconds remaining until the time gate opens.
 */
export function getSecondsUntilOpen(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: config.TIME_GATE_TIMEZONE,
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
  const targetSeconds = config.TIME_GATE_START_HOUR * 3600;

  if (currentSeconds < targetSeconds) {
    return targetSeconds - currentSeconds;
  }
  // Past the start hour — next opening is tomorrow
  return 24 * 3600 - currentSeconds + targetSeconds;
}

/**
 * Set up the 2 AM cron job that force-disconnects all users.
 */
export function setupTimeGateCron(io: IOServer): void {
  const endHour = config.TIME_GATE_END_HOUR;

  // Skip cron if time gate is disabled (always open, e.g. 0–24)
  if (config.TIME_GATE_START_HOUR === 0 && endHour >= 24) {
    console.log("[time-gate] Always open — cron disabled");
    return;
  }

  // Fire at exactly XX:00 (e.g., "0 2 * * *")
  cron.schedule(
    `0 ${endHour} * * *`,
    () => {
      console.log(`[time-gate] ${endHour}:00 — disconnecting all users`);

      io.emit("force_disconnect", {
        reason: "It's 2 AM! Time to get some rest. See you tomorrow at 11 PM.",
      });

      // Grace period for clients to show the message
      setTimeout(() => {
        io.disconnectSockets(true);
        queueService.clear();
        roomService.destroyAll();
        console.log("[time-gate] All users disconnected and state cleared");
      }, 10_000);
    },
    { timezone: config.TIME_GATE_TIMEZONE }
  );

  console.log(
    `[time-gate] Cron scheduled: disconnect at ${endHour}:00 ${config.TIME_GATE_TIMEZONE}`
  );
}
