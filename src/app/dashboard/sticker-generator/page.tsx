import DashboardLayout from "@/components/layout/DashboardLayout";
import StickerGeneratorTabs from "@/components/sticker-generator/StickerGeneratorTabs";

// Server component: resolve the default AI provider from env so the client
// dropdown starts with the real provider (never defaults silently to mock
// when a provider is configured).
export default function StickerGeneratorPage() {
  const defaultProvider = process.env.AI_PROVIDER || "mock";

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
      <StickerGeneratorTabs defaultProvider={defaultProvider} />
    </DashboardLayout>
  );
}