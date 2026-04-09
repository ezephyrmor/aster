"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface TeamMember {
  id: number;
  userId: number;
  isLeader: boolean;
  joinedAt: string;
  user: {
    id: number;
    username: string;
    employeeProfile: {
      firstName: string;
      lastName: string;
      position?: string | null;
    } | null;
  };
}

interface TeamHistory {
  id: number;
  action: string;
  reason?: string | null;
  metadata?: {
    name?: { old: string; new: string };
    description?: { old: string | null; new: string | null };
    brandId?: { old: number; new: number };
  } | null;
  createdAt: string;
  teamMember?: {
    user: {
      id: number;
      username: string;
      employeeProfile: {
        firstName: string;
        lastName: string;
      } | null;
    };
  } | null;
}

interface UserSearchResult {
  id: number;
  username: string;
  displayName: string;
  position: string | null;
  department: string | null;
  currentTeam?: {
    teamId: number;
    teamName: string;
    brandName: string;
    isLeader: boolean;
    status: string;
    isInSpecifiedTeam: boolean;
  } | null;
}

interface PendingMember {
  user: UserSearchResult;
  isLeader: boolean;
}

interface Team {
  id: number;
  name: string;
  description?: string | null;
  members: TeamMember[];
  history: TeamHistory[];
}

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isLeader, setIsLeader] = useState(false);

  // Autocomplete search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLUListElement>(null);

  // Pending members (staging list)
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results when debounced search changes
  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      const fetchSearchResults = async () => {
        setIsSearching(true);
        try {
          const response = await fetch(
            `/api/users/search?q=${encodeURIComponent(debouncedSearch)}&teamId=${resolvedParams.id}`,
          );
          if (response.ok) {
            const data = await response.json();
            // Filter out users already in pending list
            const filtered = data.filter(
              (user: UserSearchResult) =>
                !pendingMembers.some((pm) => pm.user.id === user.id),
            );
            setSearchResults(filtered);
            setShowSearchResults(true);
          }
        } catch (err) {
          console.error("Error searching users:", err);
        } finally {
          setIsSearching(false);
        }
      };

      fetchSearchResults();
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [debouncedSearch, pendingMembers, resolvedParams.id]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`/api/teams/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch team");
        }
        const data = await response.json();
        setTeam(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [resolvedParams.id]);

  const handleAddToPending = (user: UserSearchResult) => {
    if (!pendingMembers.some((pm) => pm.user.id === user.id)) {
      setPendingMembers((prev) => [...prev, { user, isLeader: false }]);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    searchInputRef.current?.focus();
  };

  const handleRemoveFromPending = (userId: number) => {
    setPendingMembers((prev) => prev.filter((pm) => pm.user.id !== userId));
  };

  const handleTogglePendingLeader = (userId: number) => {
    setPendingMembers((prev) =>
      prev.map((pm) =>
        pm.user.id === userId ? { ...pm, isLeader: !pm.isLeader } : pm,
      ),
    );
  };

  const handleAddMembers = async () => {
    if (pendingMembers.length === 0) return;

    setIsAddingMembers(true);
    try {
      // Add all pending members
      for (const pm of pendingMembers) {
        const response = await fetch(
          `/api/teams/${resolvedParams.id}/members`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: pm.user.id,
              isLeader: pm.isLeader,
            }),
          },
        );

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to add member");
        }
      }

      // Refresh team data
      const updatedTeam = await fetch(`/api/teams/${resolvedParams.id}`).then(
        (res) => res.json(),
      );
      setTeam(updatedTeam);
      setShowAddMemberModal(false);
      setPendingMembers([]);
      setSearchQuery("");
      setSearchResults([]);
      setIsLeader(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddMemberModal(false);
    setPendingMembers([]);
    setSearchQuery("");
    setSearchResults([]);
    setIsLeader(false);
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this member from the team?"))
      return;

    try {
      const response = await fetch(
        `/api/teams/${resolvedParams.id}/members/${memberId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to remove member");
      }

      // Refresh team data
      const updatedTeam = await fetch(`/api/teams/${resolvedParams.id}`).then(
        (res) => res.json(),
      );
      setTeam(updatedTeam);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleToggleLeader = async (
    memberId: number,
    currentIsLeader: boolean,
  ) => {
    try {
      const response = await fetch(
        `/api/teams/${resolvedParams.id}/members/${memberId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isLeader: !currentIsLeader,
          }),
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update member");
      }

      // Refresh team data
      const updatedTeam = await fetch(`/api/teams/${resolvedParams.id}`).then(
        (res) => res.json(),
      );
      setTeam(updatedTeam);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Team Details"
        subtitle="Loading..."
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !team) {
    return (
      <DashboardLayout
        title="Team Details"
        subtitle="Error"
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        }
      >
        <div className="text-center py-12">
          <p className="text-red-600">{error || "Team not found"}</p>
          <button
            onClick={() => router.push("/dashboard/teams")}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Back to Teams
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      joined: "Joined",
      left: "Left",
      promoted: "Promoted to Leader",
      demoted: "Demoted from Leader",
      removed: "Removed",
      created: "Team Created",
      updated: "Updated",
    };
    return labels[action] || action;
  };

  const getUpdateDetails = (event: TeamHistory) => {
    if (event.action !== "updated" || !event.metadata) return null;

    const details: string[] = [];
    const metadata = event.metadata;

    if (metadata.name) {
      details.push(`Name: "${metadata.name.old}" → "${metadata.name.new}"`);
    }
    if (metadata.brandId) {
      details.push(`Brand: ${metadata.brandId.old} → ${metadata.brandId.new}`);
    }
    if (metadata.description) {
      details.push(`Description updated`);
    }

    return details;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      joined: "text-green-600 bg-green-50 dark:bg-green-900/20",
      left: "text-red-600 bg-red-50 dark:bg-red-900/20",
      promoted: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
      demoted: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
      removed: "text-red-600 bg-red-50 dark:bg-red-900/20",
      created: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
      updated: "text-gray-600 bg-gray-50 dark:bg-gray-900/20",
    };
    return colors[action] || "text-gray-600 bg-gray-50";
  };

  return (
    <DashboardLayout
      title={team.name}
      subtitle={team.description || "No description"}
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      }
    >
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Team Members */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Team Members ({team.members?.length ?? 0})
              </h2>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add Member
              </button>
            </div>

            {(team.members?.length ?? 0) === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No members in this team yet.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-zinc-700">
                {(team.members ?? []).map((member) => (
                  <li
                    key={member.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {member.user.employeeProfile
                              ? `${member.user.employeeProfile.firstName.charAt(0)}${member.user.employeeProfile.lastName.charAt(0)}`
                              : member.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {member.user.employeeProfile
                                ? `${member.user.employeeProfile.firstName} ${member.user.employeeProfile.lastName}`
                                : member.user.username}
                            </p>
                            {member.isLeader && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <svg
                                  className="mr-1 h-3 w-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Leader
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.user.employeeProfile?.position ||
                              member.user.username}{" "}
                            • Joined {formatDate(member.joinedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleToggleLeader(member.id, member.isLeader)
                          }
                          className={`px-3 py-1 text-xs font-medium rounded-md ${
                            member.isLeader
                              ? "text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                              : "text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                          }`}
                        >
                          {member.isLeader ? "Remove as Leader" : "Make Leader"}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="px-3 py-1 text-xs font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar - Team History */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Team History
              </h2>
            </div>

            {(team.history?.length ?? 0) === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No history yet.
              </div>
            ) : (
              <div className="flow-root px-6 py-4">
                <ul className="-mb-8">
                  {(team.history ?? []).map((event, eventIdx) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {eventIdx !== (team.history?.length ?? 0) - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-zinc-700"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span
                              className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-zinc-800 ${getActionColor(event.action)}`}
                            >
                              <svg
                                className="h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                {event.action === "joined" && (
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                )}
                                {event.action === "left" && (
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                )}
                                {event.action === "promoted" && (
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                )}
                                {event.action === "demoted" && (
                                  <path
                                    fillRule="evenodd"
                                    d="M12 7a1 1 0 110-2h6a1 1 0 011 1v6a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414-1.414L15.586 7H12z"
                                    clipRule="evenodd"
                                  />
                                )}
                                {event.action === "removed" && (
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                  />
                                )}
                                {event.action === "created" && (
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                )}
                                {event.action === "updated" && (
                                  <path
                                    fillRule="evenodd"
                                    d="M11.541 4.093a1 1 0 011.358.365l.561 1.122a1 1 0 001.79 0l.561-1.122a1 1 0 011.358-.365l1.244.622a1 1 0 010 1.79l-1.122.561a1 1 0 000 1.79l1.122.561a1 1 0 010 1.79l-1.244.622a1 1 0 01-1.358-.365l-.561-1.122a1 1 0 00-1.79 0l-.561 1.122a1 1 0 01-1.358.365l-1.244-.622a1 1 0 010-1.79l1.122-.561a1 1 0 000-1.79l-1.122-.561a1 1 0 010-1.79l1.244-.622z"
                                    clipRule="evenodd"
                                  />
                                )}
                              </svg>
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {event.teamMember
                                  ? `${event.teamMember.user.employeeProfile?.firstName || ""} ${event.teamMember.user.employeeProfile?.lastName || ""} (${event.teamMember.user.username})`
                                  : "System"}{" "}
                                - {getActionLabel(event.action)}
                              </p>
                              {event.action === "updated" && event.metadata && (
                                <ul className="mt-1 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                                  {getUpdateDetails(event)?.map(
                                    (detail, idx) => (
                                      <li key={idx}>• {detail}</li>
                                    ),
                                  )}
                                </ul>
                              )}
                              {event.reason && event.action !== "updated" && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  Reason: {event.reason}
                                </p>
                              )}
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                              <time dateTime={event.createdAt}>
                                {formatDate(event.createdAt)}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal with Autocomplete */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-25"
              onClick={handleCloseModal}
            />
            <div className="relative bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-lg w-full shadow-xl">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Add Team Members
              </h3>

              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search Employees
                  </label>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search employees..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-zinc-700 dark:border-zinc-600"
                  />

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <ul
                      ref={searchResultsRef}
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-700 rounded-md shadow-lg max-h-80 overflow-auto border border-gray-200 dark:border-zinc-600"
                    >
                      {searchResults.map((user) => (
                        <li
                          key={user.id}
                          onClick={() => handleAddToPending(user)}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-600 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {user.displayName}
                                </p>
                                {user.currentTeam && (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      user.currentTeam.isInSpecifiedTeam
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    }`}
                                  >
                                    {user.currentTeam.isInSpecifiedTeam
                                      ? "✓ Already in team"
                                      : "In another team"}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.position || user.username}
                                {user.department && ` • ${user.department}`}
                              </p>
                              {user.currentTeam && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  Current: {user.currentTeam.teamName} (
                                  {user.currentTeam.brandName})
                                  {user.currentTeam.isLeader && " • Leader"}
                                </p>
                              )}
                            </div>
                            <svg
                              className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {showSearchResults && isSearching && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-700 rounded-md shadow-lg p-4 text-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                  )}
                </div>

                {/* Pending Members List */}
                {pendingMembers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Members to Add ({pendingMembers.length})
                    </label>
                    <ul className="border border-gray-200 dark:border-zinc-600 rounded-md divide-y divide-gray-200 dark:divide-zinc-600">
                      {pendingMembers.map((pm) => (
                        <li
                          key={pm.user.id}
                          className="px-4 py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center flex-1">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                              <span className="text-xs font-bold text-white">
                                {pm.user.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {pm.user.displayName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {pm.user.position || pm.user.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                              <input
                                type="checkbox"
                                checked={pm.isLeader}
                                onChange={() =>
                                  handleTogglePendingLeader(pm.user.id)
                                }
                                className="mr-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              Leader
                            </label>
                            <button
                              onClick={() =>
                                handleRemoveFromPending(pm.user.id)
                              }
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pendingMembers.length === 0 && searchQuery.length < 2 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Type at least 2 characters to search for employees
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-zinc-700 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMembers}
                  disabled={isAddingMembers || pendingMembers.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingMembers
                    ? "Adding..."
                    : `Add ${pendingMembers.length} Member${pendingMembers.length !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
