"use client";

import React from "react";

export default function Spotlight() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-40 overflow-hidden">
      {/* Soft, professional top ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[250px] w-full max-w-5xl bg-gradient-to-b from-zinc-700/5 to-transparent blur-[100px]" />
    </div>
  );
}
