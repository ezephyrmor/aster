import Link from "next/link";
import TeamList from "@/components/TeamList";
import DashboardLayout from "@/components/DashboardLayout";

export default function TeamsPage() {
  return (
    <DashboardLayout title="Teams" subtitle="Manage teams and team members">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            A list of all teams in the organization including member count and
            team leaders.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/teams/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Create Team
          </Link>
        </div>
      </div>

      <TeamList />
    </DashboardLayout>
  );
}
