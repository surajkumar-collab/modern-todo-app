import { FiCheckSquare, FiSearch } from "react-icons/fi";

function EmptyState({
  type = "tasks",
}) {
  const isSearch = type === "search";

  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 text-center">

      {/* Icon */}

      <div
        className={`mb-4 rounded-2xl p-5 ${
          isSearch
            ? "bg-slate-800 text-slate-400"
            : "bg-blue-500/10 text-blue-400"
        }`}
      >
        {isSearch ? (
          <FiSearch size={30} />
        ) : (
          <FiCheckSquare size={32} />
        )}
      </div>

      {/* Title */}

      <h4 className="text-lg font-semibold text-white">
        {isSearch
          ? "No matching tasks"
          : "No tasks yet"}
      </h4>

      {/* Description */}

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {isSearch
          ? "Try changing your search or filters."
          : "Create your first task and start getting things done."}
      </p>

    </div>
  );
}

export default EmptyState;