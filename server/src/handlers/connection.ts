import type { Server, Socket } from "socket.io";
import { queueService } from "../services/queue.js";
import { roomService } from "../services/room.js";
import { registerMatchmakingHandlers } from "./matchmaking.js";
import { registerSignalingHandlers } from "./signaling.js";
import { registerChatHandlers } from "./chat.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "../../../shared/socket-events";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerConnectionHandler(io: IOServer): void {
  io.on("connection", (socket: IOSocket) => {
    console.log(`[connect] ${socket.data.name} (${socket.data.email}) — ${socket.id}`);

    // Register all event handlers
    registerMatchmakingHandlers(io, socket);
    registerSignalingHandlers(io, socket);
    registerChatHandlers(io, socket);

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`[disconnect] ${socket.data.name} — ${reason}`);

      // Remove from queue if waiting
      queueService.removeFromQueue(socket.id);

      // Notify partner and destroy room if in one
      const partner = roomService.getPartner(socket.id);
      if (partner) {
        io.to(partner).emit("partner_disconnected");
        roomService.destroyBySocket(socket.id);
      }
    });
  });
}
