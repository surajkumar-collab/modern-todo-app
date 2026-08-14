import { useState } from "react";

import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import CategoryManager from "./CategoryManager";
import Navbar from "./Navbar";
import StatsCard from "./StatsCard";
import ToastContainer from "./ToastContainer";
import CalendarView from "./CalendarView";
import Analytics from "./Analytics";

import {
  FiCheckSquare,
  FiClock,
  FiCheckCircle,
  FiPlus,
} from "react-icons/fi";

function Dashboard({ user, onLogout }) {
  // =========================
  // STATES
  // =========================

  const [showTaskForm, setShowTaskForm] = useState(false);

  const [showCategoryManager, setShowCategoryManager] =
    useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const [editingTask, setEditingTask] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  const [analyticsTasks, setAnalyticsTasks] = useState([]);

  // =========================
  // TOAST
  // =========================

  const [toasts, setToasts] = useState([]);

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
          (stats.completed / stats.total) * 100
        );

  // =========================
  // CLOSE CATEGORY MANAGER
  // =========================

  const closeCategoryManager = () => {
    setShowCategoryManager(false);

    setRefreshKey((prev) => prev + 1);
  };

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

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-8">

        {/* ========================= */}
        {/* WELCOME */}
        {/* ========================= */}

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

        {/* ========================= */}
        {/* STATS */}
        {/* ========================= */}

        <section className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">

          <StatsCard
            title="Total Tasks"
            value={stats.total}
            description="All your tasks"
            icon={<FiCheckSquare size={24} />}
            iconClassName="bg-blue-500/10 text-blue-400"
            hoverClassName="hover:border-blue-500/30"
          />

          <StatsCard
            title="Active Tasks"
            value={stats.active}
            description="Tasks still in progress"
            icon={<FiClock size={24} />}
            iconClassName="bg-yellow-500/10 text-yellow-400"
            hoverClassName="hover:border-yellow-500/30"
          />

          <StatsCard
            title="Completed"
            value={stats.completed}
            description="Tasks you finished"
            icon={<FiCheckCircle size={24} />}
            iconClassName="bg-green-500/10 text-green-400"
            hoverClassName="hover:border-green-500/30"
          />

        </section>

        {/* ========================= */}
        {/* PROGRESS */}
        {/* ========================= */}

        <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:mt-5 sm:p-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-400">
                Overall Progress
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {stats.completed} of {stats.total} tasks completed
              </p>

            </div>

            <div className="text-2xl font-bold text-white">
              {completionPercentage}%
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


        {/* ========================= */}
        {/* PRODUCTIVITY ANALYTICS */}
        {/* ========================= */}

        <Analytics tasks={analyticsTasks} />

        {/* ========================= */}
        {/* CALENDAR */}
        {/* ========================= */}

        <section className="mt-10">
          <CalendarView user={user} 
          refreshKey={refreshKey}
          onEditTask={(task) => {
            setEditingTask(task);
          }}
          addToast={addToast}
          />
        </section>

        {/* ========================= */}
        {/* TASK SECTION */}
        {/* ========================= */}

        <section className="mt-8 sm:mt-10">

          {/* ========================= */}
          {/* TASK HEADER */}
          {/* ========================= */}

          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h3 className="text-xl font-bold">
                My Tasks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your daily tasks.
              </p>

            </div>

            {/* ========================= */}
            {/* ACTION BUTTONS */}
            {/* ========================= */}

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:flex lg:items-center">

              {/* MANAGE CATEGORIES */}

              <button
                type="button"
                onClick={() =>
                  setShowCategoryManager(true)
                }
                className="flex w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-blue-500/40 hover:bg-slate-800 hover:text-white active:scale-[0.98] lg:w-auto"
              >
                Manage Categories
              </button>

              {/* ADD TASK */}

              <button
                type="button"
                onClick={() =>
                  setShowTaskForm(true)
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] lg:w-auto"
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
            onTasksChange={setAnalyticsTasks}
            onEditTask={(task) => {
              setEditingTask(task);
            }}
            addToast={addToast}
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
          onTaskCreated={() => {
            setShowTaskForm(false);

            setRefreshKey(
              (prev) => prev + 1
            );

            addToast(
              "Task created successfully",
              "success"
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
          onTaskUpdated={() => {
            setEditingTask(null);

            setRefreshKey(
              (prev) => prev + 1
            );

            addToast(
              "Task updated successfully",
              "success"
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
          onClose={
            closeCategoryManager
          }
          addToast={addToast}
        />
      )}

      {/* ========================= */}
      {/* TOAST CONTAINER */}
      {/* ========================= */}

      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />

    </div>
  );
}

export default Dashboard;