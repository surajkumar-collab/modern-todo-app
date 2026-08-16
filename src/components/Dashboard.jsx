import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../supabaseClient";

import TaskForm from "./TaskForm";
import TaskDetails from "./TaskDetails";
import CategoryManager from "./CategoryManager";
import Navbar from "./Navbar";
import StatsCard from "./StatsCard";
import ToastContainer from "./ToastContainer";

import {
  FiCheckSquare,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiList,
  FiBarChart2,
  FiCalendar,
  FiTarget,
  FiChevronRight,
} from "react-icons/fi";

function Dashboard({ user, onLogout }) {
  // =========================================
  // STATES
  // =========================================

  const [showTaskForm, setShowTaskForm] = useState(false);

  const [showCategoryManager, setShowCategoryManager] =
    useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  // EDIT TASK MODAL
  const [editingTask, setEditingTask] = useState(null);

  // TASK DETAILS MODAL
  const [viewingTask, setViewingTask] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  const [statsLoading, setStatsLoading] = useState(true);

  const [todayStats, setTodayStats] = useState({
    total: 0,
    completed: 0,
  });

  const [todayLoading, setTodayLoading] = useState(true);

  const [todayTasks, setTodayTasks] = useState([]);

  const [todayTasksLoading, setTodayTasksLoading] =
    useState(true);

  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const [upcomingTasksLoading, setUpcomingTasksLoading] =
    useState(true);

  const [toasts, setToasts] = useState([]);

  // =========================================
  // TOAST
  // =========================================

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter((toast) => toast.id !== id)
      );
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  };

  // =========================================
  // USER NAME
  // =========================================

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  // =========================================
  // TODAY
  // =========================================

  const getTodayString = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================
  // DASHBOARD STATS
  // =========================================

  useEffect(() => {
    let mounted = true;

    async function fetchDashboardStats() {
      if (!user?.id) {
        return;
      }

      try {
        setStatsLoading(true);

        const { data, error } = await supabase
          .from("tasks")
          .select("completed")
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        const tasks = data || [];

        const total = tasks.length;

        const completed = tasks.filter(
          (task) => task.completed === true
        ).length;

        const active = total - completed;

        if (mounted) {
          setStats({
            total,
            active,
            completed,
          });
        }
      } catch (error) {
        console.error(
          "Dashboard stats error:",
          error
        );
      } finally {
        if (mounted) {
          setStatsLoading(false);
        }
      }
    }

    fetchDashboardStats();

    return () => {
      mounted = false;
    };
  }, [user?.id, refreshKey]);

  // =========================================
  // TODAY'S TASKS
  // =========================================

  useEffect(() => {
    let mounted = true;

    async function fetchTodayData() {
      if (!user?.id) {
        return;
      }

      try {
        setTodayLoading(true);
        setTodayTasksLoading(true);

        const today = getTodayString();

        const { data, error } = await supabase
          .from("tasks")
          .select(
            "id, title, description, completed, priority, category, due_date, recurrence_type, recurrence_end_date, created_at, updated_at"
          )
          .eq("user_id", user.id)
          .eq("due_date", today)
          .order("completed", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        const tasks = data || [];

        const total = tasks.length;

        const completed = tasks.filter(
          (task) => task.completed === true
        ).length;

        if (mounted) {
          setTodayStats({
            total,
            completed,
          });

          setTodayTasks(tasks);
        }
      } catch (error) {
        console.error(
          "Today's tasks error:",
          error
        );

        if (mounted) {
          setTodayStats({
            total: 0,
            completed: 0,
          });

          setTodayTasks([]);
        }
      } finally {
        if (mounted) {
          setTodayLoading(false);
          setTodayTasksLoading(false);
        }
      }
    }

    fetchTodayData();

    return () => {
      mounted = false;
    };
  }, [user?.id, refreshKey]);

  // =========================================
  // UPCOMING TASKS
  // =========================================

  useEffect(() => {
    let mounted = true;

    async function fetchUpcomingTasks() {
      if (!user?.id) {
        return;
      }

      try {
        setUpcomingTasksLoading(true);

        const today = getTodayString();

        const { data, error } = await supabase
          .from("tasks")
          .select(
            "id, title, description, completed, priority, category, due_date, recurrence_type, recurrence_end_date, created_at, updated_at"
          )
          .eq("user_id", user.id)
          .gt("due_date", today)
          .eq("completed", false)
          .order("due_date", {
            ascending: true,
          })
          .limit(5);

        if (error) {
          throw error;
        }

        if (mounted) {
          setUpcomingTasks(data || []);
        }
      } catch (error) {
        console.error(
          "Upcoming tasks error:",
          error
        );

        if (mounted) {
          setUpcomingTasks([]);
        }
      } finally {
        if (mounted) {
          setUpcomingTasksLoading(false);
        }
      }
    }

    fetchUpcomingTasks();

    return () => {
      mounted = false;
    };
  }, [user?.id, refreshKey]);

  // =========================================
  // OVERALL PROGRESS
  // =========================================

  const completionPercentage =
    stats.total === 0
      ? 0
      : Math.round(
          (stats.completed / stats.total) * 100
        );

  // =========================================
  // TODAY PROGRESS
  // =========================================

  const todayPercentage =
    todayStats.total === 0
      ? 0
      : Math.round(
          (todayStats.completed /
            todayStats.total) *
            100
        );

  // =========================================
  // CREATE TASK
  // =========================================

  const handleTaskCreated = () => {
    setShowTaskForm(false);

    setRefreshKey((prev) => prev + 1);

    addToast(
      "Task created successfully",
      "success"
    );
  };

  // =========================================
  // UPDATE TASK
  // =========================================

  const handleTaskUpdated = () => {
    setEditingTask(null);

    setRefreshKey((prev) => prev + 1);

    addToast(
      "Task updated successfully",
      "success"
    );
  };

  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  const handleEditTask = (task) => {
    if (!task) {
      return;
    }

    setEditingTask(task);
  };

  // =========================================
  // OPEN DETAILS MODAL
  // =========================================

  const handleViewTask = (task) => {
    if (!task) {
      return;
    }

    setViewingTask(task);
  };

  // =========================================
  // EDIT FROM DETAILS
  // =========================================

  const handleEditFromDetails = (task) => {
    if (!task) {
      return;
    }

    setViewingTask(null);
    setEditingTask(task);
  };

  // =========================================
  // CATEGORY MANAGER
  // =========================================

  const closeCategoryManager = () => {
    setShowCategoryManager(false);

    setRefreshKey((prev) => prev + 1);
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatUpcomingDate = (dateString) => {
    if (!dateString) {
      return {
        day: "--",
        month: "",
        weekday: "",
      };
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return {
      day: date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
        }
      ),

      month: date.toLocaleDateString(
        "en-IN",
        {
          month: "short",
        }
      ),

      weekday: date.toLocaleDateString(
        "en-IN",
        {
          weekday: "short",
        }
      ),
    };
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ===================================== */}
      {/* NAVBAR */}
      {/* ===================================== */}

      <Navbar
        user={user}
        onLogout={onLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* ===================================== */}
      {/* MAIN */}
      {/* ===================================== */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">

        {/* ================================= */}
        {/* WELCOME */}
        {/* ================================= */}

        <section className="mb-8 sm:mb-10">

          <p className="text-sm font-medium text-blue-400">
            YOUR PRODUCTIVITY HUB
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Good to see you, {userName} 👋
          </h2>

          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Stay focused and get things done.
          </p>

        </section>

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <section className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">

          <StatsCard
            title="Total Tasks"
            value={
              statsLoading
                ? "..."
                : stats.total
            }
            description="All your tasks"
            icon={
              <FiCheckSquare size={24} />
            }
            iconClassName="bg-blue-500/10 text-blue-400"
            hoverClassName="hover:border-blue-500/30"
          />

          <StatsCard
            title="Active Tasks"
            value={
              statsLoading
                ? "..."
                : stats.active
            }
            description="Tasks still in progress"
            icon={
              <FiClock size={24} />
            }
            iconClassName="bg-yellow-500/10 text-yellow-400"
            hoverClassName="hover:border-yellow-500/30"
          />

          <StatsCard
            title="Completed"
            value={
              statsLoading
                ? "..."
                : stats.completed
            }
            description="Tasks you finished"
            icon={
              <FiCheckCircle size={24} />
            }
            iconClassName="bg-green-500/10 text-green-400"
            hoverClassName="hover:border-green-500/30"
          />

        </section>

        {/* ================================= */}
        {/* TODAY'S PROGRESS */}
        {/* ================================= */}

        <section className="mt-5 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-5 sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FiTarget size={23} />
              </div>

              <div>

                <p className="text-sm font-medium text-blue-400">
                  TODAY'S PROGRESS
                </p>

                <h3 className="mt-1 text-xl font-bold text-white">
                  {todayStats.completed} /{" "}
                  {todayStats.total} tasks completed
                </h3>

                <p className="mt-1 text-sm text-slate-500">

                  {todayStats.total === 0
                    ? "No tasks scheduled for today."
                    : todayPercentage === 100
                    ? "Excellent! You completed everything for today. 🎉"
                    : "Keep going — finish today's tasks."}

                </p>

              </div>

            </div>

            <div className="text-left sm:text-right">

              <p className="text-3xl font-bold text-white">
                {todayLoading
                  ? "..."
                  : `${todayPercentage}%`}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                today's completion
              </p>

            </div>

          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
              style={{
                width: `${todayPercentage}%`,
              }}
            />

          </div>

        </section>

        {/* ================================= */}
        {/* TODAY'S TASKS */}
        {/* ================================= */}

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-blue-400">
                TODAY
              </p>

              <h3 className="mt-1 text-xl font-bold text-white">
                Today's Tasks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tasks scheduled for today.
              </p>

            </div>

            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-400 transition hover:text-blue-300"
            >
              View all
              <FiChevronRight size={16} />
            </Link>

          </div>

          <div className="mt-5">

            {todayTasksLoading ? (

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-5 text-sm text-slate-500">
                Loading today's tasks...
              </div>

            ) : todayTasks.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 px-5 py-8 text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                  <FiCheckCircle size={21} />
                </div>

                <h4 className="mt-3 font-semibold text-white">
                  No tasks for today
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  You're all clear. Add a task if you need one.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowTaskForm(true)
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  <FiPlus size={16} />
                  Add Task
                </button>

              </div>

            ) : (

              <div className="space-y-2">

                {todayTasks.map((task) => (

                  <button
                    key={task.id}
                    type="button"
                    onClick={() =>
                      handleViewTask(task)
                    }
                    className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      task.completed
                        ? "border-green-500/10 bg-green-500/5 hover:border-green-500/30"
                        : "border-slate-800 bg-slate-950/50 hover:border-blue-500/40 hover:bg-blue-500/5"
                    }`}
                  >

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        task.completed
                          ? "bg-green-500/10 text-green-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}
                    >
                      {task.completed ? (
                        <FiCheckCircle size={18} />
                      ) : (
                        <FiCheckSquare size={18} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p
                        className={`truncate text-sm font-semibold transition ${
                          task.completed
                            ? "text-slate-500 line-through"
                            : "text-slate-200 group-hover:text-blue-300"
                        }`}
                      >
                        {task.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2">

                        {task.category && (
                          <span className="text-xs text-slate-600">
                            {task.category}
                          </span>
                        )}

                        {task.priority && (
                          <span
                            className={`text-xs font-medium ${
                              task.priority === "high"
                                ? "text-red-400"
                                : task.priority === "medium"
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                        )}

                      </div>

                    </div>

                    <FiChevronRight
                      size={18}
                      className="shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-400"
                    />

                  </button>

                ))}

              </div>

            )}

          </div>

        </section>

        {/* ================================= */}
        {/* UPCOMING TASKS */}
        {/* ================================= */}

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-purple-400">
                UPCOMING
              </p>

              <h3 className="mt-1 text-xl font-bold text-white">
                Upcoming Tasks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Stay ahead of what's coming next.
              </p>

            </div>

            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-400 transition hover:text-purple-300"
            >
              View all
              <FiChevronRight size={16} />
            </Link>

          </div>

          <div className="mt-5">

            {upcomingTasksLoading ? (

              <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-5 text-sm text-slate-500">
                Loading upcoming tasks...
              </div>

            ) : upcomingTasks.length === 0 ? (

              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/50 px-5 py-8 text-center">

                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <FiCalendar size={21} />
                </div>

                <h4 className="mt-3 font-semibold text-white">
                  No upcoming tasks
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  You're all caught up for now.
                </p>

              </div>

            ) : (

              <div className="space-y-2">

                {upcomingTasks.map((task) => {

                  const formattedDate =
                    formatUpcomingDate(
                      task.due_date
                    );

                  return (

                    <button
                      key={task.id}
                      type="button"
                      onClick={() =>
                        handleViewTask(task)
                      }
                      className="group flex w-full items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition hover:border-purple-500/40 hover:bg-purple-500/5"
                    >

                      {/* DATE */}

                      <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-purple-500/10">

                        <span className="text-[10px] font-medium uppercase text-purple-400">
                          {formattedDate.weekday}
                        </span>

                        <span className="text-sm font-bold text-white">
                          {formattedDate.day}{" "}
                          {formattedDate.month}
                        </span>

                      </div>

                      {/* TASK */}

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-semibold text-slate-200 transition group-hover:text-purple-300">
                          {task.title}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">

                          {task.category && (
                            <span className="text-xs text-slate-600">
                              {task.category}
                            </span>
                          )}

                          {task.priority && (
                            <span
                              className={`text-xs font-medium ${
                                task.priority === "high"
                                  ? "text-red-400"
                                  : task.priority === "medium"
                                  ? "text-yellow-400"
                                  : "text-green-400"
                              }`}
                            >
                              {task.priority}
                            </span>
                          )}

                        </div>

                      </div>

                      {/* ARROW */}

                      <FiChevronRight
                        size={18}
                        className="shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-purple-400"
                      />

                    </button>
                  );
                })}

              </div>

            )}

          </div>

        </section>

        {/* ================================= */}
        {/* OVERALL PROGRESS */}
        {/* ================================= */}

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-400">
                Overall Progress
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {stats.completed} of{" "}
                {stats.total} tasks completed
              </p>

            </div>

            <div className="text-2xl font-bold text-white">
              {statsLoading
                ? "..."
                : `${completionPercentage}%`}
            </div>

          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
              }}
            />

          </div>

        </section>

        {/* ================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================= */}

        <section className="mt-8 sm:mt-10">

          <div className="mb-5">

            <h3 className="text-xl font-bold text-white">
              Quick Actions
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Jump directly to what you need.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* ADD TASK */}

            <button
              type="button"
              onClick={() =>
                setShowTaskForm(true)
              }
              className="group rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-blue-500/10"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FiPlus size={22} />
              </div>

              <h4 className="mt-4 font-semibold text-white">
                Add Task
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Create a new task and start working.
              </p>

            </button>

            {/* VIEW TASKS */}

            <Link
              to="/tasks"
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                <FiList size={22} />
              </div>

              <h4 className="mt-4 font-semibold text-white">
                View Tasks
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Manage, filter and organize your tasks.
              </p>

            </Link>

            {/* ANALYTICS */}

            <Link
              to="/analytics"
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <FiBarChart2 size={22} />
              </div>

              <h4 className="mt-4 font-semibold text-white">
                View Analytics
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Track your productivity and progress.
              </p>

            </Link>

            {/* CALENDAR */}

            <Link
              to="/calendar"
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <FiCalendar size={22} />
              </div>

              <h4 className="mt-4 font-semibold text-white">
                Open Calendar
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Plan your tasks by date.
              </p>

            </Link>

          </div>

        </section>

        {/* ================================= */}
        {/* CATEGORIES */}
        {/* ================================= */}

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:mt-10 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="font-semibold text-white">
                Categories
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Organize your tasks with custom categories.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowCategoryManager(true)
              }
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
            >
              Manage Categories
            </button>

          </div>

        </section>

      </main>

      {/* ===================================== */}
      {/* TASK DETAILS MODAL */}
      {/* ===================================== */}

      {viewingTask && (
        <TaskDetails
          task={viewingTask}
          onClose={() =>
            setViewingTask(null)
          }
          onEdit={handleEditFromDetails}
        />
      )}

      {/* ===================================== */}
      {/* ADD TASK MODAL */}
      {/* ===================================== */}

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

      {/* ===================================== */}
      {/* EDIT TASK MODAL */}
      {/* ===================================== */}

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

      {/* ===================================== */}
      {/* CATEGORY MANAGER */}
      {/* ===================================== */}

      {showCategoryManager && (
        <CategoryManager
          user={user}
          onClose={
            closeCategoryManager
          }
          addToast={addToast}
        />
      )}

      {/* ===================================== */}
      {/* TOAST */}
      {/* ===================================== */}

      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />

    </div>
  );
}

export default Dashboard;