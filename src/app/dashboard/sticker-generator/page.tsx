import { createHash } from "crypto";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StickerGeneratorTabs from "@/components/sticker-generator/StickerGeneratorTabs";

// Server component: resolve the default AI provider + a unique pack-name seed
// (md5 of the current timestamp) so the client never needs an MD5 bundle.
export default function StickerGeneratorPage() {
  const defaultProvider = process.env.AI_PROVIDER || "mock";
  const defaultPackName = createHash("md5")
    .update(String(Date.now()))
    .digest("hex");

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
      <StickerGeneratorTabs
        defaultProvider={defaultProvider}
        defaultPackName={defaultPackName}
      />
    </DashboardLayout>
  );
}