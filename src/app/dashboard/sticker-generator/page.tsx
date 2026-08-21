"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StickerGeneratorBoard from "@/components/sticker-generator/StickerGeneratorBoard";

export default function StickerGeneratorPage() {
  const [key, setKey] = useState(0);
  return (
    <DashboardLayout
      title="Sticker Generator"
      subtitle="Generate production-ready transparent sticker assets"
      icon={
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3l3 5h8l3-5H5zm1 5v9a2 2 0 002 2h8a2 2 0 002-2V8M7 7h3m3-1h4"
          />
        </svg>
      }
    >
      <StickerGeneratorBoard key={key} onReset={() => setKey((k) => k + 1)} />
    </DashboardLayout>
  );
}