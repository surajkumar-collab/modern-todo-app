import {
  FiCheckSquare,
  FiClock,
  FiTrash2,
  FiEdit3,
  FiRepeat,
} from "react-icons/fi";

function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  formatDueDate,
  getDueDateStatus,
}) {
  const dueDateStatus =
    getDueDateStatus(task);

  // =========================
  // RECURRENCE LABEL
  // =========================

  const getRecurrenceLabel = () => {
    if (
      !task.recurrence_type ||
      task.recurrence_type === "none"
    ) {
      return null;
    }

    if (task.recurrence_type === "daily") {
      return "Daily";
    }

    if (task.recurrence_type === "weekly") {
      return "Weekly";
    }

    if (task.recurrence_type === "monthly") {
      return "Monthly";
    }

    return null;
  };

  const recurrenceLabel =
    getRecurrenceLabel();

  return (
    <div
      className={`group rounded-2xl border p-5 transition ${
        task.completed
          ? "border-green-500/20 bg-green-500/5"
          : "border-slate-800 bg-slate-900/60 hover:border-blue-500/30"
      }`}
    >
      <div className="flex items-start gap-4">

        {/* ========================= */}
        {/* CHECKBOX */}
        {/* ========================= */}

        <button
          type="button"
          onClick={() => onToggle(task)}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
            task.completed
              ? "border-green-500 bg-green-500 text-white"
              : "border-slate-600 hover:border-blue-500"
          }`}
          title={
            task.completed
              ? "Mark as active"
              : "Mark as completed"
          }
        >
          {task.completed && (
            <FiCheckSquare size={16} />
          )}
        </button>

        {/* ========================= */}
        {/* CONTENT */}
        {/* ========================= */}

        <div className="min-w-0 flex-1">

          {/* TITLE + BADGES */}

          <div className="flex flex-wrap items-center gap-2">

            {/* TITLE */}

            <h4
              className={`text-base font-semibold ${
                task.completed
                  ? "text-slate-500 line-through"
                  : "text-white"
              }`}
            >
              {task.title}
            </h4>

            {/* ========================= */}
            {/* PRIORITY */}
            {/* ========================= */}

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                task.priority === "high"
                  ? "bg-red-500/10 text-red-400"
                  : task.priority === "medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              {task.priority}
            </span>

            {/* ========================= */}
            {/* CATEGORY */}
            {/* ========================= */}

            <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
              {task.category}
            </span>

            {/* ========================= */}
            {/* RECURRENCE */}
            {/* ========================= */}

            {recurrenceLabel && (
              <span className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-400">
                <FiRepeat size={12} />

                {recurrenceLabel}
              </span>
            )}

          </div>

          {/* ========================= */}
          {/* DESCRIPTION */}
          {/* ========================= */}

          {task.description && (
            <p className="mt-2 text-sm text-slate-400">
              {task.description}
            </p>
          )}

          {/* ========================= */}
          {/* DUE DATE */}
          {/* ========================= */}

          {task.due_date && (
            <div
              className={`mt-3 flex flex-wrap items-center gap-2 text-xs ${
                dueDateStatus?.className ||
                "text-slate-500"
              }`}
            >
              <FiClock size={14} />

              <span className="font-medium">
                {dueDateStatus?.label}
              </span>

              <span className="text-slate-600">
                •
              </span>

              <span>
                Due:{" "}
                {formatDueDate(
                  task.due_date
                )}
              </span>
            </div>
          )}

          {/* ========================= */}
          {/* REPEAT UNTIL */}
          {/* ========================= */}

          {recurrenceLabel &&
            task.recurrence_end_date && (
              <p className="mt-2 text-xs text-slate-600">
                Repeats until{" "}
                {formatDueDate(
                  task.recurrence_end_date
                )}
              </p>
            )}

        </div>

        {/* ========================= */}
        {/* EDIT */}
        {/* ========================= */}

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
          title="Edit task"
        >
          <FiEdit3 size={18} />
        </button>

        {/* ========================= */}
        {/* DELETE */}
        {/* ========================= */}

        <button
          type="button"
          onClick={() =>
            onDelete(task.id)
          }
          className="shrink-0 rounded-lg p-2 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
          title="Delete task"
        >
          <FiTrash2 size={18} />
        </button>

      </div>
    </div>
  );
}

export default TaskItem;