"use client";

import { VideoPlayer } from "./video-player";

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export function VideoGrid({ localStream, remoteStream }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <VideoPlayer stream={localStream} muted label="You" />
      <VideoPlayer stream={remoteStream} label="Stranger" />
    </div>
  );
}
