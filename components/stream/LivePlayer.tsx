"use client";

type LivePlayerProps = {
  title?: string;
  isLive?: boolean;
};

export default function LivePlayer({ title, isLive = true }: LivePlayerProps) {
  return (
    <div className="relative w-full h-[460px] md:h-[520px] rounded-2xl overflow-hidden bg-linear-to-br from-zinc-900 via-black to-zinc-950 border border-zinc-800 shadow-[0_0_120px_rgba(16,185,129,0.25)]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 -top-24 w-72 h-72 bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-10 bottom-0 w-64 h-64 bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
          <div className="flex items-center gap-3">
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                isLive
                  ? "bg-red-500/90 text-white"
                  : "bg-zinc-800 text-zinc-200"
              }`}
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-current animate-pulse" />
              {isLive ? "LIVE" : "OFFLINE"}
            </div>
            <h2 className="text-sm md:text-base font-semibold text-zinc-50 line-clamp-1">
              {title || "Live Commerce Stream"}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="h-1.5 w-24 rounded-full bg-zinc-800 overflow-hidden">
              <span className="block h-full w-1/3 bg-emerald-400/80 animate-pulse" />
            </span>
            <span>Streaming</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-4 rounded-2xl border border-zinc-800/60 bg-linear-to-b from-zinc-950/80 via-black/70 to-zinc-950/90 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400/90 tracking-[0.32em] uppercase">
                <span className="h-px w-6 bg-emerald-500/50" />
                Live Preview
                <span className="h-px w-6 bg-emerald-500/50" />
              </div>
              <p className="text-center text-zinc-200 text-sm md:text-base max-w-md">
                Connect your live encoder or streaming service to start
                broadcasting your product showcase.
              </p>
              <p className="text-xs text-zinc-500">
                This MVP uses a visual placeholder. Integrate HLS/WebRTC for
                production streaming.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
