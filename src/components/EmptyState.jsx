import {
  FiCheckSquare,
  FiSearch,
  FiPlus,
  FiSliders,
} from "react-icons/fi";

function EmptyState({
  type = "tasks",
}) {
  const isSearch = type === "search";

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-10 text-center">

      {/* ========================= */}
      {/* ICON */}
      {/* ========================= */}

      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${
          isSearch
            ? "bg-slate-800/80 text-slate-400"
            : "bg-blue-500/10 text-blue-400"
        }`}
      >
        {isSearch ? (
          <FiSearch size={28} />
        ) : (
          <FiCheckSquare size={30} />
        )}
      </div>

      {/* ========================= */}
      {/* TITLE */}
      {/* ========================= */}

      <h4 className="text-lg font-semibold text-white">
        {isSearch
          ? "No matching tasks"
          : "Your task list is empty"}
      </h4>

      {/* ========================= */}
      {/* DESCRIPTION */}
      {/* ========================= */}

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {isSearch
          ? "We couldn't find any tasks matching your current search or filters."
          : "You don't have any tasks yet. Create your first task and start getting things done."}
      </p>

      {/* ========================= */}
      {/* ACTION AREA */}
      {/* ========================= */}

      <div className="mt-6">

        {isSearch ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-2.5 text-xs font-medium text-slate-500">
            <FiSliders size={14} />

            <span>
              Try changing your search or filters
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-xs font-medium text-blue-400">
            <FiPlus size={14} />

            <span>
              Use "Add Task" to create your first task
            </span>
          </div>
        )}

      </div>

    </div>
  );
}

export default EmptyState;