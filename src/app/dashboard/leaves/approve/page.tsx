import DashboardLayout from "@/components/DashboardLayout";
import LeaveList from "@/components/LeaveList";

export default function LeaveApprovePage() {
  return (
    <DashboardLayout
      title="Leave"
      subtitle="Review and approve employee leave requests"
    >
      <LeaveList />
    </DashboardLayout>
  );
}
