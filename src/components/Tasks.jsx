import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { supabase } from "../supabaseClient";

import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import TaskDetails from "./TaskDetails";

function Tasks({ user }) {
  // =========================================================
  // URL PARAMETER
  // =========================================================

  const [searchParams, setSearchParams] =
    useSearchParams();

  // =========================================================
  // STATES
  // =========================================================

  const [editingTask, setEditingTask] =
    useState(null);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [loadingTask, setLoadingTask] =
    useState(false);

  // =========================================================
  // OPEN TASK FROM NOTIFICATION
  // =========================================================

  useEffect(() => {
    const taskId =
      searchParams.get("task");

    if (!taskId || !user?.id) {
      return;
    }

    let cancelled = false;

    async function loadTask() {
      try {
        setLoadingTask(true);

        const {
          data,
          error,
        } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .eq("user_id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setSelectedTask(data);
        }
      } catch (error) {
        console.error(
          "Failed to open notification task:",
          error
        );

        if (!cancelled) {
          setSelectedTask(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingTask(false);
        }
      }
    }

    loadTask();

    return () => {
      cancelled = true;
    };
  }, [searchParams, user?.id]);

  // =========================================================
  // CLOSE DETAILS MODAL
  // =========================================================

  const closeTaskDetails = () => {
    setSelectedTask(null);

    // Remove ?task=ID from URL
    setSearchParams(
      {},
      {
        replace: true,
      }
    );
  };

  // =========================================================
  // EDIT TASK
  // =========================================================

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  // =========================================================
  // TASK UPDATED
  // =========================================================

  const handleTaskUpdated = () => {
    setEditingTask(null);

    setRefreshKey(
      (prev) => prev + 1
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        px-4
        py-8
        text-white
        sm:px-6
        lg:px-8
      "
    >

      <div className="mx-auto max-w-7xl">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            WORKSPACE
          </p>

          <h1
            className="
              mt-1
              text-3xl
              font-bold
              tracking-tight
              text-white
            "
          >
            Tasks
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Manage, organize and complete your tasks.
          </p>

        </div>

        {/* ================================================= */}
        {/* TASK LIST */}
        {/* ================================================= */}

        <TaskList
          user={user}
          refreshKey={refreshKey}
          onEditTask={handleEditTask}
        />

      </div>

      {/* ================================================= */}
      {/* EDIT TASK MODAL */}
      {/* ================================================= */}

      {editingTask && (
        <TaskForm
          user={user}
          task={editingTask}

          onClose={() => {
            setEditingTask(null);
          }}

          onTaskUpdated={
            handleTaskUpdated
          }
        />
      )}

      {/* ================================================= */}
      {/* TASK DETAILS MODAL */}
      {/* ================================================= */}

      {selectedTask && (
        <TaskDetails
          task={selectedTask}
          onClose={closeTaskDetails}
        />
      )}

      {/* ================================================= */}
      {/* LOADING */}
      {/* ================================================= */}

      {loadingTask && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/70
            backdrop-blur-sm
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              px-5
              py-4
              shadow-2xl
            "
          >

            <div
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-slate-700
                border-t-blue-400
              "
            />

            <span
              className="
                text-sm
                text-slate-400
              "
            >
              Opening task...
            </span>

          </div>
        </div>
      )}

    </div>
  );
}

export default Tasks;