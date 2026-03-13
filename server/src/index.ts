import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "./config.js";
import { authMiddleware } from "./middleware/auth.js";
import { timeGateMiddleware } from "./middleware/time-gate.js";
import { registerConnectionHandler } from "./handlers/connection.js";
import { setupTimeGateCron } from "./services/time-gate.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../../shared/socket-events";

const app = express();
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ICE server endpoint — returns STUN servers (+ TURN if Twilio configured)
app.get("/api/ice-servers", (_req, res) => {
  const iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  // TODO: If Twilio credentials are set, fetch ephemeral TURN credentials
  // and add them to iceServers

  res.json({ iceServers });
});

const httpServer = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: config.CORS_ORIGIN,
    credentials: true,
  },
});

// Socket.io middleware
io.use(authMiddleware);
io.use(timeGateMiddleware);

// Connection handler
registerConnectionHandler(io);

// Start 2 AM cron disconnect
setupTimeGateCron(io);

httpServer.listen(config.PORT, () => {
  console.log(`[server] Socket.io server running on port ${config.PORT}`);
  console.log(`[server] CORS origin: ${config.CORS_ORIGIN}`);
  console.log(
    `[server] Time gate: ${config.TIME_GATE_START_HOUR}:00 – ${config.TIME_GATE_END_HOUR}:00 (${config.TIME_GATE_TIMEZONE})`
  );
});
