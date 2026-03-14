"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { TimeGateGuard } from "@/components/time-gate-guard";
import { useSocket } from "@/hooks/use-socket";
import type { MatchFoundPayload } from "@/types";

function LobbyContent() {
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);

  // Redirect to gender selection if not set
  useEffect(() => {
    if (!sessionStorage.getItem("gender")) {
      router.replace("/gender");
    }
  }, [router]);

  // Fetch live online count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/time-gate");
        const data = await res.json();
        setOnlineCount(data.waitingCount || 0);
      } catch { /* ignore */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMatchFound = useCallback(
    (data: MatchFoundPayload) => {
      // Store match data for the chat page
      sessionStorage.setItem("match", JSON.stringify(data));
      router.push("/chat");
    },
    [router]
  );

  // Send stored gender to server when socket connects
  useEffect(() => {
    if (!socket || !isConnected) return;
    const gender = sessionStorage.getItem("gender") as "male" | "female" | "other" | null;
    if (gender) {
      socket.emit("set_gender", gender);
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket) return;

    socket.on("match_found", handleMatchFound);
    socket.on("queue_joined", () => {
      setStatus("Looking for someone to chat with...");
    });
    socket.on("error", (data) => {
      setStatus(data.message);
      setIsSearching(false);
    });
    socket.on("force_disconnect", (data) => {
      alert(data.reason);
      router.push("/");
    });

    return () => {
      socket.off("match_found", handleMatchFound);
      socket.off("queue_joined");
      socket.off("error");
      socket.off("force_disconnect");
    };
  }, [socket, handleMatchFound, router]);

  const joinQueue = () => {
    if (!socket || !isConnected) return;
    socket.emit("join_queue");
    setIsSearching(true);
  };

  const leaveQueue = () => {
    if (!socket) return;
    socket.emit("leave_queue");
    setIsSearching(false);
    setStatus("");
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to chat?</h2>
        <p className="text-[var(--muted)]">
          You&apos;ll be matched with a random Krea student
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-sm text-green-400 font-medium">{onlineCount} online now</span>
        </div>

        {!isConnected && (
          <p className="text-yellow-400 text-sm">Connecting to server...</p>
        )}

        {isSearching ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <span className="text-purple-400">{status}</span>
            </div>
            <button
              onClick={leaveQueue}
              className="rounded-lg border border-[var(--card-border)] px-6 py-2 text-sm text-[var(--muted)] transition hover:bg-[var(--card-border)]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={joinQueue}
            disabled={!isConnected}
            className="rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            Start Chatting
          </button>
        )}
      </div>
    </div>
  );
}

export default function LobbyPage() {
  return (

      <div className="flex min-h-screen flex-col">
        <Navbar />
        <TimeGateGuard>
          <LobbyContent />
        </TimeGateGuard>
      </div>

  );
}
