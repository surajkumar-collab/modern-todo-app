import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import TaskItem from "./TaskItem";
import FilterBar from "./FilterBar";
import EmptyState from "./EmptyState";
import ConfirmModal from "./ConfirmModal";

function TaskList({
  user,
  refreshKey = 0,
  onStatsChange,
  onEditTask,
  searchQuery = "",
  addToast,
}) {
  // =========================
  // STATES
  // =========================

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [priorityFilter, setPriorityFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("newest");

  const [taskToDelete, setTaskToDelete] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [togglingId, setTogglingId] =
    useState(null);

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
      // UPDATE STATS
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
      console.error("Fetch tasks error:", error);

      addToast?.(
        "Failed to load tasks",
        "error"
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

      setCategories(data || []);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      setCategories([]);

      addToast?.(
        "Failed to load categories",
        "error"
      );
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
  // GET NEXT RECURRENCE DATE
  // =========================

  const getNextRecurrenceDate = (
    dateString,
    recurrenceType
  ) => {
    if (
      !dateString ||
      recurrenceType === "none"
    ) {
      return null;
    }

    const [year, month, day] =
      dateString.split("-").map(Number);

    if (!year || !month || !day) {
      return null;
    }

    const currentDate = new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

    // DAILY
    if (recurrenceType === "daily") {
      currentDate.setUTCDate(
        currentDate.getUTCDate() + 1
      );
    }

    // WEEKLY
    if (recurrenceType === "weekly") {
      currentDate.setUTCDate(
        currentDate.getUTCDate() + 7
      );
    }

    // MONTHLY
    if (recurrenceType === "monthly") {
      const originalDay =
        currentDate.getUTCDate();

      const nextMonth =
        currentDate.getUTCMonth() + 1;

      const nextYear =
        currentDate.getUTCFullYear() +
        Math.floor(nextMonth / 12);

      const normalizedMonth =
        nextMonth % 12;

      const lastDayOfNextMonth =
        new Date(
          Date.UTC(
            nextYear,
            normalizedMonth + 1,
            0
          )
        ).getUTCDate();

      const safeDay = Math.min(
        originalDay,
        lastDayOfNextMonth
      );

      currentDate.setUTCFullYear(
        nextYear
      );

      currentDate.setUTCMonth(
        normalizedMonth
      );

      currentDate.setUTCDate(
        safeDay
      );
    }

    const nextYear =
      currentDate.getUTCFullYear();

    const nextMonth = String(
      currentDate.getUTCMonth() + 1
    ).padStart(2, "0");

    const nextDay = String(
      currentDate.getUTCDate()
    ).padStart(2, "0");

    return `${nextYear}-${nextMonth}-${nextDay}`;
  };

  // =========================
  // CREATE NEXT RECURRING TASK
  // =========================

  const createNextRecurringTask = async (
    task
  ) => {
    if (
      !task.recurrence_type ||
      task.recurrence_type === "none"
    ) {
      return null;
    }

    if (!task.due_date) {
      return null;
    }

    const nextDueDate =
      getNextRecurrenceDate(
        task.due_date,
        task.recurrence_type
      );

    if (!nextDueDate) {
      return null;
    }

    // =========================
    // CHECK END DATE
    // =========================

    if (
      task.recurrence_end_date &&
      nextDueDate >
        task.recurrence_end_date
    ) {
      return null;
    }

    // =========================
    // CREATE NEXT TASK
    // =========================

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: user.id,

          title: task.title,

          description:
            task.description || null,

          completed: false,

          priority:
            task.priority || "medium",

          category:
            task.category || "General",

          due_date: nextDueDate,

          recurrence_type:
            task.recurrence_type,

          recurrence_end_date:
            task.recurrence_end_date || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  // =========================
  // TOGGLE TASK
  // =========================

  const toggleTask = async (task) => {
    if (!user?.id) {
      addToast?.(
        "User session not found",
        "error"
      );

      return;
    }

    // Prevent double click
    if (togglingId === task.id) {
      return;
    }

    setTogglingId(task.id);

    try {
      const newCompletedState =
        !task.completed;

      // =========================
      // UPDATE CURRENT TASK
      // =========================

      const { data, error } =
        await supabase
          .from("tasks")
          .update({
            completed:
              newCompletedState,

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

      // =========================
      // UPDATE UI
      // =========================

      setTasks((prevTasks) =>
        prevTasks.map((item) =>
          item.id === task.id
            ? data
            : item
        )
      );

      // =========================
      // TASK COMPLETED
      // =========================

      if (data.completed) {
        // =========================
        // RECURRING TASK
        // =========================

        if (
          data.recurrence_type &&
          data.recurrence_type !== "none"
        ) {
          try {
            const nextTask =
              await createNextRecurringTask(
                data
              );

            if (nextTask) {
              setTasks((prevTasks) => [
                nextTask,
                ...prevTasks,
              ]);

              addToast?.(
                `Task completed 🎉 Next task scheduled for ${formatDueDate(
                  nextTask.due_date
                )}`,
                "success"
              );
            } else {
              addToast?.(
                "Task completed 🎉 Recurrence finished.",
                "success"
              );
            }
          } catch (recurrenceError) {
            console.error(
              "Create recurring task error:",
              recurrenceError
            );

            addToast?.(
              "Task completed, but next recurring task could not be created.",
              "error"
            );
          }
        } else {
          // =========================
          // NORMAL TASK
          // =========================

          addToast?.(
            "Task completed 🎉",
            "success"
          );
        }
      } else {
        // =========================
        // MARK ACTIVE
        // =========================

        addToast?.(
          "Task marked as active",
          "info"
        );
      }

      // =========================
      // REFRESH DATA + STATS
      // =========================

      await fetchTasks();
    } catch (error) {
      console.error(
        "Update task error:",
        error
      );

      addToast?.(
        "Failed to update task",
        "error"
      );
    } finally {
      setTogglingId(null);
    }
  };

  // =========================
  // DELETE CLICK
  // =========================

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
  };

  // =========================
  // CONFIRM DELETE
  // =========================

  const handleConfirmDelete = async () => {
    if (!taskToDelete?.id) {
      return;
    }

    if (!user?.id) {
      setTaskToDelete(null);

      addToast?.(
        "User session not found",
        "error"
      );

      return;
    }

    setDeletingId(taskToDelete.id);

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskToDelete.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Remove immediately from UI
      setTasks((prevTasks) =>
        prevTasks.filter(
          (task) =>
            task.id !== taskToDelete.id
        )
      );

      const deletedTitle =
        taskToDelete.title;

      setTaskToDelete(null);

      addToast?.(
        `"${deletedTitle}" deleted successfully`,
        "success"
      );

      // Refresh stats
      await fetchTasks();
    } catch (error) {
      console.error(
        "Delete task error:",
        error
      );

      addToast?.(
        "Failed to delete task",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // DUE DATE STATUS
  // =========================

  const getDueDateStatus = (task) => {
    if (
      !task.due_date ||
      task.completed
    ) {
      return null;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(
      `${task.due_date}T00:00:00`
    );

    dueDate.setHours(0, 0, 0, 0);

    const diffTime =
      dueDate.getTime() -
      today.getTime();

    const diffDays = Math.round(
      diffTime /
        (1000 * 60 * 60 * 24)
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

  // =========================
  // FORMAT DATE
  // =========================

  const formatDueDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const [year, month, day] =
      dateString.split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
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
        searchQuery
          .toLowerCase()
          .trim();

      const matchesSearch =
        !search ||
        task.title
          ?.toLowerCase()
          .includes(search) ||
        task.description
          ?.toLowerCase()
          .includes(search) ||
        task.category
          ?.toLowerCase()
          .includes(search);

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const matchesToday =
        statusFilter === "today" &&
        task.due_date &&
        !task.completed &&
        new Date(
          `${task.due_date}T00:00:00`
        ).getTime() === today.getTime();

      const matchesOverdue =
        statusFilter === "overdue" &&
        task.due_date &&
        !task.completed &&
        new Date(
          `${task.due_date}T00:00:00`
        ) < today;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          !task.completed) ||
        (statusFilter === "completed" &&
          task.completed) ||
        matchesToday ||
        matchesOverdue;
      const matchesCategory =
        categoryFilter === "all" ||
        task.category === categoryFilter;

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
      // =========================
      // NEWEST
      // =========================

      if (sortBy === "newest") {
        return (
          new Date(b.created_at) -
          new Date(a.created_at)
        );
      }

      // =========================
      // OLDEST
      // =========================

      if (sortBy === "oldest") {
        return (
          new Date(a.created_at) -
          new Date(b.created_at)
        );
      }

      // =========================
      // PRIORITY
      // =========================

      if (sortBy === "priority") {
        const priorityOrder = {
          high: 1,
          medium: 2,
          low: 3,
        };

        return (
          (priorityOrder[a.priority] || 99) -
          (priorityOrder[b.priority] || 99)
        );
      }

      // =========================
      // DUE DATE
      // =========================

      if (sortBy === "dueDate") {
        if (!a.due_date) {
          return 1;
        }

        if (!b.due_date) {
          return -1;
        }

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

      <FilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        categoriesLoading={categoriesLoading}
        taskCount={filteredTasks.length}
      />

      {/* NO TASKS */}

      {tasks.length === 0 && (
        <EmptyState type="tasks" />
      )}

      {/* SEARCH / FILTER EMPTY */}

      {tasks.length > 0 &&
        filteredTasks.length === 0 && (
          <EmptyState type="search" />
        )}

      {/* TASKS */}

      {filteredTasks.length > 0 && (
        <div className="space-y-4">

          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onEdit={onEditTask}
              onDelete={handleDeleteClick}
              formatDueDate={formatDueDate}
              getDueDateStatus={
                getDueDateStatus
              }
            />
          ))}

        </div>
      )}

      {/* ========================= */}
      {/* CONFIRM DELETE MODAL */}
      {/* ========================= */}

      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task?"
        message={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.title}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={
          deletingId ===
          taskToDelete?.id
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deletingId) {
            setTaskToDelete(null);
          }
        }}
      />

    </div>
  );
}

export default TaskList;