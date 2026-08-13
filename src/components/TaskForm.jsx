import { useEffect, useState } from "react";
import {
  FiX,
  FiCalendar,
  FiPlus,
  FiEdit3,
  FiRepeat,
} from "react-icons/fi";
import { supabase } from "../supabaseClient";

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

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
  // RECURRENCE STATES
  // =========================

  const [recurrenceType, setRecurrenceType] =
    useState("none");

  const [recurrenceEndDate, setRecurrenceEndDate] =
    useState("");

  // =========================
  // CATEGORY STATES
  // =========================

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  // =========================
  // OTHER STATES
  // =========================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // TODAY'S DATE
  // =========================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

      const fetchedCategories = data || [];

      // Always keep General available
      const hasGeneral =
        fetchedCategories.some(
          (item) =>
            item.name?.toLowerCase() ===
            "general"
        );

      let finalCategories =
        fetchedCategories;

      if (!hasGeneral) {
        finalCategories = [
          {
            id: "default-general",
            name: "General",
          },
          ...fetchedCategories,
        ];
      }

      // Editing task with existing category
      if (task?.category) {
        const existingCategory =
          finalCategories.find(
            (item) =>
              item.name === task.category
          );

        if (existingCategory) {
          setCategories(
            finalCategories
          );

          setCategory(
            task.category
          );
        } else {
          // Keep old category visible
          // even if deleted later
          setCategories([
            {
              id: "current-task-category",
              name: task.category,
            },
            ...finalCategories,
          ]);

          setCategory(
            task.category
          );
        }
      } else {
        setCategories(
          finalCategories
        );

        setCategory(
          finalCategories.length > 0
            ? finalCategories[0].name
            : "General"
        );
      }
    } catch (err) {
      console.error(
        "Fetch categories error:",
        err
      );

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
  // LOAD TASK
  // =========================

  useEffect(() => {
    if (task) {
      setTitle(
        task.title || ""
      );

      setDescription(
        task.description || ""
      );

      setCategory(
        task.category || "General"
      );

      setPriority(
        task.priority || "medium"
      );

      setDueDate(
        task.due_date || ""
      );

      setRecurrenceType(
        task.recurrence_type || "none"
      );

      setRecurrenceEndDate(
        task.recurrence_end_date || ""
      );
    } else {
      setTitle("");
      setDescription("");
      setCategory("General");
      setPriority("medium");
      setDueDate("");

      setRecurrenceType(
        "none"
      );

      setRecurrenceEndDate("");
    }

    setError("");
  }, [task]);

  // =========================
  // LOAD CATEGORIES
  // =========================

  useEffect(() => {
    fetchCategories();
  }, [user?.id, task?.id]);

  // =========================
  // TITLE CHANGE
  // =========================

  const handleTitleChange = (e) => {
    const value = e.target.value;

    if (
      value.length <=
      TITLE_MAX_LENGTH
    ) {
      setTitle(value);
      setError("");
    }
  };

  // =========================
  // DESCRIPTION CHANGE
  // =========================

  const handleDescriptionChange = (
    e
  ) => {
    const value = e.target.value;

    if (
      value.length <=
      DESCRIPTION_MAX_LENGTH
    ) {
      setDescription(value);
      setError("");
    }
  };

  // =========================
  // DUE DATE CHANGE
  // =========================

  const handleDueDateChange = (
    e
  ) => {
    setDueDate(e.target.value);
    setError("");
  };

  // =========================
  // RECURRENCE CHANGE
  // =========================

  const handleRecurrenceChange = (
    e
  ) => {
    const value = e.target.value;

    setRecurrenceType(value);
    setError("");

    // Clear end date when recurrence
    // is disabled
    if (value === "none") {
      setRecurrenceEndDate("");
    }
  };

  // =========================
  // RECURRENCE END DATE
  // =========================

  const handleRecurrenceEndDateChange = (
    e
  ) => {
    setRecurrenceEndDate(
      e.target.value
    );
    setError("");
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const trimmedTitle =
      title.trim();

    const trimmedDescription =
      description.trim();

    // =========================
    // TITLE VALIDATION
    // =========================

    if (!trimmedTitle) {
      setError(
        "Please enter a task title."
      );
      return;
    }

    if (trimmedTitle.length < 2) {
      setError(
        "Task title must contain at least 2 characters."
      );
      return;
    }

    if (
      trimmedTitle.length >
      TITLE_MAX_LENGTH
    ) {
      setError(
        `Task title cannot exceed ${TITLE_MAX_LENGTH} characters.`
      );
      return;
    }

    // =========================
    // DESCRIPTION VALIDATION
    // =========================

    if (
      trimmedDescription.length >
      DESCRIPTION_MAX_LENGTH
    ) {
      setError(
        `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters.`
      );
      return;
    }

    // =========================
    // USER VALIDATION
    // =========================

    if (!user?.id) {
      setError(
        "User session not found. Please login again."
      );
      return;
    }

    // =========================
    // CATEGORY VALIDATION
    // =========================

    if (!category) {
      setError(
        "Please select a category."
      );
      return;
    }

    // =========================
    // DUE DATE VALIDATION
    // =========================

    if (dueDate) {
      const today = getTodayDate();

      if (dueDate < today) {
        setError(
          "Due date cannot be in the past."
        );
        return;
      }
    }

    // =========================
    // RECURRENCE VALIDATION
    // =========================

    if (
      recurrenceType !== "none" &&
      !dueDate
    ) {
      setError(
        "Please select a due date for a recurring task."
      );
      return;
    }

    if (
      recurrenceType !== "none" &&
      recurrenceEndDate
    ) {
      if (
        recurrenceEndDate <
        dueDate
      ) {
        setError(
          "Repeat until date cannot be before the due date."
        );
        return;
      }
    }

    // =========================
    // SUBMIT
    // =========================

    setLoading(true);

    try {
      // =========================
      // EDIT TASK
      // =========================

      if (isEditing) {
        const { data, error } =
          await supabase
            .from("tasks")
            .update({
              title: trimmedTitle,

              description:
                trimmedDescription ||
                null,

              category,

              priority,

              due_date:
                dueDate || null,

              recurrence_type:
                recurrenceType,

              recurrence_end_date:
                recurrenceType !==
                "none"
                  ? recurrenceEndDate ||
                    null
                  : null,

              updated_at:
                new Date().toISOString(),
            })
            .eq("id", task.id)
            .eq(
              "user_id",
              user.id
            )
            .select()
            .single();

        if (error) {
          throw error;
        }

        if (onTaskUpdated) {
          onTaskUpdated(data);
        }

        return;
      }

      // =========================
      // CREATE TASK
      // =========================

      const { data, error } =
        await supabase
          .from("tasks")
          .insert([
            {
              user_id: user.id,

              title: trimmedTitle,

              description:
                trimmedDescription ||
                null,

              category,

              priority,

              due_date:
                dueDate || null,

              recurrence_type:
                recurrenceType,

              recurrence_end_date:
                recurrenceType !==
                "none"
                  ? recurrenceEndDate ||
                    null
                  : null,
            },
          ])
          .select()
          .single();

      if (error) {
        throw error;
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm">

      <div className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-6 flex items-start justify-between gap-4">

          <div className="min-w-0">

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
            disabled={loading}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            title="Close"
          >
            <FiX size={22} />
          </button>

        </div>

        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-400">
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

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-medium text-slate-300">
                Task Title
              </label>

              <span
                className={`text-xs ${
                  title.length >=
                  TITLE_MAX_LENGTH
                    ? "text-red-400"
                    : "text-slate-500"
                }`}
              >
                {title.length}/
                {TITLE_MAX_LENGTH}
              </span>

            </div>

            <input
              type="text"
              value={title}
              onChange={
                handleTitleChange
              }
              placeholder="e.g. Complete React project"
              maxLength={
                TITLE_MAX_LENGTH
              }
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              autoFocus
            />

          </div>

          {/* ========================= */}
          {/* DESCRIPTION */}
          {/* ========================= */}

          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-medium text-slate-300">
                Description
              </label>

              <span
                className={`text-xs ${
                  description.length >=
                  DESCRIPTION_MAX_LENGTH
                    ? "text-red-400"
                    : "text-slate-500"
                }`}
              >
                {description.length}/
                {DESCRIPTION_MAX_LENGTH}
              </span>

            </div>

            <textarea
              value={description}
              onChange={
                handleDescriptionChange
              }
              placeholder="Add some details about your task..."
              rows={3}
              maxLength={
                DESCRIPTION_MAX_LENGTH
              }
              disabled={loading}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                  setCategory(
                    e.target.value
                  )
                }
                disabled={
                  categoriesLoading ||
                  loading
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {categories.length ===
                0 ? (
                  <option value="General">
                    General
                  </option>
                ) : (
                  categories.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.name}
                      >
                        {item.name}
                      </option>
                    )
                  )
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
                  setPriority(
                    e.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
                min={getTodayDate()}
                onChange={
                  handleDueDateChange
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-3 pl-11 pr-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

            </div>

            <p className="mt-1 text-xs text-slate-500">
              You can choose today or a
              future date.
            </p>

          </div>

          {/* ========================= */}
          {/* RECURRENCE */}
          {/* ========================= */}

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">

            <div className="mb-3 flex items-center gap-2">

              <FiRepeat
                size={18}
                className="text-blue-400"
              />

              <label className="text-sm font-medium text-slate-300">
                Recurrence
              </label>

            </div>

            <select
              value={recurrenceType}
              onChange={
                handleRecurrenceChange
              }
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <option value="none">
                Does not repeat
              </option>

              <option value="daily">
                Daily
              </option>

              <option value="weekly">
                Weekly
              </option>

              <option value="monthly">
                Monthly
              </option>

            </select>

            {recurrenceType !==
              "none" && (
              <div className="mt-4">

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Repeat Until
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    (optional)
                  </span>
                </label>

                <div className="relative">

                  <FiCalendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />

                  <input
                    type="date"
                    value={
                      recurrenceEndDate
                    }
                    min={
                      dueDate ||
                      getTodayDate()
                    }
                    onChange={
                      handleRecurrenceEndDateChange
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-3 pl-11 pr-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  The task will repeat{" "}
                  {recurrenceType ===
                  "daily"
                    ? "every day"
                    : recurrenceType ===
                      "weekly"
                    ? "every week"
                    : "every month"}
                  .
                </p>

              </div>
            )}

          </div>

          {/* ========================= */}
          {/* BUTTONS */}
          {/* ========================= */}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                categoriesLoading ||
                !title.trim()
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