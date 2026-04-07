"use client";

import { useRouter } from "next/navigation";
import TeamList from "@/components/TeamList";
import DashboardLayout from "@/components/DashboardLayout";

export default function TeamsPage() {
  const router = useRouter();

  const handleCreateTeam = () => {
    router.push("/dashboard/teams/create");
  };

  return (
    <DashboardLayout title="Teams" subtitle="Manage teams and team members">
      <TeamList onAddClick={handleCreateTeam} />
    </DashboardLayout>
  );
}
