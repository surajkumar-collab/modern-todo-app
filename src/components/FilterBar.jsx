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
  return (
    <div className="mb-6">

      {/* ========================= */}
      {/* FILTER CONTROLS */}
      {/* ========================= */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        {/* RESULT COUNT */}

        <span className="text-sm text-slate-500">
          {taskCount}{" "}
          {taskCount === 1 ? "task" : "tasks"}
        </span>

        <div className="flex flex-wrap items-center gap-3">

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
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
          </select>

          {/* CATEGORY */}

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            disabled={categoriesLoading}
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-60"
          >
            <option value="all">
              All Categories
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

          {/* PRIORITY */}

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value)
            }
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
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

          {/* SORT */}

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
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

        </div>

      </div>

    </div>
  );
}

export default FilterBar;