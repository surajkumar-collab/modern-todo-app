import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "../supabaseClient";

import TaskForm from "./TaskForm";
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
} from "react-icons/fi";

function Dashboard({ user, onLogout }) {
  // =========================================
  // STATES
  // =========================================

  const [showTaskForm, setShowTaskForm] =
    useState(false);

  const [showCategoryManager, setShowCategoryManager] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [editingTask, setEditingTask] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  // =========================================
  // DASHBOARD STATS
  // =========================================

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  const [statsLoading, setStatsLoading] =
    useState(true);

  // =========================================
  // TOASTS
  // =========================================

  const [toasts, setToasts] =
    useState([]);

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

    setTimeout(() => {
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

  // =========================================
  // USER NAME
  // =========================================

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  // =========================================
  // FETCH DASHBOARD STATS
  // =========================================

  useEffect(() => {
    let mounted = true;

    async function fetchDashboardStats() {
      if (!user?.id) {
        if (mounted) {
          setStats({
            total: 0,
            active: 0,
            completed: 0,
          });

          setStatsLoading(false);
        }

        return;
      }

      try {
        setStatsLoading(true);

        const {
          data,
          error,
        } = await supabase
          .from("tasks")
          .select("completed")
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        const taskData = data || [];

        const total =
          taskData.length;

        const completed =
          taskData.filter(
            (task) =>
              task.completed === true
          ).length;

        const active =
          total - completed;

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

        if (mounted) {
          setStats({
            total: 0,
            active: 0,
            completed: 0,
          });
        }
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
  // COMPLETION PERCENTAGE
  // =========================================

  const completionPercentage =
    stats.total === 0
      ? 0
      : Math.round(
          (stats.completed /
            stats.total) *
            100
        );

  // =========================================
  // CLOSE CATEGORY MANAGER
  // =========================================

  const closeCategoryManager = () => {
    setShowCategoryManager(false);

    setRefreshKey(
      (prev) => prev + 1
    );
  };

  // =========================================
  // TASK CREATED
  // =========================================

  const handleTaskCreated = () => {
    setShowTaskForm(false);

    setRefreshKey(
      (prev) => prev + 1
    );

    addToast(
      "Task created successfully",
      "success"
    );
  };

  // =========================================
  // TASK UPDATED
  // =========================================

  const handleTaskUpdated = () => {
    setEditingTask(null);

    setRefreshKey(
      (prev) => prev + 1
    );

    addToast(
      "Task updated successfully",
      "success"
    );
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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-8">

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

          {/* TOTAL */}

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

          {/* ACTIVE */}

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

          {/* COMPLETED */}

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
        {/* OVERALL PROGRESS */}
        {/* ================================= */}

        <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:mt-5 sm:p-6">

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

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800 sm:mt-5">

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
        {/* CATEGORY MANAGEMENT */}
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
      {/* ADD TASK MODAL */}
      {/* ===================================== */}

      {showTaskForm && (
        <TaskForm
          user={user}
          onClose={() =>
            setShowTaskForm(false)
          }
          onTaskCreated={handleTaskCreated}
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
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {/* ===================================== */}
      {/* CATEGORY MANAGER */}
      {/* ===================================== */}

      {showCategoryManager && (
        <CategoryManager
          user={user}
          onClose={closeCategoryManager}
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