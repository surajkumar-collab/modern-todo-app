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
    if (!dateString) {
      return null;
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

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

    const completedToday =
      completedTasks.filter((task) => {
        if (!task.updated_at) {
          return false;
        }

        const completedDate =
          getStartOfDay(
            new Date(task.updated_at)
          );

        return (
          completedDate.getTime() ===
          today.getTime()
        );
      }).length;

    // =========================================
    // START OF WEEK
    // =========================================

    const startOfWeek = new Date(today);

    const dayOfWeek =
      startOfWeek.getDay();

    startOfWeek.setDate(
      startOfWeek.getDate() -
        dayOfWeek
    );

    // =========================================
    // COMPLETED THIS WEEK
    // =========================================

    const completedThisWeek =
      completedTasks.filter((task) => {
        if (!task.updated_at) {
          return false;
        }

        const completedDate =
          new Date(task.updated_at);

        return (
          completedDate >=
            startOfWeek &&
          completedDate <= new Date()
        );
      }).length;

    // =========================================
    // OVERDUE
    // =========================================

    const overdue = tasks.filter(
      (task) => {
        if (
          task.completed ||
          !task.due_date
        ) {
          return false;
        }

        const dueDate = getDateOnly(
          task.due_date
        );

        return (
          dueDate &&
          dueDate < today
        );
      }
    ).length;

    // =========================================
    // COMPLETION RATE
    // =========================================

    const completionRate =
      total === 0
        ? 0
        : Math.round(
            (completed / total) * 100
          );

    // =========================================
    // WEEKLY DATA
    // =========================================

    const weekDays = [
      {
        key: 0,
        name: "Sun",
      },
      {
        key: 1,
        name: "Mon",
      },
      {
        key: 2,
        name: "Tue",
      },
      {
        key: 3,
        name: "Wed",
      },
      {
        key: 4,
        name: "Thu",
      },
      {
        key: 5,
        name: "Fri",
      },
      {
        key: 6,
        name: "Sat",
      },
    ];

    const weeklyData =
      weekDays.map((day) => {
        const count =
          completedTasks.filter(
            (task) => {
              if (!task.updated_at) {
                return false;
              }

              const completedDate =
                new Date(
                  task.updated_at
                );

              return (
                completedDate >=
                  startOfWeek &&
                completedDate.getDay() ===
                  day.key
              );
            }
          ).length;

        return {
          ...day,
          count,
        };
      });

    const maxWeeklyCount =
      Math.max(
        ...weeklyData.map(
          (day) => day.count
        ),
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
    };
  }, [tasks]);

  // =========================================
  // STAT CARDS
  // =========================================

  const cards = [
    {
      title: "Completion Rate",
      value: `${analytics.completionRate}%`,
      description:
        "Overall task completion",
      icon: <FiTarget size={20} />,
      iconClass:
        "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Completed Today",
      value: analytics.completedToday,
      description:
        "Tasks finished today",
      icon: <FiCheckCircle size={20} />,
      iconClass:
        "bg-green-500/10 text-green-400",
    },
    {
      title: "This Week",
      value:
        analytics.completedThisWeek,
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

            <div className="flex items-center justify-between">

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                {card.icon}
              </div>

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

        {/* HEADER */}

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

        {/* CHART */}

        <div className="mt-8">

          <div className="flex h-56 items-end justify-between gap-2 sm:gap-4">

            {analytics.weeklyData.map(
              (day) => {
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

                    {/* COUNT */}

                    <span className="mb-2 text-xs font-semibold text-slate-400">
                      {day.count}
                    </span>

                    {/* BAR */}

                    <div className="flex h-40 w-full max-w-12 items-end justify-center">

                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500"
                        style={{
                          height: `${height}%`,
                          minHeight:
                            "6px",
                        }}
                      />

                    </div>

                    {/* DAY */}

                    <span className="mt-3 text-xs font-medium text-slate-500">
                      {day.name}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>

    </section>
  );
}

export default Analytics;