"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );

      const response = await fetch(
        `/api/calendar/events?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`,
      );
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];

    // Add days from previous month
    const startingDay = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay.getDate() - i),
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    // Add days from current month
    const today = new Date();
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
        events: events.filter((event) => {
          const eventDate = new Date(event.startDate);
          return (
            eventDate.getDate() === i &&
            eventDate.getMonth() === month &&
            eventDate.getFullYear() === year
          );
        }),
      });
    }

    // Add days from next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
        1,
      ),
    );
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
    };
    return colors[color] || "bg-blue-500";
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.startDate) >= now)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      )
      .slice(0, 5);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = getDaysInMonth();
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth("next")}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <Link
          href="/dashboard/calendar"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-8 p-1 rounded text-center ${
                day.isToday
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-500"
                  : day.isCurrentMonth
                    ? "hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              <div className="text-xs font-medium">{day.date.getDate()}</div>
              {day.events.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {day.events.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${getColorClass(event.color)}`}
                      title={event.title}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 p-4">
          <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Upcoming Events
          </h4>
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-700/30 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${getColorClass(event.color)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDate(event.startDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}
