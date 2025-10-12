"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function LiveMapUseMemo() {
  const LiveMap = useMemo(
    () =>
      dynamic(() => import("@/components/LiveMap"), {
        loading: () => <p>Loading map...</p>,
        ssr: false,
      }),
    []
  );
  return LiveMap;
}
