"use client";

import { useEffect, useState } from "react";
import { getLiveStreams } from "@/services/stream.service";

export default function StreamsPage() {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    getLiveStreams().then(setStreams);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      {streams.map((s: any) => (
        <div key={s._id}>{s.title}</div>
      ))}
    </div>
  );
}
