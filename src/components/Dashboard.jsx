import { useState } from "react";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";

import {
  FiCheckSquare,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiLogOut,
  FiMenu,
  FiSearch,
} from "react-icons/fi";

function Dashboard({ user, onLogout }) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingTask, setEditingTask] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between px-6 lg:px-10">

          {/* Logo */}

          <div className="flex items-center gap-3">

            <button
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <FiMenu size={22} />
            </button>

            <h1 className="text-2xl font-extrabold tracking-tight">
              Task
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Flow
              </span>
            </h1>

          </div>

          {/* Search */}

          <div className="hidden w-full max-w-md items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 md:flex">

            <FiSearch className="text-slate-500" />

            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />

          </div>

          {/* User */}

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">

              <p className="text-sm font-medium text-white">
                {userName}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email}
              </p>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="rounded-xl p-2.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <FiLogOut size={20} />
            </button>

          </div>

        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        {/* Welcome */}

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


        {/* ================= STATS ================= */}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-blue-500/30">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-400">
                  Total Tasks
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {stats.total}
                </p>

              </div>

              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <FiCheckSquare size={24} />
              </div>

            </div>

          </div>


          {/* Active */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-yellow-500/30">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-400">
                  Active Tasks
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {stats.active}
                </p>

              </div>

              <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                <FiClock size={24} />
              </div>

            </div>

          </div>


          {/* Completed */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-green-500/30">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-400">
                  Completed
                </p>

                <p className="mt-3 text-3xl font-bold">
                  {stats.completed}
                </p>

              </div>

              <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                <FiCheckCircle size={24} />
              </div>

            </div>

          </div>

        </section>


        {/* ================= TASK SECTION ================= */}

        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h3 className="text-xl font-bold">
                My Tasks
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Manage your daily tasks.
              </p>

            </div>


            {/* Add Task */}

            <button
              onClick={() => setShowTaskForm(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
            >
              <FiPlus size={18} />
              Add Task
            </button>

          </div>


          {/* ================= TASK LIST ================= */}

          <TaskList
            user={user}
            refreshKey={refreshKey}
            onStatsChange={setStats}
            onEditTask={(task) => {
              console.log("EDIT CLICKED:", task);
              setEditingTask(task);
            }}
          />

        </section>

      </main>


      {/* ================= ADD TASK MODAL ================= */}

      {showTaskForm && (
        <TaskForm
          user={user}
          onClose={() => setShowTaskForm(false)}
          onTaskCreated={() => {
            setShowTaskForm(false);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}


      {/* ================= EDIT TASK MODAL ================= */}

      {editingTask && (
        <TaskForm
          user={user}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={(updatedTask) => {
            console.log("TASK UPDATED:", updatedTask);

            setEditingTask(null);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      )}

    </div>
  );
}

export default Dashboard;