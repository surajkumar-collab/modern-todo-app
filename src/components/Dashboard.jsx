import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../supabaseClient";

import TaskForm from "./TaskForm";
import TaskDetails from "./TaskDetails";
import CategoryManager from "./CategoryManager";
import ToastContainer from "./ToastContainer";

import {
  FiCheckSquare,
  FiClock,
  FiCheckCircle,
  FiCalendar,
  FiTarget,
  FiChevronRight,
  FiPlus,
  FiList,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";

function Dashboard({ user, onLogout }) {
  // =========================================================
  // STATES
  // =========================================================

  const [showTaskForm, setShowTaskForm] =
    useState(false);

  const [showCategoryManager, setShowCategoryManager] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [viewingTask, setViewingTask] =
    useState(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [productivityRange, setProductivityRange] =
    useState("7d");

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [toasts, setToasts] =
    useState([]);

  // =========================================================
  // TOAST
  // =========================================================

  const addToast = (
    message,
    type = "success"
  ) => {
    const id =
      Date.now() + Math.random();

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);

    window.setTimeout(() => {
      setToasts((prev) =>
        prev.filter(
          (toast) =>
            toast.id !== id
        )
      );
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.filter(
        (toast) =>
          toast.id !== id
      )
    );
  };

  // =========================================================
  // USER
  // =========================================================

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getDateString = (date) => {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayString =
    getDateString(new Date());

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const [year, month, day] =
      dateString.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  const formatLongDate = () => {
    return new Date().toLocaleDateString(
      "en-IN",
      {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // FETCH TASKS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    async function fetchTasks() {
      if (!user?.id) {
        setTasks([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const {
          data,
          error,
        } = await supabase
          .from("tasks")
          .select(
            "id, title, description, completed, priority, category, due_date, recurrence_type, recurrence_end_date, created_at, updated_at"
          )
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        if (mounted) {
          setTasks(data || []);
        }
      } catch (error) {
        console.error(
          "Dashboard task fetch error:",
          error
        );

        if (mounted) {
          setTasks([]);

          addToast(
            "Failed to load dashboard data",
            "error"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      mounted = false;
    };
  }, [
    user?.id,
    refreshKey,
  ]);

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const dashboardData = useMemo(() => {
    const safeTasks =
      Array.isArray(tasks)
        ? tasks
        : [];

    const total =
      safeTasks.length;

    const completedTasks =
      safeTasks.filter(
        (task) =>
          task.completed === true
      );

    const activeTasks =
      safeTasks.filter(
        (task) =>
          task.completed !== true
      );

    const completed =
      completedTasks.length;

    const active =
      activeTasks.length;

    const completionRate =
      total === 0
        ? 0
        : Math.round(
            (completed / total) *
              100
          );

    // =======================================================
    // TODAY
    // =======================================================

    const todayTasks =
      safeTasks
        .filter(
          (task) =>
            task.due_date ===
            todayString
        )
        .sort((a, b) => {
          if (
            a.completed !==
            b.completed
          ) {
            return a.completed
              ? 1
              : -1;
          }

          return (
            new Date(
              a.created_at
            ) -
            new Date(
              b.created_at
            )
          );
        });

    const todayCompleted =
      todayTasks.filter(
        (task) =>
          task.completed
      ).length;

    const todayProgress =
      todayTasks.length === 0
        ? 0
        : Math.round(
            (todayCompleted /
              todayTasks.length) *
              100
          );

    // =======================================================
    // UPCOMING
    // =======================================================

    const upcomingTasks =
      safeTasks
        .filter(
          (task) =>
            !task.completed &&
            task.due_date &&
            task.due_date >
              todayString
        )
        .sort(
          (a, b) =>
            new Date(
              a.due_date
            ) -
            new Date(
              b.due_date
            )
        )
        .slice(0, 5);

    // =======================================================
    // OVERDUE
    // =======================================================

    const overdue =
      safeTasks.filter(
        (task) =>
          !task.completed &&
          task.due_date &&
          task.due_date <
            todayString
      ).length;

    // =======================================================
    // PRODUCTIVITY CHART
    // =======================================================

    const getCompletedCountForDate = (
      dateString
    ) =>
      completedTasks.filter(
        (task) => {
          if (!task.updated_at) {
            return false;
          }

          return (
            getDateString(
              new Date(
                task.updated_at
              )
            ) ===
            dateString
          );
        }
      ).length;

    const getMonthKey = (
      date
    ) =>
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    let productivityData = [];

    if (productivityRange === "1d") {
      productivityData = [
        {
          date: todayString,
          label: "Today",
          count:
            getCompletedCountForDate(
              todayString
            ),
        },
      ];
    } else if (
      productivityRange === "7d"
    ) {
      for (
        let index = 6;
        index >= 0;
        index--
      ) {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() -
            index
        );

        const dateString =
          getDateString(
            date
          );

        productivityData.push({
          date: dateString,
          label:
            date.toLocaleDateString(
              "en-IN",
              {
                weekday:
                  "short",
              }
            ),
          count:
            getCompletedCountForDate(
              dateString
            ),
        });
      }
    } else if (
      productivityRange === "30d"
    ) {
      for (
        let index = 29;
        index >= 0;
        index--
      ) {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() -
            index
        );

        const dateString =
          getDateString(
            date
          );

        productivityData.push({
          date: dateString,
          label:
            index === 29 ||
            index === 15 ||
            index === 0
              ? date.toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                  }
                )
              : "",
          count:
            getCompletedCountForDate(
              dateString
            ),
        });
      }
    } else {
      const months =
        productivityRange === "3m"
          ? 3
          : productivityRange === "6m"
          ? 6
          : 12;

      for (
        let index =
          months - 1;
        index >= 0;
        index--
      ) {
        const date =
          new Date();

        date.setDate(1);

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setMonth(
          date.getMonth() -
            index
        );

        const monthKey =
          getMonthKey(
            date
          );

        const count =
          completedTasks.filter(
            (task) => {
              if (
                !task.updated_at
              ) {
                return false;
              }

              return (
                getMonthKey(
                  new Date(
                    task.updated_at
                  )
                ) ===
                monthKey
              );
            }
          ).length;

        productivityData.push({
          date: monthKey,
          label:
            date.toLocaleDateString(
              "en-IN",
              {
                month:
                  "short",
              }
            ),
          count,
        });
      }
    }

    const maxProductivity =
      Math.max(
        ...productivityData.map(
          (item) =>
            item.count
        ),
        1
      );

    // =======================================================
    // WEEKLY ACTIVITY
    // =======================================================

    const weeklyData = [];

    for (
      let index = 6;
      index >= 0;
      index--
    ) {
      const date =
        new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      date.setDate(
        date.getDate() -
          index
      );

      const dateString =
        getDateString(
          date
        );

      weeklyData.push({
        date: dateString,
        label:
          date.toLocaleDateString(
            "en-IN",
            {
              weekday:
                "short",
            }
          ),
        count:
          getCompletedCountForDate(
            dateString
          ),
      });
    }

    const maxWeekly =
      Math.max(
        ...weeklyData.map(
          (item) =>
            item.count
        ),
        1
      );

    // =======================================================
    // CATEGORY DATA
    // =======================================================

    const categoryMap = {};

    safeTasks.forEach(
      (task) => {
        const category =
          task.category ||
          "General";

        categoryMap[
          category
        ] =
          (categoryMap[
            category
          ] || 0) + 1;
      }
    );

    const categoryData =
      Object.entries(
        categoryMap
      )
        .map(
          ([
            name,
            count,
          ]) => ({
            name,
            count,
            percentage:
              total === 0
                ? 0
                : Math.round(
                    (count /
                      total) *
                      100
                  ),
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        )
        .slice(0, 5);

    // =======================================================
    // PRIORITY DATA
    // =======================================================

    const priorityData = [
      {
        name: "High",
        key: "high",
        count:
          safeTasks.filter(
            (task) =>
              task.priority ===
              "high"
          ).length,
      },
      {
        name: "Medium",
        key: "medium",
        count:
          safeTasks.filter(
            (task) =>
              task.priority ===
              "medium"
          ).length,
      },
      {
        name: "Low",
        key: "low",
        count:
          safeTasks.filter(
            (task) =>
              task.priority ===
              "low"
          ).length,
      },
    ];

    return {
      total,
      completed,
      active,
      completionRate,
      todayTasks,
      todayCompleted,
      todayProgress,
      upcomingTasks,
      overdue,
      productivityData,
      maxProductivity,
      weeklyData,
      maxWeekly,
      categoryData,
      priorityData,
    };
  }, [
    tasks,
    todayString,
    productivityRange,
  ]);

  // =========================================================
  // TASK HANDLERS
  // =========================================================

  const handleTaskCreated =
    () => {
      setShowTaskForm(false);

      setRefreshKey(
        (prev) =>
          prev + 1
      );

      addToast(
        "Task created successfully",
        "success"
      );
    };

  const handleTaskUpdated =
    () => {
      setEditingTask(null);

      setRefreshKey(
        (prev) =>
          prev + 1
      );

      addToast(
        "Task updated successfully",
        "success"
      );
    };

  const handleEditTask =
    (task) => {
      setViewingTask(null);
      setEditingTask(task);
    };

  const handleViewTask =
    (task) => {
      setViewingTask(task);
    };

  const closeCategoryManager =
    () => {
      setShowCategoryManager(
        false
      );

      setRefreshKey(
        (prev) =>
          prev + 1
      );
    };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredTodayTasks =
    dashboardData.todayTasks.filter(
      (task) => {
        const search =
          searchQuery
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        return (
          task.title
            ?.toLowerCase()
            .includes(search) ||
          task.description
            ?.toLowerCase()
            .includes(search) ||
          task.category
            ?.toLowerCase()
            .includes(search)
        );
      }
    );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-800 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-500">
              Loading your productivity...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white">

      {/* ================================================= */}
      {/* MAIN DASHBOARD */}
      {/* ================================================= */}

      <main className="w-full">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section className="mb-6">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                YOUR PRODUCTIVITY HUB
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Here's how your TaskFlow is performing.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5">

                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Today
                </p>

                <p className="mt-0.5 text-sm font-medium text-slate-300">
                  {formatLongDate()}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowTaskForm(
                    true
                  )
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:scale-[1.02] hover:shadow-cyan-500/20"
              >
                <FiPlus
                  size={17}
                />
                Add Task
              </button>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* STAT CARDS */}
        {/* ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <DashboardStat
            title="Total Tasks"
            value={
              dashboardData.total
            }
            subtitle="All your tasks"
            icon={
              <FiCheckSquare
                size={20}
              />
            }
            accent="blue"
          />

          <DashboardStat
            title="Active Tasks"
            value={
              dashboardData.active
            }
            subtitle="Still in progress"
            icon={
              <FiClock
                size={20}
              />
            }
            accent="cyan"
          />

          <DashboardStat
            title="Completed"
            value={
              dashboardData.completed
            }
            subtitle="Tasks you finished"
            icon={
              <FiCheckCircle
                size={20}
              />
            }
            accent="green"
          />

          <DashboardStat
            title="Completion Rate"
            value={`${dashboardData.completionRate}%`}
            subtitle="Overall productivity"
            icon={
              <FiTarget
                size={20}
              />
            }
            accent="purple"
          />

        </section>

        {/* ================================================= */}
        {/* MAIN ANALYTICS */}
        {/* ================================================= */}

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">

          {/* PRODUCTIVITY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <FiActivity
                    className="text-blue-400"
                    size={18}
                  />

                  <h2 className="font-semibold text-white">
                    Productivity Overview
                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Completed tasks over the selected period.
                </p>

              </div>

              <select
                value={productivityRange}
                onChange={(e) =>
                  setProductivityRange(
                    e.target.value
                  )
                }
                className="cursor-pointer rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-400 outline-none transition hover:border-slate-700 hover:text-white focus:border-blue-500"
                aria-label="Productivity time range"
              >
                <option value="1d">
                  Last 1 day
                </option>

                <option value="7d">
                  Last 7 days
                </option>

                <option value="30d">
                  Last 30 days
                </option>

                <option value="3m">
                  Last 3 months
                </option>

                <option value="6m">
                  Last 6 months
                </option>

                <option value="1y">
                  This year
                </option>
              </select>

            </div>

            <div className="mt-6">

              <ProductivityChart
                data={
                  dashboardData.productivityData
                }
                max={
                  dashboardData.maxProductivity
                }
              />

            </div>

          </div>

          {/* TASK STATUS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

            <div>

              <div className="flex items-center gap-2">

                <FiPieChart
                  className="text-purple-400"
                  size={18}
                />

                <h2 className="font-semibold text-white">
                  Task Status
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Current task distribution.
              </p>

            </div>

            <div className="mt-6 flex items-center justify-center">

              <StatusDonut
                completed={
                  dashboardData.completed
                }
                active={
                  dashboardData.active
                }
              />

            </div>

            <div className="mt-6 space-y-3">

              <StatusLegend
                label="Completed"
                value={
                  dashboardData.completed
                }
                total={
                  dashboardData.total
                }
                dotClass="bg-cyan-400"
              />

              <StatusLegend
                label="Active"
                value={
                  dashboardData.active
                }
                total={
                  dashboardData.total
                }
                dotClass="bg-purple-400"
              />

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* WEEKLY + PRIORITY */}
        {/* ================================================= */}

        <section className="mt-4 grid gap-4 lg:grid-cols-2">

          {/* WEEKLY ACTIVITY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <FiBarChart2
                    className="text-cyan-400"
                    size={18}
                  />

                  <h2 className="font-semibold text-white">
                    Weekly Activity
                  </h2>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Daily completed tasks.
                </p>

              </div>

              <span className="text-xs text-slate-600">
                {dashboardData.completed} total
              </span>

            </div>

            <div className="mt-6">

              <WeeklyBars
                data={
                  dashboardData.weeklyData
                }
                max={
                  dashboardData.maxWeekly
                }
              />

            </div>

          </div>

          {/* PRIORITY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

            <div>

              <div className="flex items-center gap-2">

                <FiAlertCircle
                  className="text-yellow-400"
                  size={18}
                />

                <h2 className="font-semibold text-white">
                  Priority Distribution
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                How your tasks are prioritized.
              </p>

            </div>

            <div className="mt-6 space-y-5">

              {dashboardData.priorityData.map(
                (item) => (
                  <PriorityRow
                    key={
                      item.key
                    }
                    item={
                      item
                    }
                    total={
                      dashboardData.total
                    }
                  />
                )
              )}

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* TODAY + UPCOMING */}
        {/* ================================================= */}

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">

          {/* TODAY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  TODAY
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Today's Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {dashboardData.todayCompleted} of{" "}
                  {dashboardData.todayTasks.length} completed
                </p>

              </div>

              <div className="text-right">

                <p className="text-2xl font-bold text-white">
                  {dashboardData.todayProgress}%
                </p>

                <p className="text-[10px] uppercase tracking-wider text-slate-600">
                  completion
                </p>

              </div>

            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
                style={{
                  width: `${dashboardData.todayProgress}%`,
                }}
              />

            </div>

            <div className="mt-5 space-y-2">

              {filteredTodayTasks.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-5 py-8 text-center">

                  <FiCalendar
                    className="mx-auto text-slate-700"
                    size={28}
                  />

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    No tasks for today
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Add a task with today's due date.
                  </p>

                </div>
              ) : (
                filteredTodayTasks
                  .slice(0, 5)
                  .map((task) => (
                    <button
                      key={
                        task.id
                      }
                      type="button"
                      onClick={() =>
                        handleViewTask(
                          task
                        )
                      }
                      className="group flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition hover:border-blue-500/40 hover:bg-blue-500/5"
                    >

                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          task.completed
                            ? "bg-green-500/10 text-green-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {task.completed ? (
                          <FiCheckCircle
                            size={17}
                          />
                        ) : (
                          <FiClock
                            size={17}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <p
                          className={`truncate text-sm font-semibold ${
                            task.completed
                              ? "text-slate-600 line-through"
                              : "text-slate-200 group-hover:text-blue-300"
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <span className="text-xs text-slate-600">
                            {task.category ||
                              "General"}
                          </span>

                          <span
                            className={`text-xs font-medium ${
                              task.priority ===
                              "high"
                                ? "text-red-400"
                                : task.priority ===
                                  "medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {task.priority ||
                              "medium"}
                          </span>

                        </div>

                      </div>

                      <FiChevronRight
                        size={17}
                        className="shrink-0 text-slate-700 transition group-hover:translate-x-1 group-hover:text-blue-400"
                      />

                    </button>
                  ))
              )}

            </div>

            {dashboardData.todayTasks.length >
              5 && (
              <Link
                to="/tasks"
                className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-slate-800 py-2.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/5"
              >
                View all today's tasks

                <FiChevronRight
                  size={14}
                />
              </Link>
            )}

          </div>

          {/* UPCOMING */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  UPCOMING
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Upcoming Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Stay ahead of what's coming next.
                </p>

              </div>

              <Link
                to="/tasks"
                className="flex items-center gap-1 text-xs font-medium text-purple-400 transition hover:text-purple-300"
              >
                View all

                <FiChevronRight
                  size={14}
                />
              </Link>

            </div>

            <div className="mt-5 space-y-2">

              {dashboardData.upcomingTasks.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 px-5 py-8 text-center">

                  <FiTarget
                    className="mx-auto text-slate-700"
                    size={28}
                  />

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    No upcoming tasks
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    You're all caught up.
                  </p>

                </div>
              ) : (
                dashboardData.upcomingTasks.map(
                  (task) => (
                    <button
                      key={
                        task.id
                      }
                      type="button"
                      onClick={() =>
                        handleViewTask(
                          task
                        )
                      }
                      className="group flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition hover:border-purple-500/40 hover:bg-purple-500/5"
                    >

                      <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-500/10">

                        <span className="text-[10px] font-semibold uppercase text-purple-400">
                          {new Date(
                            `${task.due_date}T00:00:00`
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              weekday:
                                "short",
                            }
                          )}
                        </span>

                        <span className="text-sm font-bold text-white">
                          {new Date(
                            `${task.due_date}T00:00:00`
                          ).getDate()}{" "}
                          {new Date(
                            `${task.due_date}T00:00:00`
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              month:
                                "short",
                            }
                          )}
                        </span>

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-200 transition group-hover:text-purple-300">
                          {task.title}
                        </p>

                        <div className="mt-1 flex items-center gap-2">

                          <span className="truncate text-xs text-slate-600">
                            {task.category ||
                              "General"}
                          </span>

                          <span
                            className={`text-xs font-medium ${
                              task.priority ===
                              "high"
                                ? "text-red-400"
                                : task.priority ===
                                  "medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {task.priority ||
                              "medium"}
                          </span>

                        </div>

                      </div>

                      <FiChevronRight
                        size={17}
                        className="shrink-0 text-slate-700 transition group-hover:translate-x-1 group-hover:text-purple-400"
                      />

                    </button>
                  )
                )
              )}

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* CATEGORY + QUICK ACTIONS */}
        {/* ================================================= */}

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">

          {/* CATEGORY */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-semibold text-white">
                  Categories
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Distribution of your tasks.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCategoryManager(
                    true
                  )
                }
                className="text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                Manage
              </button>

            </div>

            <div className="mt-5 space-y-4">

              {dashboardData.categoryData.length ===
              0 ? (
                <p className="text-sm text-slate-600">
                  No categories yet.
                </p>
              ) : (
                dashboardData.categoryData.map(
                  (category) => (
                    <div
                      key={
                        category.name
                      }
                    >

                      <div className="mb-1.5 flex items-center justify-between text-xs">

                        <span className="text-slate-400">
                          {category.name}
                        </span>

                        <span className="text-slate-600">
                          {category.count}
                        </span>

                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{
                            width: `${category.percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </div>

          {/* QUICK ACTIONS */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

            <div>

              <h2 className="font-semibold text-white">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Jump directly where you need.
              </p>

            </div>

            <div className="mt-5 grid gap-2">

              <button
                type="button"
                onClick={() =>
                  setShowTaskForm(
                    true
                  )
                }
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition hover:border-blue-500/40 hover:bg-blue-500/5"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <FiPlus
                      size={17}
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-300">
                    Create Task
                  </span>

                </div>

                <FiChevronRight
                  size={16}
                  className="text-slate-700"
                />

              </button>

              <Link
                to="/tasks"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition hover:border-cyan-500/40 hover:bg-cyan-500/5"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <FiList
                      size={17}
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-300">
                    View All Tasks
                  </span>

                </div>

                <FiChevronRight
                  size={16}
                  className="text-slate-700"
                />

              </Link>

              <Link
                to="/analytics"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition hover:border-purple-500/40 hover:bg-purple-500/5"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                    <FiBarChart2
                      size={17}
                    />
                  </div>

                  <span className="text-sm font-medium text-slate-300">
                    Open Analytics
                  </span>

                </div>

                <FiChevronRight
                  size={16}
                  className="text-slate-700"
                />

              </Link>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* OVERALL PROGRESS */}
        {/* ================================================= */}

        <section className="mt-4 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-slate-900/60 to-cyan-500/5 p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <FiTarget
                  className="text-blue-400"
                  size={18}
                />

                <h2 className="font-semibold text-white">
                  Overall Progress
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                {dashboardData.completed} of{" "}
                {dashboardData.total} tasks completed
              </p>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-3xl font-bold text-white">
                {dashboardData.completionRate}%
              </p>

              {dashboardData.overdue >
                0 && (
                <p className="mt-1 text-xs text-red-400">
                  {dashboardData.overdue} overdue
                </p>
              )}

            </div>

          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-300 shadow-lg shadow-cyan-500/20 transition-all duration-700"
              style={{
                width: `${dashboardData.completionRate}%`,
              }}
            />

          </div>

        </section>

      </main>

      {/* ================================================= */}
      {/* TASK DETAILS */}
      {/* ================================================= */}

      {viewingTask && (
        <TaskDetails
          task={viewingTask}
          onClose={() =>
            setViewingTask(null)
          }
          onEdit={
            handleEditTask
          }
        />
      )}

      {/* ================================================= */}
      {/* ADD TASK */}
      {/* ================================================= */}

      {showTaskForm && (
        <TaskForm
          user={user}
          onClose={() =>
            setShowTaskForm(false)
          }
          onTaskCreated={
            handleTaskCreated
          }
        />
      )}

      {/* ================================================= */}
      {/* EDIT TASK */}
      {/* ================================================= */}

      {editingTask && (
        <TaskForm
          user={user}
          task={editingTask}
          onClose={() =>
            setEditingTask(null)
          }
          onTaskUpdated={
            handleTaskUpdated
          }
        />
      )}

      {/* ================================================= */}
      {/* CATEGORY MANAGER */}
      {/* ================================================= */}

      {showCategoryManager && (
        <CategoryManager
          user={user}
          onClose={
            closeCategoryManager
          }
          addToast={addToast}
        />
      )}

      {/* ================================================= */}
      {/* TOASTS */}
      {/* ================================================= */}

      <ToastContainer
        toasts={toasts}
        removeToast={
          removeToast
        }
      />

    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function DashboardStat({
  title,
  value,
  subtitle,
  icon,
  accent,
}) {
  const accentStyles = {
    blue: {
      icon:
        "bg-blue-500/10 text-blue-400",
      glow:
        "hover:border-blue-500/30",
    },

    cyan: {
      icon:
        "bg-cyan-500/10 text-cyan-400",
      glow:
        "hover:border-cyan-500/30",
    },

    green: {
      icon:
        "bg-green-500/10 text-green-400",
      glow:
        "hover:border-green-500/30",
    },

    purple: {
      icon:
        "bg-purple-500/10 text-purple-400",
      glow:
        "hover:border-purple-500/30",
    },
  };

  const style =
    accentStyles[
      accent
    ] || accentStyles.blue;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition duration-300 ${style.glow}`}
    >

      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition group-hover:bg-blue-500/10" />

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.icon}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

// =========================================================
// PRODUCTIVITY CHART
// =========================================================

function ProductivityChart({
  data,
  max,
}) {
  const width = 760;
  const height = 260;
  const paddingX = 24;
  const paddingY = 25;

  const usableWidth =
    width -
    paddingX * 2;

  const usableHeight =
    height -
    paddingY * 2;

  const points = data.map(
    (item, index) => {
      const x =
        paddingX +
        (index /
          Math.max(
            data.length - 1,
            1
          )) *
          usableWidth;

      const y =
        height -
        paddingY -
        (item.count /
          Math.max(max, 1)) *
          usableHeight;

      return {
        x,
        y,
      };
    }
  );

  const linePath =
    points.length > 0
      ? points
          .map(
            (point, index) =>
              `${
                index === 0
                  ? "M"
                  : "L"
              } ${point.x} ${point.y}`
          )
          .join(" ")
      : "";

  const areaPath =
    points.length > 0
      ? `${linePath} L ${
          points[
            points.length - 1
          ].x
        } ${
          height -
          paddingY
        } L ${points[0].x} ${
          height -
          paddingY
        } Z`
      : "";

  return (
    <div className="w-full overflow-hidden">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        preserveAspectRatio="none"
      >

        <defs>

          <linearGradient
            id="productivityFill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="0%"
              stopColor="#8b5cf6"
              stopOpacity="0.30"
            />

            <stop
              offset="100%"
              stopColor="#8b5cf6"
              stopOpacity="0"
            />

          </linearGradient>

          <linearGradient
            id="productivityLine"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >

            <stop
              offset="0%"
              stopColor="#3b82f6"
            />

            <stop
              offset="100%"
              stopColor="#22d3ee"
            />

          </linearGradient>

        </defs>

        {[0, 1, 2, 3].map(
          (line) => {
            const y =
              paddingY +
              (line / 3) *
                usableHeight;

            return (
              <line
                key={line}
                x1={paddingX}
                x2={
                  width -
                  paddingX
                }
                y1={y}
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
              />
            );
          }
        )}

        {areaPath && (
          <path
            d={areaPath}
            fill="url(#productivityFill)"
          />
        )}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="url(#productivityLine)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map(
          (point, index) => (
            <g
              key={index}
            >

              <circle
                cx={
                  point.x
                }
                cy={
                  point.y
                }
                r="7"
                fill="#0f172a"
                stroke="#22d3ee"
                strokeWidth="3"
              />

              <circle
                cx={
                  point.x
                }
                cy={
                  point.y
                }
                r="2.5"
                fill="#22d3ee"
              />

            </g>
          )
        )}

      </svg>

      <div
        className="mt-2 grid"
        style={{
          gridTemplateColumns: `repeat(${Math.max(
            data.length,
            1
          )}, minmax(0, 1fr))`,
        }}
      >

        {data.map(
          (item) => (
            <div
              key={item.date}
              className="truncate text-center text-[10px] font-medium text-slate-600"
            >
              {item.label}
            </div>
          )
        )}

      </div>

    </div>
  );
}

// =========================================================
// DONUT
// =========================================================

function StatusDonut({
  completed,
  active,
}) {
  const total =
    completed +
    active;

  const completedPercentage =
    total === 0
      ? 0
      : Math.round(
          (completed /
            total) *
            100
        );

  return (
    <div className="relative h-44 w-44">

      <div
        className="h-full w-full rounded-full"
        style={{
          background:
            `conic-gradient(#22d3ee 0% ${completedPercentage}%, #8b5cf6 ${completedPercentage}% 100%)`,
        }}
      />

      <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-slate-900">

        <p className="text-3xl font-bold text-white">
          {completedPercentage}%
        </p>

        <p className="text-[10px] uppercase tracking-wider text-slate-600">
          completed
        </p>

      </div>

    </div>
  );
}

// =========================================================
// STATUS LEGEND
// =========================================================

function StatusLegend({
  label,
  value,
  total,
  dotClass,
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round(
          (value /
            total) *
            100
        );

  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2">

        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />

        <span className="text-xs text-slate-400">
          {label}
        </span>

      </div>

      <div className="flex items-center gap-3">

        <span className="text-xs font-semibold text-white">
          {value}
        </span>

        <span className="w-10 text-right text-[10px] text-slate-600">
          {percentage}%
        </span>

      </div>

    </div>
  );
}

// =========================================================
// WEEKLY BARS
// =========================================================

function WeeklyBars({
  data,
  max,
}) {
  return (
    <div className="flex h-48 items-end justify-between gap-2">

      {data.map(
        (item) => {
          const height =
            item.count === 0
              ? 5
              : Math.max(
                  12,
                  Math.round(
                    (item.count /
                      Math.max(
                        max,
                        1
                      )) *
                      100
                  )
                );

          return (
            <div
              key={
                item.date
              }
              className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            >

              <span className="text-[10px] font-medium text-slate-600">
                {item.count}
              </span>

              <div className="flex h-full w-full items-end justify-center">

                <div
                  className="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 shadow-lg shadow-cyan-500/10 transition-all duration-500 hover:from-purple-600 hover:to-cyan-400"
                  style={{
                    height: `${height}%`,
                  }}
                />

              </div>

              <span className="text-[10px] font-medium text-slate-600">
                {item.label}
              </span>

            </div>
          );
        }
      )}

    </div>
  );
}

// =========================================================
// PRIORITY ROW
// =========================================================

function PriorityRow({
  item,
  total,
}) {
  const percentage =
    total === 0
      ? 0
      : Math.round(
          (item.count /
            total) *
            100
        );

  const barClass =
    item.key === "high"
      ? "from-red-500 to-orange-400"
      : item.key ===
        "medium"
      ? "from-yellow-500 to-amber-400"
      : "from-green-500 to-emerald-400";

  const textClass =
    item.key === "high"
      ? "text-red-400"
      : item.key ===
        "medium"
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={`h-2 w-2 rounded-full ${
              item.key === "high"
                ? "bg-red-400"
                : item.key === "medium"
                ? "bg-yellow-400"
                : "bg-green-400"
            }`}
          />

          <span className="text-xs text-slate-400">
            {item.name}
          </span>

        </div>

        <span
          className={`text-xs font-semibold ${textClass}`}
        >
          {item.count}
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

        <div
          className={`h-full rounded-full bg-gradient-to-r ${barClass} transition-all duration-500`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}

export default Dashboard;