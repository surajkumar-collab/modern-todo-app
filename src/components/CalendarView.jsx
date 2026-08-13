import { useEffect, useMemo, useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
} from "react-icons/fi";

import { supabase } from "../supabaseClient";

function CalendarView({ user }) {
  // =====================================================
  // TASKS
  // =====================================================

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  // =====================================================
  // CURRENT MONTH
  // =====================================================

  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  // =====================================================
  // SELECTED DATE
  // =====================================================

  const [selectedDate, setSelectedDate] = useState(null);

  // =====================================================
  // FETCH TASKS
  // =====================================================

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user?.id) {
        setTasks([]);
        setTasksLoading(false);
        return;
      }

      setTasksLoading(true);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Calendar tasks fetch error:",
          error
        );

        setTasks([]);
      } else {
        setTasks(data || []);
      }

      setTasksLoading(false);
    };

    fetchTasks();
  }, [user]);

  // =====================================================
  // YEAR / MONTH
  // =====================================================

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // =====================================================
  // MONTH NAME
  // =====================================================

  const monthName = currentDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  // =====================================================
  // WEEK DAYS
  // =====================================================

  const weekDays = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
  ];

  // =====================================================
  // DAYS IN CURRENT MONTH
  // =====================================================

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  // =====================================================
  // FIRST DAY OF CURRENT MONTH
  // =====================================================

  const firstDayOfMonth = new Date(
    year,
    month,
    1
  ).getDay();

  // =====================================================
  // TODAY
  // =====================================================

  const today = new Date();

  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  // =====================================================
  // CREATE DATE STRING
  // =====================================================

  const createDateString = (day) => {
    return `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
  };

  // =====================================================
  // NORMALIZE TASK DATE
  // =====================================================

  const normalizeTaskDate = (date) => {
    if (!date) return null;

    return String(date).slice(0, 10);
  };

  // =====================================================
  // GET TASKS FOR A PARTICULAR DAY
  // =====================================================

  const getTasksForDay = (day) => {
    if (!day) return [];

    const dateString = createDateString(day);

    return tasks.filter(
      (task) =>
        normalizeTaskDate(task.due_date) ===
        dateString
    );
  };

  // =====================================================
  // SELECTED DATE TASKS
  // =====================================================

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];

    return tasks.filter(
      (task) =>
        normalizeTaskDate(task.due_date) ===
        selectedDate
    );
  }, [tasks, selectedDate]);

  // =====================================================
  // PREVIOUS MONTH
  // =====================================================

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );

    setSelectedDate(null);
  };

  // =====================================================
  // NEXT MONTH
  // =====================================================

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );

    setSelectedDate(null);
  };

  // =====================================================
  // TODAY
  // =====================================================

  const goToToday = () => {
    const now = new Date();

    setCurrentDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      )
    );

    setSelectedDate(todayString);
  };

  // =====================================================
  // CALENDAR CELLS
  // =====================================================

  const calendarCells = [];

  // Empty cells before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }

  // Actual days
  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(day);
  }

  // =====================================================
  // SELECT DATE
  // =====================================================

  const handleDateClick = (day) => {
    if (!day) return;

    const dateString = createDateString(day);

    setSelectedDate(dateString);
  };

  // =====================================================
  // FORMAT SELECTED DATE
  // =====================================================

  const formattedSelectedDate = selectedDate
    ? new Date(
        `${selectedDate}T00:00:00`
      ).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  // =====================================================
  // PRIORITY STYLE
  // =====================================================

  const getPriorityClass = (priority) => {
    if (priority === "high") {
      return "bg-red-500/10 text-red-400 border-red-500/10";
    }

    if (priority === "medium") {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/10";
    }

    return "bg-green-500/10 text-green-400 border-green-500/10";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (tasksLoading) {
    return (
      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <FiCalendar size={23} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">
              Calendar
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Loading your tasks...
            </p>
          </div>

        </div>

        <div className="mt-6 grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800">

          {Array.from({ length: 35 }).map(
            (_, index) => (
              <div
                key={index}
                className="min-h-[90px] bg-slate-950/80"
              />
            )
          )}

        </div>

      </section>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        {/* TITLE */}

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <FiCalendar size={23} />
          </div>

          <div>

            <h3 className="text-xl font-bold text-white">
              Calendar
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              View your tasks by due date.
            </p>

          </div>

        </div>

        {/* NAVIGATION */}

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={goToPreviousMonth}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
            title="Previous month"
          >
            <FiChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="h-11 rounded-xl border border-slate-800 bg-slate-900 px-5 text-sm font-semibold text-white transition hover:border-blue-500/40 hover:bg-slate-800"
          >
            Today
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
            title="Next month"
          >
            <FiChevronRight size={20} />
          </button>

        </div>

      </div>

      {/* ================================================= */}
      {/* MONTH */}
      {/* ================================================= */}

      <div className="mb-5 text-center">

        <h4 className="text-2xl font-bold text-white">
          {monthName}
        </h4>

        <p className="mt-1 text-xs text-slate-600">
          {tasks.length} total tasks
        </p>

      </div>

      {/* ================================================= */}
      {/* WEEK DAYS */}
      {/* ================================================= */}

      <div className="mb-2 grid grid-cols-7">

        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold tracking-wide text-slate-500"
          >
            {day}
          </div>
        ))}

      </div>

      {/* ================================================= */}
      {/* CALENDAR */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-800">

        <div className="grid grid-cols-7">

          {calendarCells.map(
            (day, index) => {
              const dateString = day
                ? createDateString(day)
                : null;

              const dayTasks = day
                ? getTasksForDay(day)
                : [];

              const isToday =
                dateString === todayString;

              const isSelected =
                dateString === selectedDate;

              return (
                <button
                  type="button"
                  key={`${day}-${index}`}
                  disabled={!day}
                  onClick={() =>
                    handleDateClick(day)
                  }
                  className={`relative min-h-[105px] border-b border-r border-slate-800/80 p-2 text-left transition sm:min-h-[125px] sm:p-3 ${
                    !day
                      ? "cursor-default bg-slate-950/20"
                      : isSelected
                      ? "bg-blue-500/10 ring-1 ring-inset ring-blue-500/50"
                      : "bg-slate-950/40 hover:bg-slate-900/80"
                  }`}
                >

                  {/* DAY */}

                  {day && (
                    <div className="flex items-center justify-between">

                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? "bg-blue-500 text-white"
                            : isSelected
                            ? "bg-blue-500/20 text-blue-300"
                            : "text-slate-400"
                        }`}
                      >
                        {day}
                      </span>

                      {dayTasks.length > 0 && (
                        <span className="text-[10px] font-medium text-slate-600">
                          {dayTasks.length}
                        </span>
                      )}

                    </div>
                  )}

                  {/* TASKS */}

                  {day &&
                    dayTasks.length > 0 && (
                      <div className="mt-3 space-y-1.5">

                        {dayTasks
                          .slice(0, 3)
                          .map((task) => {

                            const priority =
                              task.priority ||
                              "medium";

                            return (
                              <div
                                key={task.id}
                                className={`truncate rounded-lg border px-2 py-1.5 text-[10px] font-medium ${getPriorityClass(
                                  priority
                                )} ${
                                  task.completed
                                    ? "opacity-50 line-through"
                                    : ""
                                }`}
                                title={task.title}
                              >

                                <span className="mr-1">
                                  •
                                </span>

                                {task.title}

                              </div>
                            );
                          })}

                        {dayTasks.length >
                          3 && (
                          <p className="px-1 text-[10px] font-medium text-slate-600">
                            +
                            {dayTasks.length -
                              3}{" "}
                            more
                          </p>
                        )}

                      </div>
                    )}

                </button>
              );
            }
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* SELECTED DATE */}
      {/* ================================================= */}

      {selectedDate && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">

          {/* HEADER */}

          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Selected Date
              </p>

              <h4 className="mt-1 text-lg font-bold text-white">
                {formattedSelectedDate}
              </h4>

            </div>

            <span className="w-fit rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              {selectedDateTasks.length}{" "}
              {selectedDateTasks.length ===
              1
                ? "task"
                : "tasks"}
            </span>

          </div>

          {/* NO TASKS */}

          {selectedDateTasks.length ===
          0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 px-5 py-10 text-center">

              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-slate-600">
                <FiCalendar size={18} />
              </div>

              <p className="mt-3 text-sm font-medium text-slate-400">
                No tasks for this day
              </p>

              <p className="mt-1 text-xs text-slate-600">
                You don't have any tasks
                scheduled for this date.
              </p>

            </div>
          ) : (

            /* TASK DETAILS */

            <div className="space-y-3">

              {selectedDateTasks.map(
                (task) => {

                  const priority =
                    task.priority ||
                    "medium";

                  return (
                    <div
                      key={task.id}
                      className={`rounded-xl border p-4 transition ${
                        task.completed
                          ? "border-green-500/10 bg-green-500/5"
                          : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                      }`}
                    >

                      <div className="flex items-start gap-3">

                        {/* STATUS */}

                        <div
                          className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                            task.completed
                              ? "bg-green-400"
                              : priority ===
                                "high"
                              ? "bg-red-400"
                              : priority ===
                                "medium"
                              ? "bg-yellow-400"
                              : "bg-blue-400"
                          }`}
                        />

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h5
                              className={`font-semibold ${
                                task.completed
                                  ? "text-slate-500 line-through"
                                  : "text-white"
                              }`}
                            >
                              {task.title}
                            </h5>

                            {/* PRIORITY */}

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${getPriorityClass(
                                priority
                              )}`}
                            >
                              {priority}
                            </span>

                            {/* CATEGORY */}

                            {task.category && (
                              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-400">
                                {task.category}
                              </span>
                            )}

                            {/* RECURRENCE */}

                            {task.recurrence_type &&
                              task.recurrence_type !==
                                "none" && (
                                <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[10px] font-medium capitalize text-purple-400">
                                  ↻{" "}
                                  {
                                    task.recurrence_type
                                  }
                                </span>
                              )}

                          </div>

                          {/* DESCRIPTION */}

                          {task.description && (
                            <p className="mt-2 text-sm text-slate-500">
                              {
                                task.description
                              }
                            </p>
                          )}

                          {/* DUE DATE */}

                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">

                            <FiClock
                              size={13}
                            />

                            <span>
                              Due{" "}
                              {new Date(
                                `${selectedDate}T00:00:00`
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>

                          </div>

                          {/* REPEAT UNTIL */}

                          {task.recurrence_end_date && (
                            <p className="mt-1 text-xs text-slate-600">
                              Repeats until{" "}
                              {new Date(
                                `${task.recurrence_end_date}T00:00:00`
                              ).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>
      )}

    </section>
  );
}

export default CalendarView;