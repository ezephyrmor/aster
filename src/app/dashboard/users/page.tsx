"use client";

import { useRouter } from "next/navigation";
import UserList from "@/components/UserList";
import DashboardLayout from "@/components/DashboardLayout";

export default function UsersPage() {
  const router = useRouter();

  const handleAddUser = () => {
    router.push("/dashboard/users/create");
  };

  return (
    <DashboardLayout
      title="Users"
      subtitle="Manage employee accounts and profiles"
    >
      <UserList onAddClick={handleAddUser} />
    </DashboardLayout>
  );
}
