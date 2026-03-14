import { isWithinTimeGate } from "../services/time-gate.js";
import { config } from "../config.js";
import type { Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../../shared/socket-events.js";

type SocketMiddleware = (
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  next: (err?: Error) => void
) => void;

export const timeGateMiddleware: SocketMiddleware = (_socket, next) => {
  if (!isWithinTimeGate()) {
    const start = config.TIME_GATE_START_HOUR;
    const h = start === 0 ? "12 AM" : start === 12 ? "12 PM" : start > 12 ? `${start - 12} PM` : `${start} AM`;
    return next(new Error(`Chat is closed. Come back at ${h}!`));
  }
  next();
};
