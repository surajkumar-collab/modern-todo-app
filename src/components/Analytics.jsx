import { useMemo } from "react";

import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiTarget,
} from "react-icons/fi";

function Analytics({ tasks = [] }) {
  // =========================================
  // DATE HELPERS
  // =========================================

  const getStartOfDay = (date = new Date()) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const getDateOnly = (dateString) => {
    if (!dateString) return null;

    const date = new Date(`${dateString}T00:00:00`);
    date.setHours(0, 0, 0, 0);

    return date;
  };

  // =========================================
  // ANALYTICS DATA
  // =========================================

  const analytics = useMemo(() => {
    const today = getStartOfDay();

    const total = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.completed
    );

    const completed = completedTasks.length;

    // =========================================
    // COMPLETED TODAY
    // =========================================

    const completedToday = completedTasks.filter((task) => {
      if (!task.updated_at) return false;

      const completedDate = getStartOfDay(
        new Date(task.updated_at)
      );

      return (
        completedDate.getTime() === today.getTime()
      );
    }).length;

    // =========================================
    // START OF WEEK
    // =========================================

    const startOfWeek = new Date(today);

    const dayOfWeek = startOfWeek.getDay();

    startOfWeek.setDate(
      startOfWeek.getDate() - dayOfWeek
    );

    // =========================================
    // COMPLETED THIS WEEK
    // =========================================

    const completedThisWeek = completedTasks.filter(
      (task) => {
        if (!task.updated_at) return false;

        const completedDate = new Date(
          task.updated_at
        );

        return (
          completedDate >= startOfWeek &&
          completedDate <= new Date()
        );
      }
    ).length;

    // =========================================
    // OVERDUE
    // =========================================

    const overdue = tasks.filter((task) => {
      if (task.completed || !task.due_date) {
        return false;
      }

      const dueDate = getDateOnly(task.due_date);

      return dueDate && dueDate < today;
    }).length;

    // =========================================
    // COMPLETION RATE
    // =========================================

    const completionRate =
      total === 0
        ? 0
        : Math.round((completed / total) * 100);

    // =========================================
    // WEEKLY DATA
    // =========================================

    const weekDays = [
      { key: 0, name: "Sun" },
      { key: 1, name: "Mon" },
      { key: 2, name: "Tue" },
      { key: 3, name: "Wed" },
      { key: 4, name: "Thu" },
      { key: 5, name: "Fri" },
      { key: 6, name: "Sat" },
    ];

    const weeklyData = weekDays.map((day) => {
      const count = completedTasks.filter((task) => {
        if (!task.updated_at) return false;

        const completedDate = new Date(
          task.updated_at
        );

        return (
          completedDate >= startOfWeek &&
          completedDate.getDay() === day.key
        );
      }).length;

      return {
        ...day,
        count,
      };
    });

    const maxWeeklyCount = Math.max(
      ...weeklyData.map((day) => day.count),
      1
    );

    // =========================================
    // PRIORITY BREAKDOWN
    // =========================================

    const priorityData = [
      {
        name: "High",
        key: "high",
        count: tasks.filter(
          (task) =>
            String(task.priority || "").toLowerCase() ===
            "high"
        ).length,
        bar:
          "bg-gradient-to-r from-red-500 to-rose-400",
      },
      {
        name: "Medium",
        key: "medium",
        count: tasks.filter(
          (task) =>
            String(task.priority || "").toLowerCase() ===
            "medium"
        ).length,
        bar:
          "bg-gradient-to-r from-yellow-500 to-amber-400",
      },
      {
        name: "Low",
        key: "low",
        count: tasks.filter(
          (task) =>
            String(task.priority || "").toLowerCase() ===
            "low"
        ).length,
        bar:
          "bg-gradient-to-r from-green-500 to-emerald-400",
      },
    ];

    const maxPriorityCount = Math.max(
      ...priorityData.map((item) => item.count),
      1
    );

    // =========================================
    // CATEGORY BREAKDOWN
    // =========================================

    const categoryMap = {};

    tasks.forEach((task) => {
      let categoryName =
        task.category_name ||
        task.category ||
        task.categories?.name ||
        "General";

      if (
        typeof categoryName === "object" &&
        categoryName !== null
      ) {
        categoryName =
          categoryName.name || "General";
      }

      categoryName = String(categoryName);

      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = 0;
      }

      categoryMap[categoryName]++;
    });

    const categoryData = Object.entries(
      categoryMap
    )
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const maxCategoryCount = Math.max(
      ...categoryData.map((item) => item.count),
      1
    );

    return {
      total,
      completed,
      completedToday,
      completedThisWeek,
      overdue,
      completionRate,
      weeklyData,
      maxWeeklyCount,
      priorityData,
      maxPriorityCount,
      categoryData,
      maxCategoryCount,
    };
  }, [tasks]);

  // =========================================
  // STAT CARDS
  // =========================================

  const cards = [
    {
      title: "Completion Rate",
      value: `${analytics.completionRate}%`,
      description: "Overall task completion",
      icon: <FiTarget size={20} />,
      iconClass:
        "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Completed Today",
      value: analytics.completedToday,
      description: "Tasks finished today",
      icon: <FiCheckCircle size={20} />,
      iconClass:
        "bg-green-500/10 text-green-400",
    },
    {
      title: "This Week",
      value: analytics.completedThisWeek,
      description:
        "Tasks completed this week",
      icon: <FiActivity size={20} />,
      iconClass:
        "bg-cyan-500/10 text-cyan-400",
    },
    {
      title: "Overdue",
      value: analytics.overdue,
      description:
        "Active overdue tasks",
      icon: <FiAlertCircle size={20} />,
      iconClass:
        "bg-red-500/10 text-red-400",
    },
  ];

  // =========================================
  // UI
  // =========================================

  return (
    <section className="mt-8 sm:mt-10">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="mb-5">
        <p className="text-sm font-medium text-blue-400">
          PRODUCTIVITY
        </p>

        <h3 className="mt-1 text-xl font-bold text-white">
          Analytics
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Understand your productivity at a glance.
        </p>
      </div>

      {/* ===================================== */}
      {/* STAT CARDS */}
      {/* ===================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:bg-slate-900"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
            >
              {card.icon}
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              {card.title}
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {card.value}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              {card.description}
            </p>
          </div>
        ))}

      </div>

      {/* ===================================== */}
      {/* WEEKLY PRODUCTIVITY */}
      {/* ===================================== */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h4 className="text-lg font-bold text-white">
              Weekly Productivity
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Tasks completed during this week.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-sm text-slate-400">
            {analytics.completedThisWeek} completed
          </div>

        </div>

        <div className="mt-8">

          <div className="flex h-56 items-end justify-between gap-2 sm:gap-4">

            {analytics.weeklyData.map((day) => {

              const height =
                day.count === 0
                  ? 6
                  : Math.max(
                      (day.count /
                        analytics.maxWeeklyCount) *
                        100,
                      12
                    );

              return (
                <div
                  key={day.name}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >

                  <span className="mb-2 text-xs font-semibold text-slate-400">
                    {day.count}
                  </span>

                  <div className="flex h-40 w-full max-w-12 items-end justify-center">

                    <div
                      className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        minHeight: "6px",
                      }}
                    />

                  </div>

                  <span className="mt-3 text-xs font-medium text-slate-500">
                    {day.name}
                  </span>

                </div>
              );
            })}

          </div>

        </div>
      </div>

      {/* ===================================== */}
      {/* PRIORITY + CATEGORY */}
      {/* ===================================== */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* =================================== */}
        {/* PRIORITY BREAKDOWN */}
        {/* =================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

          <div className="mb-6">

            <h4 className="text-lg font-bold text-white">
              Priority Breakdown
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              See how your tasks are distributed.
            </p>

          </div>

          <div className="space-y-5">

            {analytics.priorityData.map(
              (item) => {

                const width =
                  item.count === 0
                    ? 0
                    : Math.max(
                        (item.count /
                          analytics.maxPriorityCount) *
                          100,
                        8
                      );

                return (
                  <div key={item.key}>

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-sm font-medium text-slate-300">
                        {item.name}
                      </span>

                      <span className="text-sm font-semibold text-slate-400">
                        {item.count}
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.bar}`}
                        style={{
                          width: `${width}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* =================================== */}
        {/* CATEGORY BREAKDOWN */}
        {/* =================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

          <div className="mb-6">

            <h4 className="text-lg font-bold text-white">
              Category Breakdown
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              See where your tasks are focused.
            </p>

          </div>

          {analytics.categoryData.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
              No category data available.
            </div>
          ) : (
            <div className="max-h-64 space-y-5 overflow-y-auto pr-1">

              {analytics.categoryData.map(
                (item) => {

                  const width =
                    item.count === 0
                      ? 0
                      : Math.max(
                          (item.count /
                            analytics.maxCategoryCount) *
                            100,
                          8
                        );

                  return (
                    <div key={item.name}>

                      <div className="mb-2 flex items-center justify-between">

                        <span className="max-w-[75%] truncate text-sm font-medium text-slate-300">
                          {item.name}
                        </span>

                        <span className="text-sm font-semibold text-slate-400">
                          {item.count}
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
                          style={{
                            width: `${width}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>

    </section>
  );
}

export default Analytics;