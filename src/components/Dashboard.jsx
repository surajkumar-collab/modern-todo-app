import { useState } from "react";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import CategoryManager from "./CategoryManager";
import Navbar from "./Navbar";
import StatsCard from "./StatsCard";

import {
  FiCheckSquare,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { FiPlus } from "react-icons/fi";

function Dashboard({ user, onLogout }) {
  // =========================
  // STATES
  // =========================

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

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  // =========================
  // USER NAME
  // =========================

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  // =========================
  // COMPLETION %
  // =========================

  const completionPercentage =
    stats.total === 0
      ? 0
      : Math.round(
          (stats.completed / stats.total) *
            100
        );

  // =========================
  // RENDER
  // =========================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ========================= */}
      {/* NAVBAR */}
      {/* ========================= */}

      <Navbar
        user={user}
        onLogout={onLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* ========================= */}
      {/* MAIN */}
      {/* ========================= */}

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        {/* ========================= */}
        {/* WELCOME */}
        {/* ========================= */}

        <section className="mb-10">

          <p className="text-sm font-medium text-blue-400">
            YOUR PRODUCTIVITY HUB
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Good to see you, {userName} 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Stay focused and get things done.
          </p>

        </section>

        {/* ========================= */}
        {/* STATS */}
        {/* ========================= */}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <StatsCard
            title="Total Tasks"
            value={stats.total}
            description="All your tasks"
            icon={
              <FiCheckSquare size={24} />
            }
            iconClassName="bg-blue-500/10 text-blue-400"
            hoverClassName="hover:border-blue-500/30"
          />

          <StatsCard
            title="Active Tasks"
            value={stats.active}
            description="Tasks still in progress"
            icon={
              <FiClock size={24} />
            }
            iconClassName="bg-yellow-500/10 text-yellow-400"
            hoverClassName="hover:border-yellow-500/30"
          />

          <StatsCard
            title="Completed"
            value={stats.completed}
            description="Tasks you finished"
            icon={
              <FiCheckCircle size={24} />
            }
            iconClassName="bg-green-500/10 text-green-400"
            hoverClassName="hover:border-green-500/30"
          />

        </section>

        {/* ========================= */}
        {/* PROGRESS */}
        {/* ========================= */}

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

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
              {completionPercentage}%
            </div>

          </div>

          {/* Progress Bar */}

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
              style={{
                width: `${completionPercentage}%`,
              }}
            />

          </div>

        </section>

        {/* ========================= */}
        {/* TASK SECTION */}
        {/* ========================= */}

        <section className="mt-10">

          {/* TASK HEADER */}

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h3 className="text-xl font-bold">
                My Tasks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your daily tasks.
              </p>

            </div>

            {/* ACTION BUTTONS */}

            <div className="flex flex-wrap items-center gap-3">

              {/* CATEGORY MANAGER */}

              <button
                type="button"
                onClick={() =>
                  setShowCategoryManager(true)
                }
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white"
              >
                Manage Categories
              </button>

              {/* ADD TASK */}

              <button
                type="button"
                onClick={() =>
                  setShowTaskForm(true)
                }
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
              >
                <FiPlus size={18} />
                Add Task
              </button>

            </div>

          </div>

          {/* ========================= */}
          {/* TASK LIST */}
          {/* ========================= */}

          <TaskList
            user={user}
            refreshKey={refreshKey}
            searchQuery={searchQuery}
            onStatsChange={setStats}
            onEditTask={(task) => {
              setEditingTask(task);
            }}
          />

        </section>

      </main>

      {/* ========================= */}
      {/* ADD TASK MODAL */}
      {/* ========================= */}

      {showTaskForm && (
        <TaskForm
          user={user}
          onClose={() =>
            setShowTaskForm(false)
          }
          onTaskCreated={(newTask) => {
            console.log(
              "TASK CREATED:",
              newTask
            );

            setShowTaskForm(false);

            setRefreshKey(
              (prev) => prev + 1
            );
          }}
        />
      )}

      {/* ========================= */}
      {/* EDIT TASK MODAL */}
      {/* ========================= */}

      {editingTask && (
        <TaskForm
          user={user}
          task={editingTask}
          onClose={() =>
            setEditingTask(null)
          }
          onTaskUpdated={(updatedTask) => {
            console.log(
              "TASK UPDATED:",
              updatedTask
            );

            setEditingTask(null);

            setRefreshKey(
              (prev) => prev + 1
            );
          }}
        />
      )}

      {/* ========================= */}
      {/* CATEGORY MANAGER */}
      {/* ========================= */}

      {showCategoryManager && (
        <CategoryManager
          user={user}
          onClose={() => {
            setShowCategoryManager(false);

            setRefreshKey(
              (prev) => prev + 1
            );
          }}
        />
      )}

    </div>
  );
}

export default Dashboard;