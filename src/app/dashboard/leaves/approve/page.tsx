import DashboardLayout from "@/components/DashboardLayout";
import LeaveList from "@/components/LeaveList";

export default function LeaveApprovePage() {
  return (
    <DashboardLayout
      title="Leave Manager"
      subtitle="Review and approve employee leave requests"
    >
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all leave requests from employees. Review, approve, or
            deny requests with comments.
          </p>
        </div>
      </div>

      <LeaveList />
    </DashboardLayout>
  );
}
