"use client";

import { useRouter } from "next/navigation";
import BrandList from "@/components/BrandList";
import DashboardLayout from "@/components/DashboardLayout";

export default function BrandsPage() {
  const router = useRouter();

  const handleCreateBrand = () => {
    router.push("/dashboard/brands/create");
  };

  return (
    <DashboardLayout
      title="Brands"
      subtitle="Manage client brands and their teams"
    >
      <BrandList onAddClick={handleCreateBrand} />
    </DashboardLayout>
  );
}
