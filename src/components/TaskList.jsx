import { useEffect, useState } from "react";
import {
  FiCheckSquare,
  FiClock,
  FiTrash2,
  FiEdit3,
  FiSearch,
} from "react-icons/fi";
import { supabase } from "../supabaseClient";

function TaskList({
  user,
  refreshKey = 0,
  onStatsChange,
  onEditTask,
  searchQuery = "",
}) {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  // =========================
  // FILTER STATES
  // =========================
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // =========================
  // FETCH TASKS
  // =========================

  const fetchTasks = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      const taskData = data || [];

      setTasks(taskData);

      // =========================
      // STATS
      // =========================

      if (onStatsChange) {
        const total = taskData.length;

        const completed = taskData.filter(
          (task) => task.completed
        ).length;

        const active = total - completed;

        onStatsChange({
          total,
          active,
          completed,
        });
      }
    } catch (error) {
      console.error(
        "Fetch tasks error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    if (!user?.id) {
      setCategoriesLoading(false);
      return;
    }

    setCategoriesLoading(true);

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const categoryData = data || [];

      setCategories(categoryData);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    fetchTasks();
    fetchCategories();
  }, [user?.id, refreshKey]);

  // =========================
  // TOGGLE TASK
  // =========================

  const toggleTask = async (task) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          completed: !task.completed,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", task.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTasks((prevTasks) =>
        prevTasks.map((item) =>
          item.id === task.id ? data : item
        )
      );

      fetchTasks();
    } catch (error) {
      console.error(
        "Update task error:",
        error
      );
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setTasks((prevTasks) =>
        prevTasks.filter(
          (task) => task.id !== taskId
        )
      );

      fetchTasks();
    } catch (error) {
      console.error(
        "Delete task error:",
        error
      );
    }
  };

  const getDueDateStatus = (task) => {
    if (!task.due_date || task.completed) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(`${task.due_date}T00:00:00`);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(
      diffTime / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return {
        label: "Overdue",
        className: "text-red-400",
      };
    }

    if (diffDays === 0) {
      return {
        label: "Due Today",
        className: "text-yellow-400",
      };
    }

    if (diffDays === 1) {
      return {
        label: "Due Tomorrow",
        className: "text-blue-400",
      };
    }

    return {
      label: "Upcoming",
      className: "text-slate-500",
    };
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================
  // FILTER + SORT
  // =========================

  const filteredTasks = tasks
    .filter((task) => {
      const search =
        searchQuery.toLowerCase().trim();

      // Search
      const matchesSearch =
        task.title
          ?.toLowerCase()
          .includes(search) ||
        task.description
          ?.toLowerCase()
          .includes(search);

      // Status
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          !task.completed) ||
        (statusFilter === "completed" &&
          task.completed);

      // Category
      const matchesCategory =
        categoryFilter === "all" ||
        task.category === categoryFilter;

      // Priority
      const matchesPriority =
        priorityFilter === "all" ||
        task.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority
      );
    })
    .sort((a, b) => {
      // Newest
      if (sortBy === "newest") {
        return (
          new Date(b.created_at) -
          new Date(a.created_at)
        );
      }

      // Oldest
      if (sortBy === "oldest") {
        return (
          new Date(a.created_at) -
          new Date(b.created_at)
        );
      }

      // Priority
      if (sortBy === "priority") {
        const priorityOrder = {
          high: 1,
          medium: 2,
          low: 3,
        };

        return (
          priorityOrder[a.priority] -
          priorityOrder[b.priority]
        );
      }

      // Due date
      if (sortBy === "dueDate") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;

        return (
          new Date(a.due_date) -
          new Date(b.due_date)
        );
      }

      return 0;
    });

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[250px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading tasks...
        </p>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="w-full">

      {/* ================================================= */}
      {/* SEARCH + STATUS */}
      {/* ================================================= */}

      <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">

        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
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
          className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 disabled:opacity-60"
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

      </div>

      {/* ================================================= */}
      {/* FILTER BAR */}
      {/* ================================================= */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

        {/* RESULT COUNT */}

        <span className="text-sm text-slate-500">
          {filteredTasks.length}{" "}
          {filteredTasks.length === 1
            ? "task"
            : "tasks"}
        </span>

        <div className="flex flex-wrap items-center gap-3">

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

      {/* ================================================= */}
      {/* NO TASKS */}
      {/* ================================================= */}

      {tasks.length === 0 && (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 text-center">

          <div className="mb-4 rounded-2xl bg-blue-500/10 p-5 text-blue-400">
            <FiCheckSquare size={32} />
          </div>

          <h4 className="text-lg font-semibold text-white">
            No tasks yet
          </h4>

          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Create your first task and start
            getting things done.
          </p>

        </div>
      )}

      {/* ================================================= */}
      {/* NO RESULTS */}
      {/* ================================================= */}

      {tasks.length > 0 &&
        filteredTasks.length === 0 && (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 text-center">

            <div className="mb-4 rounded-2xl bg-slate-800 p-5 text-slate-400">
              <FiSearch size={30} />
            </div>

            <h4 className="text-lg font-semibold text-white">
              No matching tasks
            </h4>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

          </div>
        )}

      {/* ================================================= */}
      {/* TASKS */}
      {/* ================================================= */}

      {filteredTasks.length > 0 && (
        <div className="space-y-4">

          {filteredTasks.map((task) => (

            <div
              key={task.id}
              className={`group rounded-2xl border p-5 transition ${
                task.completed
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-slate-800 bg-slate-900/60 hover:border-blue-500/30"
              }`}
            >

              <div className="flex items-start gap-4">

                {/* CHECKBOX */}

                <button
                  type="button"
                  onClick={() =>
                    toggleTask(task)
                  }
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

                {/* CONTENT */}

                <div className="min-w-0 flex-1">

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

                    {/* PRIORITY */}

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

                    {/* CATEGORY */}

                    <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                      {task.category}
                    </span>

                  </div>

                  {/* DESCRIPTION */}

                  {task.description && (
                    <p className="mt-2 text-sm text-slate-400">
                      {task.description}
                    </p>
                  )}

                  {/* DUE DATE */}

                  {task.due_date && (
                    <div 
                      className={`mt-3 flex items-center gap-2 text-xs ${
                        getDueDateStatus(task)?.className || "text-slate-500"
                      }`}
                    >
                      <FiClock size={14} />

                      <span className="font-medium">
                        {getDueDateStatus(task)?.label}
                      </span>

                      <span className="text-slate-600">•</span>

                      <span>
                        Due: {formatDueDate(task.due_date)}
                      </span>
                      
                    </div>
                  )}
                </div>

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() => {
                    console.log(
                      "Edit button clicked:",
                      task
                    );

                    if (onEditTask) {
                      onEditTask(task);
                    }
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                  title="Edit task"
                >
                  <FiEdit3 size={18} />
                </button>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    deleteTask(task.id)
                  }
                  className="rounded-lg p-2 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  title="Delete task"
                >
                  <FiTrash2 size={18} />
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default TaskList;