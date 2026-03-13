export interface MatchResult {
  socket1Id: string;
  socket2Id: string;
}

class MatchmakingQueue {
  private queue: string[] = [];

  addToQueue(socketId: string): MatchResult | null {
    if (this.queue.includes(socketId)) return null;
    this.queue.push(socketId);
    return this.attemptMatch();
  }

  removeFromQueue(socketId: string): void {
    this.queue = this.queue.filter((id) => id !== socketId);
  }

  private attemptMatch(): MatchResult | null {
    if (this.queue.length < 2) return null;
    const socket1Id = this.queue.shift()!;
    const socket2Id = this.queue.shift()!;
    return { socket1Id, socket2Id };
  }

  getSize(): number {
    return this.queue.length;
  }

  isInQueue(socketId: string): boolean {
    return this.queue.includes(socketId);
  }

  clear(): void {
    this.queue = [];
  }
}

export const queueService = new MatchmakingQueue();
