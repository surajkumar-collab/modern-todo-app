import { createPortal } from "react-dom";

import {
  FiX,
  FiEdit3,
  FiCalendar,
  FiTag,
  FiFlag,
  FiRepeat,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

function TaskDetails({
  task,
  onClose,
  onEdit,
}) {
  if (!task) {
    return null;
  }

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "No due date";
    }

    const [year, month, day] =
      dateString.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FORMAT DATETIME
  // =========================

  const formatDateTime = (dateString) => {
    if (!dateString) {
      return "Not available";
    }

    return new Date(dateString).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // PRIORITY
  // =========================

  const getPriorityStyles = () => {
    if (task.priority === "high") {
      return {
        badge:
          "border-red-500/20 bg-red-500/10 text-red-400",
        icon:
          "bg-red-500/10 text-red-400",
      };
    }

    if (task.priority === "medium") {
      return {
        badge:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        icon:
          "bg-yellow-500/10 text-yellow-400",
      };
    }

    return {
      badge:
        "border-green-500/20 bg-green-500/10 text-green-400",
      icon:
        "bg-green-500/10 text-green-400",
    };
  };

  // =========================
  // RECURRENCE
  // =========================

  const getRecurrenceLabel = () => {
    if (
      !task.recurrence_type ||
      task.recurrence_type === "none"
    ) {
      return "Does not repeat";
    }

    if (task.recurrence_type === "daily") {
      return "Every day";
    }

    if (task.recurrence_type === "weekly") {
      return "Every week";
    }

    if (task.recurrence_type === "monthly") {
      return "Every month";
    }

    return "Does not repeat";
  };

  const priorityStyles =
    getPriorityStyles();

  // =========================
  // EDIT HANDLER
  // =========================

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  // =========================
  // MODAL
  // =========================

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {/* ========================= */}
      {/* MODAL CONTAINER */}
      {/* ========================= */}

      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="flex shrink-0 items-start justify-between border-b border-slate-800 bg-slate-950 px-5 py-5 sm:px-6">

          <div className="min-w-0 pr-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Task Details
            </p>

            <h2 className="mt-1 break-words text-xl font-bold text-white sm:text-2xl">
              {task.title}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-800 hover:text-white"
            title="Close"
            aria-label="Close task details"
          >
            <FiX size={20} />
          </button>

        </div>

        {/* ========================= */}
        {/* CONTENT */}
        {/* ========================= */}

        <div className="overflow-y-auto px-5 py-6 sm:px-6">

          {/* ========================= */}
          {/* STATUS + PRIORITY */}
          {/* ========================= */}

          <div className="flex flex-wrap items-center gap-2">

            {/* STATUS */}

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                task.completed
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-blue-500/20 bg-blue-500/10 text-blue-400"
              }`}
            >
              {task.completed ? (
                <FiCheckCircle size={14} />
              ) : (
                <FiClock size={14} />
              )}

              {task.completed
                ? "Completed"
                : "Active"}
            </span>

            {/* PRIORITY */}

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${priorityStyles.badge}`}
            >
              <FiFlag size={13} />

              {task.priority
                ? task.priority
                    .charAt(0)
                    .toUpperCase() +
                  task.priority.slice(1)
                : "Medium"}

              {" "}Priority
            </span>

          </div>

          {/* ========================= */}
          {/* DESCRIPTION */}
          {/* ========================= */}

          <section className="mt-6">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Description
            </p>

            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              {task.description ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm italic text-slate-600">
                  No description added.
                </p>
              )}

            </div>

          </section>

          {/* ========================= */}
          {/* DETAILS GRID */}
          {/* ========================= */}

          <section className="mt-5 grid gap-3 sm:grid-cols-2">

            {/* CATEGORY */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <FiTag size={17} />
                </div>

                <div className="min-w-0">

                  <p className="text-xs text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {task.category ||
                      "General"}
                  </p>

                </div>

              </div>

            </div>

            {/* PRIORITY */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${priorityStyles.icon}`}
                >
                  <FiFlag size={17} />
                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Priority
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {task.priority
                      ? task.priority
                          .charAt(0)
                          .toUpperCase() +
                        task.priority.slice(1)
                      : "Medium"}
                  </p>

                </div>

              </div>

            </div>

            {/* DUE DATE */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <FiCalendar size={17} />
                </div>

                <div className="min-w-0">

                  <p className="text-xs text-slate-500">
                    Due Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatDate(
                      task.due_date
                    )}
                  </p>

                </div>

              </div>

            </div>

            {/* RECURRENCE */}

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  <FiRepeat size={17} />
                </div>

                <div className="min-w-0">

                  <p className="text-xs text-slate-500">
                    Recurrence
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {getRecurrenceLabel()}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* ========================= */}
          {/* REPEAT UNTIL */}
          {/* ========================= */}

          {task.recurrence_end_date &&
            task.recurrence_type &&
            task.recurrence_type !== "none" && (
              <div className="mt-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">

                <div className="flex items-center gap-3">

                  <FiCalendar
                    size={16}
                    className="text-purple-400"
                  />

                  <div>

                    <p className="text-xs text-purple-400">
                      Repeats Until
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatDate(
                        task.recurrence_end_date
                      )}
                    </p>

                  </div>

                </div>

              </div>
            )}

          {/* ========================= */}
          {/* CREATED / UPDATED */}
          {/* ========================= */}

          <section className="mt-6 grid gap-3 sm:grid-cols-2">

            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">

              <p className="text-xs text-slate-600">
                Created
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {formatDateTime(
                  task.created_at
                )}
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">

              <p className="text-xs text-slate-600">
                Last Updated
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {formatDateTime(
                  task.updated_at
                )}
              </p>

            </div>

          </section>

        </div>

        {/* ========================= */}
        {/* FOOTER */}
        {/* ========================= */}

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <FiEdit3 size={16} />
            Edit Task
          </button>

        </div>

      </div>
    </div>
  );

  // =========================
  // RENDER THROUGH PORTAL
  // =========================

  return createPortal(
    modal,
    document.body
  );
}

export default TaskDetails;