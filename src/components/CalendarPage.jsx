import { useState } from "react";

import CalendarView from "./CalendarView";
import TaskForm from "./TaskForm";
import ToastContainer from "./ToastContainer";

function CalendarPage({ user }) {
  // =========================================
  // STATES
  // =========================================

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [editingTask, setEditingTask] =
    useState(null);

  const [toasts, setToasts] =
    useState([]);

  // =========================================
  // TOAST
  // =========================================

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
  // EDIT TASK
  // =========================================

  const handleEditTask = (task) => {
    console.log(
      "Calendar edit clicked:",
      task
    );

    setEditingTask(task);
  };

  // =========================================
  // TASK UPDATED
  // =========================================

  const handleTaskUpdated = (
    updatedTask
  ) => {
    console.log(
      "Calendar task updated:",
      updatedTask
    );

    setEditingTask(null);

    setRefreshKey(
      (prev) => prev + 1
    );

    addToast(
      "Task updated successfully",
      "success"
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ================================= */}
        {/* PAGE HEADER */}
        {/* ================================= */}

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            PLANNING
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Calendar
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Plan and manage your tasks by due date.
          </p>

        </div>

        {/* ================================= */}
        {/* CALENDAR */}
        {/* ================================= */}

        <CalendarView
          user={user}
          refreshKey={refreshKey}
          onEditTask={handleEditTask}
          addToast={addToast}
        />

      </div>

      {/* ================================= */}
      {/* EDIT TASK MODAL */}
      {/* ================================= */}

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

      {/* ================================= */}
      {/* TOAST */}
      {/* ================================= */}

      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />

    </div>
  );
}

export default CalendarPage;