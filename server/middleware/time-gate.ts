import { isWithinTimeGate } from "../services/time-gate.js";
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
    return next(new Error("Chat is closed. Come back at 11 PM!"));
  }
  next();
};
