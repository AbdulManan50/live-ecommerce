"use client";

import LivePlayer from "@/components/stream/LivePlayer";
import ChatBox from "@/components/stream/ChatBox";

export default function StreamPage({ params }: any) {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <div className="col-span-2">
        <LivePlayer />
      </div>

      <div className="h-[500px]">
        <ChatBox streamId={params.id} />
      </div>
    </div>
  );
}
