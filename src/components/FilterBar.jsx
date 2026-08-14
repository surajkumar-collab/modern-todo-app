function FilterBar({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  categories,
  categoriesLoading,
  taskCount,
}) {
  // =========================
  // CHECK ACTIVE FILTERS
  // =========================

  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    priorityFilter !== "all" ||
    sortBy !== "newest";

  // =========================
  // CLEAR ALL FILTERS
  // =========================

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="mb-6 w-full">

      {/* ========================= */}
      {/* TOP ROW */}
      {/* ========================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        {/* RESULT COUNT */}

        <div className="flex items-center justify-between lg:justify-start">
          <span className="text-sm font-medium text-slate-500">
            {taskCount}{" "}
            {taskCount === 1 ? "task" : "tasks"}
          </span>
        </div>

        {/* ========================= */}
        {/* FILTER CONTROLS */}
        {/* ========================= */}

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap">

          {/* ========================= */}
          {/* STATUS */}
          {/* ========================= */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="w-full min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none transition hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 lg:w-auto"
          >
            <option value="all">
              All Tasks
            </option>

            <option value="active">
              Active
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="today">
              Today
            </option>

            <option value="overdue">
              Overdue
            </option>
          </select>

          {/* ========================= */}
          {/* CATEGORY */}
          {/* ========================= */}

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            disabled={categoriesLoading}
            className="w-full min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none transition hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
          >
            <option value="all">
              {categoriesLoading
                ? "Loading Categories..."
                : "All Categories"}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.name}
              >
                {category.name}
              </option>
            ))}
          </select>

          {/* ========================= */}
          {/* PRIORITY */}
          {/* ========================= */}

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
            className="w-full min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none transition hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 lg:w-auto"
          >
            <option value="all">
              All Priorities
            </option>

            <option value="high">
              High Priority
            </option>

            <option value="medium">
              Medium Priority
            </option>

            <option value="low">
              Low Priority
            </option>
          </select>

          {/* ========================= */}
          {/* SORT */}
          {/* ========================= */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
            className="w-full min-w-0 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none transition hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 lg:w-auto"
          >
            <option value="newest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>

            <option value="priority">
              Priority
            </option>

            <option value="dueDate">
              Due Date
            </option>
          </select>

          {/* ========================= */}
          {/* CLEAR FILTERS */}
          {/* ========================= */}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 lg:w-auto"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default FilterBar;