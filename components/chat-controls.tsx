"use client";

interface ChatControlsProps {
  onSkip: () => void;
  onStop: () => void;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

export function ChatControls({
  onSkip,
  onStop,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
}: ChatControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-3">
      <button
        onClick={onToggleAudio}
        className={`rounded-full p-3 transition ${
          isAudioEnabled
            ? "bg-[var(--card-border)] text-white hover:bg-[var(--muted)]"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
        title={isAudioEnabled ? "Mute mic" : "Unmute mic"}
      >
        {isAudioEnabled ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        )}
      </button>

      <button
        onClick={onToggleVideo}
        className={`rounded-full p-3 transition ${
          isVideoEnabled
            ? "bg-[var(--card-border)] text-white hover:bg-[var(--muted)]"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
        title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {isVideoEnabled ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        )}
      </button>

      <button
        onClick={onSkip}
        className="rounded-full bg-yellow-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-yellow-700"
      >
        Skip
      </button>

      <button
        onClick={onStop}
        className="rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Stop
      </button>
    </div>
  );
}
