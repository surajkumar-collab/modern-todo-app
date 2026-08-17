import { supabase } from "../supabaseClient";

// =========================================================
// CREATE NOTIFICATION
// =========================================================

export async function createNotification({
  userId,
  taskId = null,
  type,
  title,
  message = null,
}) {
  if (
    !userId ||
    !type ||
    !title
  ) {
    console.warn(
      "Notification data incomplete."
    );

    return null;
  }

  try {
    // =======================================================
    // DUPLICATE CHECK
    // =======================================================

    let query = supabase
      .from("notifications")
      .select("*")
      .eq(
        "user_id",
        userId
      )
      .eq(
        "type",
        type
      )
      .eq(
        "title",
        title
      );

    // Task notifications are linked
    // to a specific task.

    if (taskId) {
      query = query.eq(
        "task_id",
        taskId
      );
    } else {
      query = query.is(
        "task_id",
        null
      );
    }

    const {
      data: existing,
      error: checkError,
    } = await query
      .limit(1);

    if (checkError) {
      throw checkError;
    }

    // =======================================================
    // ALREADY EXISTS
    // =======================================================

    if (
      existing &&
      existing.length > 0
    ) {
      return existing[0];
    }

    // =======================================================
    // CREATE
    // =======================================================

    const {
      data,
      error,
    } = await supabase
      .from("notifications")
      .insert([
        {
          user_id:
            userId,

          task_id:
            taskId,

          type,

          title,

          message,

          is_read: false,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    return null;
  }
}

// =========================================================
// CREATE TASK DATE NOTIFICATION
// =========================================================

export async function createTaskDateNotification({
  userId,
  task,
  type,
  title,
  message,
}) {
  if (
    !userId ||
    !task?.id
  ) {
    return null;
  }

  const allowedTypes = [
    "task_upcoming",
    "task_due_today",
    "task_overdue",
  ];

  if (
    !allowedTypes.includes(
      type
    )
  ) {
    console.warn(
      "Invalid task date notification type:",
      type
    );

    return null;
  }

  return createNotification({
    userId,
    taskId: task.id,
    type,
    title,
    message,
  });
}

// =========================================================
// CHECK SINGLE TASK DATE
// =========================================================

export async function checkTaskDateNotification({
  userId,
  task,
}) {
  if (
    !userId ||
    !task?.id ||
    task.completed ||
    !task.due_date
  ) {
    return null;
  }

  // =======================================================
  // TODAY
  // =======================================================

  const now =
    new Date();

  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

  // =======================================================
  // DUE DATE
  // =======================================================

  const dueDate =
    new Date(
      `${task.due_date}T00:00:00`
    );

  dueDate.setHours(
    0,
    0,
    0,
    0
  );

  // =======================================================
  // DIFFERENCE
  // =======================================================

  const diffTime =
    dueDate.getTime() -
    today.getTime();

  const diffDays =
    Math.round(
      diffTime /
        (1000 *
          60 *
          60 *
          24)
    );

  // =======================================================
  // OVERDUE
  // =======================================================

  if (
    diffDays < 0
  ) {
    return createTaskDateNotification({
      userId,

      task,

      type:
        "task_overdue",

      title:
        "Task overdue",

      message:
        `"${task.title}" was due on ${formatNotificationDate(
          task.due_date
        )}.`,
    });
  }

  // =======================================================
  // DUE TODAY
  // =======================================================

  if (
    diffDays === 0
  ) {
    return createTaskDateNotification({
      userId,

      task,

      type:
        "task_due_today",

      title:
        "Task due today",

      message:
        `"${task.title}" is due today.`,
    });
  }

  // =======================================================
  // UPCOMING
  // =======================================================

  if (
    diffDays >= 1 &&
    diffDays <= 7
  ) {
    return createTaskDateNotification({
      userId,

      task,

      type:
        "task_upcoming",

      title:
        "Upcoming task",

      message:
        `"${task.title}" is due in ${diffDays} ${
          diffDays === 1
            ? "day"
            : "days"
        }.`,
    });
  }

  return null;
}

// =========================================================
// CHECK ALL TASKS
// =========================================================

export async function checkTasksForNotifications({
  userId,
  tasks = [],
}) {
  if (
    !userId ||
    !Array.isArray(tasks)
  ) {
    return [];
  }

  const results = [];

  for (
    const task of tasks
  ) {
    if (
      task.completed ||
      !task.due_date
    ) {
      continue;
    }

    try {
      const notification =
        await checkTaskDateNotification({
          userId,
          task,
        });

      if (
        notification
      ) {
        results.push(
          notification
        );
      }
    } catch (error) {
      console.error(
        `Notification check failed for task ${task.id}:`,
        error
      );
    }
  }

  return results;
}

// =========================================================
// FORMAT DATE
// =========================================================

function formatNotificationDate(
  dateString
) {
  if (!dateString) {
    return "";
  }

  const [
    year,
    month,
    day,
  ] =
    dateString.split(
      "-"
    );

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}