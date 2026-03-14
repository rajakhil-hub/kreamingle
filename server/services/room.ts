import { randomUUID } from "crypto";
import { ROOM_PREFIX } from "../../shared/constants.js";

export interface Room {
  id: string;
  socket1Id: string;
  socket2Id: string;
  email1: string;
  email2: string;
  createdAt: Date;
}

class RoomService {
  private rooms = new Map<string, Room>();
  private socketToRoom = new Map<string, string>();
  private emailToRoom = new Map<string, string>();
  private pendingDisconnects = new Map<string, NodeJS.Timeout>();

  createRoom(socket1Id: string, socket2Id: string, email1: string, email2: string): Room {
    const id = `${ROOM_PREFIX}${randomUUID().slice(0, 8)}`;
    const room: Room = { id, socket1Id, socket2Id, email1, email2, createdAt: new Date() };

    this.rooms.set(id, room);
    this.socketToRoom.set(socket1Id, id);
    this.socketToRoom.set(socket2Id, id);
    this.emailToRoom.set(email1, id);
    this.emailToRoom.set(email2, id);

    return room;
  }

  getPartner(socketId: string): string | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    return room.socket1Id === socketId ? room.socket2Id : room.socket1Id;
  }

  getRoomBySocket(socketId: string): Room | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    return this.rooms.get(roomId) || null;
  }

  /**
   * Try to rejoin a room after socket reconnection.
   * Returns the room if the email has an active room, and updates the socket ID.
   */
  rejoinRoom(email: string, newSocketId: string): Room | null {
    const roomId = this.emailToRoom.get(email);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Cancel any pending disconnect timer for this email
    const timer = this.pendingDisconnects.get(email);
    if (timer) {
      clearTimeout(timer);
      this.pendingDisconnects.delete(email);
      console.log(`[room] Cancelled pending disconnect for ${email}`);
    }

    // Update the socket ID in the room
    if (room.email1 === email) {
      this.socketToRoom.delete(room.socket1Id);
      room.socket1Id = newSocketId;
    } else if (room.email2 === email) {
      this.socketToRoom.delete(room.socket2Id);
      room.socket2Id = newSocketId;
    }

    this.socketToRoom.set(newSocketId, roomId);
    console.log(`[room] ${email} rejoined room ${roomId} with new socket ${newSocketId}`);
    return room;
  }

  /**
   * Schedule room destruction after a disconnect.
   * If the user reconnects within the grace period, the destruction is cancelled.
   */
  scheduleDestroy(socketId: string, gracePeriodMs: number, onDestroy: () => void): void {
    const room = this.getRoomBySocket(socketId);
    if (!room) return;

    const email = room.socket1Id === socketId ? room.email1 : room.email2;

    // Remove old socket mapping immediately
    this.socketToRoom.delete(socketId);

    const timer = setTimeout(() => {
      this.pendingDisconnects.delete(email);
      // Fully destroy the room
      this.emailToRoom.delete(room.email1);
      this.emailToRoom.delete(room.email2);
      this.socketToRoom.delete(room.socket1Id);
      this.socketToRoom.delete(room.socket2Id);
      this.rooms.delete(room.id);
      console.log(`[room] Room ${room.id} destroyed after grace period`);
      onDestroy();
    }, gracePeriodMs);

    this.pendingDisconnects.set(email, timer);
  }

  destroyRoom(roomId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Clear any pending timers
    const t1 = this.pendingDisconnects.get(room.email1);
    const t2 = this.pendingDisconnects.get(room.email2);
    if (t1) { clearTimeout(t1); this.pendingDisconnects.delete(room.email1); }
    if (t2) { clearTimeout(t2); this.pendingDisconnects.delete(room.email2); }

    this.socketToRoom.delete(room.socket1Id);
    this.socketToRoom.delete(room.socket2Id);
    this.emailToRoom.delete(room.email1);
    this.emailToRoom.delete(room.email2);
    this.rooms.delete(roomId);

    return room;
  }

  destroyBySocket(socketId: string): Room | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    return this.destroyRoom(roomId);
  }

  destroyAll(): void {
    for (const timer of this.pendingDisconnects.values()) {
      clearTimeout(timer);
    }
    this.pendingDisconnects.clear();
    this.rooms.clear();
    this.socketToRoom.clear();
    this.emailToRoom.clear();
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomByEmail(email: string): Room | null {
    const roomId = this.emailToRoom.get(email);
    if (!roomId) return null;
    return this.rooms.get(roomId) || null;
  }
}

export const roomService = new RoomService();
