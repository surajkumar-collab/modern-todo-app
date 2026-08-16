import { useState } from "react";

import TaskList from "./TaskList";
import TaskForm from "./TaskForm";

function Tasks({ user }) {
  const [editingTask, setEditingTask] =
    useState(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            WORKSPACE
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Tasks
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage, organize and complete your tasks.
          </p>

        </div>

        {/* ========================= */}
        {/* TASK LIST */}
        {/* ========================= */}

        <TaskList
          user={user}
          refreshKey={refreshKey}
          onEditTask={(task) => {
            setEditingTask(task);
          }}
        />

      </div>

      {/* ========================= */}
      {/* EDIT TASK MODAL */}
      {/* ========================= */}

      {editingTask && (
        <TaskForm
          user={user}
          task={editingTask}

          onClose={() => {
            setEditingTask(null);
          }}

          onTaskUpdated={() => {
            setEditingTask(null);

            setRefreshKey(
              (prev) => prev + 1
            );
          }}
        />
      )}

    </div>
  );
}

export default Tasks;