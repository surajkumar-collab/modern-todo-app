import {
  FiCheckSquare,
  FiClock,
  FiTrash2,
  FiEdit3,
} from "react-icons/fi";

function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  formatDueDate,
  getDueDateStatus,
}) {
  const dueDateStatus = getDueDateStatus(task);

  return (
    <div
      className={`group rounded-2xl border p-5 transition-all duration-300 ${
        task.completed
          ? "border-green-500/20 bg-green-500/5"
          : "border-slate-800 bg-slate-900/60 hover:-translate-y-[1px] hover:border-blue-500/30 hover:bg-slate-900"
      }`}
    >
      <div className="flex items-start gap-4">

        {/* ========================= */}
        {/* CHECKBOX */}
        {/* ========================= */}

        <button
          type="button"
          onClick={() => onToggle(task)}
          aria-label={
            task.completed
              ? "Mark task as active"
              : "Mark task as completed"
          }
          title={
            task.completed
              ? "Mark as active"
              : "Mark as completed"
          }
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
            task.completed
              ? "scale-105 border-green-500 bg-green-500 text-white shadow-lg shadow-green-500/20"
              : "border-slate-600 text-transparent hover:scale-105 hover:border-blue-500 hover:bg-blue-500/10"
          }`}
        >
          <FiCheckSquare
            size={16}
            className={`transition-all duration-200 ${
              task.completed
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0"
            }`}
          />
        </button>

        {/* ========================= */}
        {/* CONTENT */}
        {/* ========================= */}

        <div className="min-w-0 flex-1">

          {/* TITLE + BADGES */}

          <div className="flex flex-wrap items-center gap-2">

            <h4
              className={`break-words text-base font-semibold transition-all duration-300 ${
                task.completed
                  ? "text-slate-500 line-through"
                  : "text-white"
              }`}
            >
              {task.title}
            </h4>

            {/* PRIORITY */}

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                task.priority === "high"
                  ? "bg-red-500/10 text-red-400"
                  : task.priority === "medium"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-green-500/10 text-green-400"
              }`}
            >
              {task.priority}
            </span>

            {/* CATEGORY */}

            <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
              {task.category}
            </span>

          </div>

          {/* ========================= */}
          {/* DESCRIPTION */}
          {/* ========================= */}

          {task.description && (
            <p
              className={`mt-2 break-words text-sm transition-colors duration-300 ${
                task.completed
                  ? "text-slate-600"
                  : "text-slate-400"
              }`}
            >
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

        </div>

        {/* ========================= */}
        {/* ACTIONS */}
        {/* ========================= */}

        <div className="flex shrink-0 items-center gap-1">

          {/* EDIT */}

          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
            title="Edit task"
            className="rounded-lg p-2 text-slate-400 transition-all duration-200 hover:bg-blue-500/10 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <FiEdit3 size={18} />
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label="Delete task"
            title="Delete task"
            className="rounded-lg p-2 text-slate-500 opacity-70 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 group-hover:opacity-100 sm:opacity-0"
          >
            <FiTrash2 size={18} />
          </button>

        </div>

      </div>
    </div>
  );
}

export default TaskItem;