"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  color: string;
  createdBy: number;
  creatorName: string;
  createdAt: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export default function CalendarPage() {
  const { user, isLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    endTime: "10:00",
    color: "blue",
  });

  const colorOptions = [
    { value: "blue", class: "bg-blue-500" },
    { value: "green", class: "bg-green-500" },
    { value: "purple", class: "bg-purple-500" },
    { value: "orange", class: "bg-orange-500" },
    { value: "red", class: "bg-red-500" },
  ];

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

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      startDate: formatDateForInput(day.date),
      startTime: "09:00",
      endDate: formatDateForInput(day.date),
      endTime: "10:00",
      color: "blue",
    });
    setShowModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    setFormData({
      title: event.title,
      description: event.description || "",
      startDate: formatDateForInput(start),
      startTime: start.toTimeString().slice(0, 5),
      endDate: formatDateForInput(end),
      endTime: end.toTimeString().slice(0, 5),
      color: event.color,
    });
    setShowModal(true);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("You must be logged in to create events");
      return;
    }

    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`,
    );
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    const eventData = {
      title: formData.title,
      description: formData.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      color: formData.color,
      createdBy: user.id,
    };

    try {
      let response;
      if (editingEvent) {
        response = await fetch(`/api/calendar/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      }

      if (response.ok) {
        fetchEvents();
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          startDate: "",
          startTime: "09:00",
          endDate: "",
          endTime: "10:00",
          color: "blue",
        });
        setEditingEvent(null);
      } else {
        const errorData = await response.json();
        alert(`Failed to save event: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;

    try {
      const response = await fetch(`/api/calendar/events/${editingEvent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEvents();
        setShowModal(false);
        setEditingEvent(null);
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
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

  if (isLoading) {
    return (
      <DashboardLayout title="Calendar" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  const days = getDaysInMonth();

  return (
    <DashboardLayout title="Calendar" subtitle="View and manage company events">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
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
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
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
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setEditingEvent(null);
              setFormData({
                title: "",
                description: "",
                startDate: formatDateForInput(new Date()),
                startTime: "09:00",
                endDate: formatDateForInput(new Date()),
                endTime: "10:00",
                color: "blue",
              });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            + Add Event
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 py-2"
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
                onClick={() => handleDayClick(day)}
                className={`min-h-24 p-2 rounded-lg cursor-pointer transition-colors ${
                  day.isToday
                    ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500"
                    : day.isCurrentMonth
                      ? "bg-zinc-50 dark:bg-zinc-700/30 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      : "bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {day.events.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className={`text-xs text-white px-2 py-1 rounded truncate cursor-pointer ${getColorClass(event.color)} hover:opacity-80`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {day.events.length > 3 && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {editingEvent ? "Edit Event" : "Add New Event"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingEvent(null);
                }}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Color
                </label>
                <div className="flex gap-3">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, color: option.value })
                      }
                      className={`w-10 h-10 rounded-full ${option.class} transition-transform ${
                        formData.color === option.value
                          ? "ring-2 ring-offset-2 ring-zinc-400 scale-110"
                          : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={handleDeleteEvent}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
