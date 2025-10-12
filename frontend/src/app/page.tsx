"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import LiveMapUseMemo from "@/components/LiveMapUseMemo";

export default function Home() {
  const LiveMap = LiveMapUseMemo();

  return (
    <main className="h-screen w-screen">
      <LiveMap />
    </main>
  );
}
