import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit3,
} from "react-icons/fi";

import { supabase } from "../supabaseClient";

import TaskDetails from "./TaskDetails";

function CalendarView({
  user,
  refreshKey = 0,
  onEditTask,
  addToast,
}) {
  // =====================================================
  // TASKS
  // =====================================================

  const [tasks, setTasks] =
    useState([]);

  const [tasksLoading, setTasksLoading] =
    useState(true);

  // =====================================================
  // LOCAL REFRESH
  // =====================================================

  const [calendarRefreshKey, setCalendarRefreshKey] =
    useState(0);

  // =====================================================
  // CURRENT MONTH
  // =====================================================

  const [currentDate, setCurrentDate] =
    useState(new Date());

  // =====================================================
  // SELECTED DATE
  // =====================================================

  const [selectedDate, setSelectedDate] =
    useState(null);

  // =====================================================
  // VIEWING TASK
  // =====================================================

  const [viewingTask, setViewingTask] =
    useState(null);

  // =====================================================
  // FETCH TASKS
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchCalendarTasks =
      async () => {
        if (!user?.id) {
          if (isMounted) {
            setTasks([]);
            setTasksLoading(false);
          }

          return;
        }

        if (isMounted) {
          setTasksLoading(true);
        }

        try {
          const {
            data,
            error,
          } = await supabase
            .from("tasks")
            .select("*")
            .eq(
              "user_id",
              user.id
            )
            .order("due_date", {
              ascending: true,
            });

          if (error) {
            throw error;
          }

          if (isMounted) {
            setTasks(
              data || []
            );
          }
        } catch (error) {
          console.error(
            "Calendar tasks fetch error:",
            error
          );

          if (isMounted) {
            setTasks([]);

            addToast?.(
              "Failed to load calendar tasks",
              "error"
            );
          }
        } finally {
          if (isMounted) {
            setTasksLoading(false);
          }
        }
      };

    fetchCalendarTasks();

    return () => {
      isMounted = false;
    };
  }, [
    user?.id,
    refreshKey,
    calendarRefreshKey,
  ]);

  // =====================================================
  // YEAR / MONTH
  // =====================================================

  const year =
    currentDate.getFullYear();

  const month =
    currentDate.getMonth();

  // =====================================================
  // MONTH NAME
  // =====================================================

  const monthName =
    currentDate.toLocaleDateString(
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
  // DAYS IN MONTH
  // =====================================================

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  // =====================================================
  // FIRST DAY
  // =====================================================

  const firstDayOfMonth =
    new Date(
      year,
      month,
      1
    ).getDay();

  // =====================================================
  // TODAY
  // =====================================================

  const today =
    new Date();

  const todayString =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

  // =====================================================
  // CREATE DATE STRING
  // =====================================================

  const createDateString = (
    day
  ) => {
    return `${year}-${String(
      month + 1
    ).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  };

  // =====================================================
  // NORMALIZE DATE
  // =====================================================

  const normalizeTaskDate = (
    date
  ) => {
    if (!date) {
      return null;
    }

    return String(date).slice(
      0,
      10
    );
  };

  // =====================================================
  // TASKS FOR DAY
  // =====================================================

  const getTasksForDay = (
    day
  ) => {
    if (!day) {
      return [];
    }

    const dateString =
      createDateString(day);

    return tasks.filter(
      (task) =>
        normalizeTaskDate(
          task.due_date
        ) === dateString
    );
  };

  // =====================================================
  // SELECTED DATE TASKS
  // =====================================================

  const selectedDateTasks =
    useMemo(() => {
      if (!selectedDate) {
        return [];
      }

      return tasks.filter(
        (task) =>
          normalizeTaskDate(
            task.due_date
          ) === selectedDate
      );
    }, [
      tasks,
      selectedDate,
    ]);

  // =====================================================
  // PREVIOUS MONTH
  // =====================================================

  const goToPreviousMonth =
    () => {
      setCurrentDate(
        new Date(
          year,
          month - 1,
          1
        )
      );

      setSelectedDate(null);
    };

  // =====================================================
  // NEXT MONTH
  // =====================================================

  const goToNextMonth =
    () => {
      setCurrentDate(
        new Date(
          year,
          month + 1,
          1
        )
      );

      setSelectedDate(null);
    };

  // =====================================================
  // TODAY
  // =====================================================

  const goToToday = () => {
    const now =
      new Date();

    const currentYear =
      now.getFullYear();

    const currentMonth =
      now.getMonth();

    const currentDay =
      now.getDate();

    setCurrentDate(
      new Date(
        currentYear,
        currentMonth,
        1
      )
    );

    setSelectedDate(
      `${currentYear}-${String(
        currentMonth + 1
      ).padStart(2, "0")}-${String(
        currentDay
      ).padStart(2, "0")}`
    );
  };

  // =====================================================
  // CALENDAR CELLS
  // =====================================================

  const calendarCells = [];

  for (
    let i = 0;
    i < firstDayOfMonth;
    i++
  ) {
    calendarCells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(day);
  }

  while (
    calendarCells.length < 42
  ) {
    calendarCells.push(null);
  }

  // =====================================================
  // SELECT DATE
  // =====================================================

  const handleDateClick = (
    day
  ) => {
    if (!day) {
      return;
    }

    const dateString =
      createDateString(day);

    setSelectedDate(
      dateString
    );
  };

  // =====================================================
  // VIEW TASK
  // =====================================================

  const handleViewTask = (
    task
  ) => {
    if (!task) {
      return;
    }

    setViewingTask(task);
  };

  // =====================================================
  // CLOSE DETAILS
  // =====================================================

  const handleCloseDetails =
    () => {
      setViewingTask(null);
    };

  // =====================================================
  // EDIT FROM DETAILS
  // =====================================================

  const handleEditFromDetails =
    (task) => {
      if (!task) {
        return;
      }

      setViewingTask(null);

      if (onEditTask) {
        onEditTask(task);
      }
    };

  // =====================================================
  // TASK CHANGED
  // =====================================================

  const handleTaskChanged =
    (changedTask, action) => {
      // Close details
      setViewingTask(null);

      // Refresh calendar
      setCalendarRefreshKey(
        (previous) =>
          previous + 1
      );

      // Toast
      if (action === "deleted") {
        addToast?.(
          "Task deleted successfully",
          "success"
        );
      } else if (
        changedTask?.completed
      ) {
        addToast?.(
          "Task completed successfully",
          "success"
        );
      } else {
        addToast?.(
          "Task marked as active",
          "success"
        );
      }
    };

  // =====================================================
  // EDIT TASK
  // =====================================================

  const handleEditTask = (
    task
  ) => {
    if (!task) {
      return;
    }

    if (onEditTask) {
      onEditTask(task);
    }
  };

  // =====================================================
  // FORMAT SELECTED DATE
  // =====================================================

  const formattedSelectedDate =
    selectedDate
      ? new Date(
          `${selectedDate}T00:00:00`
        ).toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
      : "";

  // =====================================================
  // PRIORITY
  // =====================================================

  const getPriorityClass = (
    priority
  ) => {
    if (
      priority === "high"
    ) {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }

    if (
      priority === "medium"
    ) {
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }

    return "bg-green-500/10 text-green-400 border-green-500/20";
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    dateString
  ) => {
    if (!dateString) {
      return "";
    }

    return new Date(
      `${dateString}T00:00:00`
    ).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // MONTH TASK COUNT
  // =====================================================

  const monthTaskCount =
    tasks.filter(
      (task) => {
        const normalizedDate =
          normalizeTaskDate(
            task.due_date
          );

        if (!normalizedDate) {
          return false;
        }

        return normalizedDate.startsWith(
          `${year}-${String(
            month + 1
          ).padStart(2, "0")}`
        );
      }
    ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (tasksLoading) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <FiCalendar
              size={23}
            />
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

          {Array.from({
            length: 35,
          }).map(
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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <FiCalendar
              size={23}
            />
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
            onClick={
              goToPreviousMonth
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
            title="Previous month"
          >
            <FiChevronLeft
              size={20}
            />
          </button>

          <button
            type="button"
            onClick={
              goToToday
            }
            className="h-11 rounded-xl border border-slate-800 bg-slate-900 px-5 text-sm font-semibold text-white transition hover:border-blue-500/40 hover:bg-slate-800"
          >
            Today
          </button>

          <button
            type="button"
            onClick={
              goToNextMonth
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
            title="Next month"
          >
            <FiChevronRight
              size={20}
            />
          </button>

        </div>

      </div>

      {/* MONTH */}

      <div className="mb-5 text-center">

        <h4 className="text-2xl font-bold text-white">
          {monthName}
        </h4>

        <div className="mt-2 flex items-center justify-center gap-2">

          <span className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-[11px] font-medium text-slate-500">
            {tasks.length} total tasks
          </span>

          <span className="rounded-full border border-blue-500/10 bg-blue-500/5 px-3 py-1 text-[11px] font-medium text-blue-400">
            {monthTaskCount} this month
          </span>

        </div>

      </div>

      {/* WEEK DAYS */}

      <div className="mb-2 grid grid-cols-7">

        {weekDays.map(
          (day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold tracking-wide text-slate-500"
            >
              {day}
            </div>
          )
        )}

      </div>

      {/* CALENDAR */}

      <div className="overflow-x-auto rounded-2xl border border-slate-800">

        <div className="min-w-[760px]">

          <div className="grid grid-cols-7">

            {calendarCells.map(
              (
                day,
                index
              ) => {

                const dateString =
                  day
                    ? createDateString(
                        day
                      )
                    : null;

                const dayTasks =
                  day
                    ? getTasksForDay(
                        day
                      )
                    : [];

                const isToday =
                  dateString ===
                  todayString;

                const isSelected =
                  dateString ===
                  selectedDate;

                return (
                  <div
                    key={`${day}-${index}`}
                    onClick={() =>
                      handleDateClick(
                        day
                      )
                    }
                    className={`relative min-h-[125px] border-b border-r border-slate-800/80 p-3 text-left transition ${
                      !day
                        ? "cursor-default bg-slate-950/20"
                        : isSelected
                        ? "cursor-pointer bg-blue-500/10 ring-1 ring-inset ring-blue-500/50"
                        : "cursor-pointer bg-slate-950/40 hover:bg-slate-900/80"
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

                        {dayTasks.length >
                          0 && (
                          <span className="text-[10px] font-medium text-slate-600">
                            {
                              dayTasks.length
                            }
                          </span>
                        )}

                      </div>
                    )}

                    {/* TASK CHIPS */}

                    {day &&
                      dayTasks.length >
                        0 && (
                        <div className="mt-3 space-y-1.5">

                          {dayTasks
                            .slice(0, 3)
                            .map(
                              (
                                task
                              ) => {

                                const priority =
                                  task.priority ||
                                  "medium";

                                return (
                                  <button
                                    type="button"
                                    key={
                                      task.id
                                    }
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();

                                      handleViewTask(
                                        task
                                      );
                                    }}
                                    className={`block w-full truncate rounded-lg border px-2 py-1.5 text-left text-[10px] font-medium transition hover:scale-[1.02] ${getPriorityClass(
                                      priority
                                    )} ${
                                      task.completed
                                        ? "opacity-50 line-through"
                                        : ""
                                    }`}
                                    title={`View: ${task.title}`}
                                  >
                                    <span className="mr-1">
                                      •
                                    </span>

                                    {
                                      task.title
                                    }
                                  </button>
                                );
                              }
                            )}

                          {dayTasks.length >
                            3 && (
                            <div className="text-[10px] text-slate-600">
                              +
                              {dayTasks.length -
                                3}{" "}
                              more
                            </div>
                          )}

                        </div>
                      )}

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* SELECTED DATE */}
      {/* ================================================= */}

      {selectedDate && (
        <div className="mt-6">

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-blue-400">
                Selected Date
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">

                <h4 className="text-lg font-bold text-white">
                  {
                    formattedSelectedDate
                  }
                </h4>

                {selectedDate ===
                  todayString && (
                  <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-400">
                    Today
                  </span>
                )}

              </div>

            </div>

            <span className="w-fit rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-400">
              {
                selectedDateTasks.length
              }{" "}
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
                <FiCalendar
                  size={18}
                />
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
            <div className="space-y-3">

              {selectedDateTasks.map(
                (task) => {

                  const priority =
                    task.priority ||
                    "medium";

                  return (
                    <div
                      key={task.id}
                      onClick={() =>
                        handleViewTask(
                          task
                        )
                      }
                      className={`cursor-pointer rounded-xl border p-4 text-left transition ${
                        task.completed
                          ? "border-green-500/10 bg-green-500/5 hover:border-green-500/30"
                          : "border-slate-800 bg-slate-900/50 hover:border-blue-500/30 hover:bg-slate-900"
                      }`}
                    >

                      <div className="flex items-start gap-3">

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

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <h5
                              className={`font-semibold ${
                                task.completed
                                  ? "text-slate-500 line-through"
                                  : "text-white"
                              }`}
                            >
                              {
                                task.title
                              }
                            </h5>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${getPriorityClass(
                                priority
                              )}`}
                            >
                              {
                                priority
                              }
                            </span>

                            {task.category && (
                              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-400">
                                {
                                  task.category
                                }
                              </span>
                            )}

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

                          {task.description && (
                            <p className="mt-2 text-sm text-slate-500">
                              {
                                task.description
                              }
                            </p>
                          )}

                          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">

                            <FiClock
                              size={13}
                            />

                            <span>
                              Due{" "}
                              {formatDate(
                                task.due_date
                              )}
                            </span>

                          </div>

                          {task.recurrence_end_date && (
                            <p className="mt-1 text-xs text-slate-600">
                              Repeats until{" "}
                              {formatDate(
                                task.recurrence_end_date
                              )}
                            </p>
                          )}

                          {/* EDIT */}

                          <div className="mt-4">

                            <button
                              type="button"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                handleEditTask(
                                  task
                                );
                              }}
                              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                            >
                              <FiEdit3
                                size={14}
                              />

                              Edit Task
                            </button>

                          </div>

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

      {/* ================================================= */}
      {/* TASK DETAILS */}
      {/* ================================================= */}

      {viewingTask && (
        <TaskDetails
          task={
            viewingTask
          }
          onClose={
            handleCloseDetails
          }
          onEdit={
            handleEditFromDetails
          }
          onTaskChanged={
            handleTaskChanged
          }
        />
      )}

    </section>
  );
}

export default CalendarView;