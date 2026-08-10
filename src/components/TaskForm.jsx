import { useEffect, useState } from "react";
import {
  FiX,
  FiCalendar,
  FiPlus,
  FiEdit3,
} from "react-icons/fi";
import { supabase } from "../supabaseClient";

function TaskForm({
  user,
  task = null,
  onTaskCreated,
  onTaskUpdated,
  onClose,
}) {
  const isEditing = Boolean(task);

  // =========================
  // TASK STATES
  // =========================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  // =========================
  // CATEGORY STATES
  // =========================

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // =========================
  // OTHER STATES
  // =========================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const fetchedCategories = data || [];

      // Always keep General available
      const hasGeneral = fetchedCategories.some(
        (item) =>
          item.name?.toLowerCase() === "general"
      );

      let finalCategories = fetchedCategories;

      if (!hasGeneral) {
        finalCategories = [
          {
            id: "default-general",
            name: "General",
          },
          ...fetchedCategories,
        ];
      }

      setCategories(finalCategories);

      // If editing, keep the existing task category
      if (task?.category) {
        const existingCategory =
          finalCategories.find(
            (item) =>
              item.name === task.category
          );

        if (existingCategory) {
          setCategory(task.category);
        } else {
          // Keep old category visible even if
          // it no longer exists in categories table
          setCategories((prev) => [
            {
              id: "current-task-category",
              name: task.category,
            },
            ...prev,
          ]);

          setCategory(task.category);
        }
      } else if (finalCategories.length > 0) {
        setCategory(finalCategories[0].name);
      } else {
        setCategory("General");
      }
    } catch (err) {
      console.error(
        "Fetch categories error:",
        err
      );

      // Fallback
      setCategories([
        {
          id: "default-general",
          name: "General",
        },
      ]);

      setCategory(
        task?.category || "General"
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  // =========================
  // LOAD TASK + CATEGORIES
  // =========================

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setCategory(task.category || "General");
      setPriority(task.priority || "medium");
      setDueDate(task.due_date || "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("General");
      setPriority("medium");
      setDueDate("");
    }
  }, [task]);

  useEffect(() => {
    fetchCategories();
  }, [user?.id, task?.id]);

  // =========================
  // SUBMIT TASK
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Validate title
    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    // Validate user
    if (!user?.id) {
      setError(
        "User session not found. Please login again."
      );
      return;
    }

    // Validate category
    if (!category) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // EDIT TASK
      // =========================

      if (isEditing) {
        const { data, error } = await supabase
          .from("tasks")
          .update({
            title: title.trim(),
            description:
              description.trim() || null,
            category,
            priority,
            due_date: dueDate || null,
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

        console.log(
          "Task updated successfully:",
          data
        );

        if (onTaskUpdated) {
          onTaskUpdated(data);
        }

        return;
      }

      // =========================
      // CREATE TASK
      // =========================

      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description:
              description.trim() || null,
            category,
            priority,
            due_date: dueDate || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(
        "Task created successfully:",
        data
      );

      if (onTaskCreated) {
        onTaskCreated(data);
      }
    } catch (err) {
      console.error(
        "Task save error:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while saving the task."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-bold text-white">
              {isEditing
                ? "Edit Task"
                : "Add New Task"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {isEditing
                ? "Update your task details."
                : "Create a task and stay productive."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <FiX size={22} />
          </button>

        </div>

        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ========================= */}
        {/* FORM */}
        {/* ========================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* ========================= */}
          {/* TITLE */}
          {/* ========================= */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Task Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Complete React project"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />

          </div>

          {/* ========================= */}
          {/* DESCRIPTION */}
          {/* ========================= */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Add some details about your task..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

          </div>

          {/* ========================= */}
          {/* CATEGORY + PRIORITY */}
          {/* ========================= */}

          <div className="grid gap-4 sm:grid-cols-2">

            {/* CATEGORY */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                disabled={categoriesLoading}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {categories.length === 0 ? (
                  <option value="General">
                    General
                  </option>
                ) : (
                  categories.map((item) => (
                    <option
                      key={item.id}
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  ))
                )}

              </select>

              {categoriesLoading && (
                <p className="mt-1 text-xs text-slate-500">
                  Loading categories...
                </p>
              )}

            </div>

            {/* PRIORITY */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >

                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

              </select>

            </div>

          </div>

          {/* ========================= */}
          {/* DUE DATE */}
          {/* ========================= */}

          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Due Date
            </label>

            <div className="relative">

              <FiCalendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(e.target.value)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-3 pl-11 pr-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

          </div>

          {/* ========================= */}
          {/* BUTTONS */}
          {/* ========================= */}

          <div className="flex gap-3 pt-2">

            {/* CANCEL */}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>

            {/* SAVE / ADD */}

            <button
              type="submit"
              disabled={
                loading ||
                categoriesLoading
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {isEditing ? (
                <FiEdit3 size={18} />
              ) : (
                <FiPlus size={18} />
              )}

              {loading
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Add Task"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default TaskForm;