import { useMemo, useState } from "react";

import {
  FiActivity,
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

function Analytics({ tasks = [] }) {
  // =====================================================
  // SAFE DATA
  // =====================================================

  const safeTasks = Array.isArray(tasks)
    ? tasks
    : [];

  // =====================================================
  // PERIOD
  // =====================================================

  const [period, setPeriod] =
    useState("7");

  // =====================================================
  // DATE HELPERS
  // =====================================================

  const getStartOfDay = (
    date = new Date()
  ) => {
    const result = new Date(date);

    if (Number.isNaN(result.getTime())) {
      return null;
    }

    result.setHours(
      0,
      0,
      0,
      0
    );

    return result;
  };

  const getDateOnly = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(
      `${value}T00:00:00`
    );

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  };

  const getValidDate = (value) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  // =====================================================
  // ANALYTICS DATA
  // =====================================================

  const analytics = useMemo(() => {
    const today =
      getStartOfDay();

    if (!today) {
      return {
        total: 0,
        completed: 0,
        active: 0,
        overdue: 0,
        completionRate: 0,
        completedToday: 0,
        periodCompleted: 0,
        chartData: [],
        maxChartCount: 1,
        priorityData: [],
        categoryData: [],
        maxPriorityCount: 1,
        maxCategoryCount: 1,
        mostProductiveDay: "-",
      };
    }

    // =================================================
    // BASIC STATS
    // =================================================

    const total =
      safeTasks.length;

    const completedTasks =
      safeTasks.filter(
        (task) =>
          task?.completed === true
      );

    const completed =
      completedTasks.length;

    const active =
      safeTasks.filter(
        (task) =>
          task?.completed !== true
      ).length;

    // =================================================
    // OVERDUE
    // =================================================

    const overdue =
      safeTasks.filter(
        (task) => {
          if (
            task?.completed ||
            !task?.due_date
          ) {
            return false;
          }

          const dueDate =
            getDateOnly(
              task.due_date
            );

          if (!dueDate) {
            return false;
          }

          return (
            dueDate < today
          );
        }
      ).length;

    // =================================================
    // COMPLETION RATE
    // =================================================

    const completionRate =
      total === 0
        ? 0
        : Math.round(
            (completed /
              total) *
              100
          );

    // =================================================
    // COMPLETED TODAY
    // =================================================

    const completedToday =
      completedTasks.filter(
        (task) => {
          const date =
            getValidDate(
              task?.updated_at
            );

          if (!date) {
            return false;
          }

          const day =
            getStartOfDay(
              date
            );

          return (
            day?.getTime() ===
            today.getTime()
          );
        }
      ).length;

    // =================================================
    // PERIOD START
    // =================================================

    const periodStart =
      new Date(today);

    if (period === "7") {
      periodStart.setDate(
        periodStart.getDate() -
          6
      );
    }

    if (period === "30") {
      periodStart.setDate(
        periodStart.getDate() -
          29
      );
    }

    if (period === "365") {
      periodStart.setDate(
        periodStart.getDate() -
          364
      );
    }

    // =================================================
    // PERIOD COMPLETED
    // =================================================

    const periodCompleted =
      completedTasks.filter(
        (task) => {
          const date =
            getValidDate(
              task?.updated_at
            );

          if (!date) {
            return false;
          }

          return (
            date >= periodStart &&
            date <= new Date()
          );
        }
      ).length;

    // =================================================
    // CHART DATA
    // =================================================

    let chartData = [];

    // =================================================
    // 7 DAYS
    // =================================================

    if (period === "7") {
      chartData =
        Array.from(
          {
            length: 7,
          },
          (_, index) => {
            const target =
              new Date(today);

            target.setDate(
              today.getDate() -
                (6 - index)
            );

            const count =
              completedTasks.filter(
                (task) => {
                  const date =
                    getValidDate(
                      task?.updated_at
                    );

                  if (!date) {
                    return false;
                  }

                  const completedDate =
                    getStartOfDay(
                      date
                    );

                  return (
                    completedDate?.getTime() ===
                    target.getTime()
                  );
                }
              ).length;

            return {
              name:
                target.toLocaleDateString(
                  "en-US",
                  {
                    weekday:
                      "short",
                  }
                ),
              count,
              date: target,
            };
          }
        );
    }

    // =================================================
    // 30 DAYS
    // =================================================

    if (period === "30") {
      chartData =
        Array.from(
          {
            length: 10,
          },
          (_, index) => {
            const endDate =
              new Date(today);

            endDate.setDate(
              today.getDate() -
                (9 - index) *
                  3
            );

            const startDate =
              new Date(
                endDate
              );

            startDate.setDate(
              endDate.getDate() -
                2
            );

            const endOfRange =
              new Date(
                endDate
              );

            endOfRange.setHours(
              23,
              59,
              59,
              999
            );

            const count =
              completedTasks.filter(
                (task) => {
                  const date =
                    getValidDate(
                      task?.updated_at
                    );

                  if (!date) {
                    return false;
                  }

                  return (
                    date >=
                      startDate &&
                    date <=
                      endOfRange
                  );
                }
              ).length;

            return {
              name: `${String(
                startDate.getDate()
              ).padStart(
                2,
                "0"
              )}/${String(
                startDate.getMonth() +
                  1
              ).padStart(
                2,
                "0"
              )}`,
              count,
            };
          }
        );
    }

    // =================================================
    // 1 YEAR
    // =================================================

    if (period === "365") {
      chartData =
        Array.from(
          {
            length: 12,
          },
          (_, index) => {
            const target =
              new Date(today);

            target.setDate(1);

            target.setMonth(
              today.getMonth() -
                (11 - index)
            );

            const month =
              target.getMonth();

            const year =
              target.getFullYear();

            const count =
              completedTasks.filter(
                (task) => {
                  const date =
                    getValidDate(
                      task?.updated_at
                    );

                  if (!date) {
                    return false;
                  }

                  return (
                    date.getMonth() ===
                      month &&
                    date.getFullYear() ===
                      year
                  );
                }
              ).length;

            return {
              name:
                target.toLocaleDateString(
                  "en-US",
                  {
                    month:
                      "short",
                  }
                ),
              count,
            };
          }
        );
    }

    const maxChartCount =
      Math.max(
        ...chartData.map(
          (item) =>
            item.count
        ),
        1
      );

    // =================================================
    // PRIORITY
    // =================================================

    const priorityData = [
      {
        name: "High",
        key: "high",
        count:
          safeTasks.filter(
            (task) =>
              String(
                task?.priority ||
                  ""
              ).toLowerCase() ===
              "high"
          ).length,
        dot: "bg-red-400",
        bar:
          "from-red-500 to-rose-400",
      },
      {
        name: "Medium",
        key: "medium",
        count:
          safeTasks.filter(
            (task) =>
              String(
                task?.priority ||
                  ""
              ).toLowerCase() ===
              "medium"
          ).length,
        dot: "bg-yellow-400",
        bar:
          "from-yellow-500 to-amber-400",
      },
      {
        name: "Low",
        key: "low",
        count:
          safeTasks.filter(
            (task) =>
              String(
                task?.priority ||
                  ""
              ).toLowerCase() ===
              "low"
          ).length,
        dot: "bg-green-400",
        bar:
          "from-green-500 to-emerald-400",
      },
    ];

    const maxPriorityCount =
      Math.max(
        ...priorityData.map(
          (item) =>
            item.count
        ),
        1
      );

    // =================================================
    // CATEGORY
    // =================================================

    const categoryMap = {};

    safeTasks.forEach(
      (task) => {
        let category =
          task?.category_name ||
          task?.category ||
          task?.categories
            ?.name ||
          "General";

        if (
          typeof category ===
            "object" &&
          category !== null
        ) {
          category =
            category.name ||
            "General";
        }

        category =
          String(
            category
          ).trim();

        if (!category) {
          category =
            "General";
        }

        categoryMap[
          category
        ] =
          (categoryMap[
            category
          ] || 0) + 1;
      }
    );

    const categoryData =
      Object.entries(
        categoryMap
      )
        .map(
          ([name, count]) => ({
            name,
            count,
          })
        )
        .sort(
          (a, b) =>
            b.count -
            a.count
        );

    const maxCategoryCount =
      Math.max(
        ...categoryData.map(
          (item) =>
            item.count
        ),
        1
      );

    // =================================================
    // BEST DAY
    // =================================================

    const mostProductive =
      [...chartData].sort(
        (a, b) =>
          b.count -
          a.count
      )[0];

    return {
      total,
      completed,
      active,
      overdue,
      completionRate,
      completedToday,
      periodCompleted,
      chartData,
      maxChartCount,
      priorityData,
      categoryData,
      maxPriorityCount,
      maxCategoryCount,
      mostProductiveDay:
        mostProductive?.count >
        0
          ? mostProductive.name
          : "-",
    };
  }, [
    safeTasks,
    period,
  ]);

  // =====================================================
  // CHART POINTS
  // =====================================================

  const chartPoints = useMemo(() => {
    const data =
      analytics.chartData;

    if (!data.length) {
      return "";
    }

    const width = 900;
    const height = 280;

    const paddingX = 45;
    const paddingY = 30;

    const usableWidth =
      width -
      paddingX * 2;

    const usableHeight =
      height -
      paddingY * 2;

    return data
      .map(
        (item, index) => {
          const x =
            paddingX +
            (index /
              Math.max(
                data.length - 1,
                1
              )) *
              usableWidth;

          const y =
            height -
            paddingY -
            (item.count /
              analytics.maxChartCount) *
              usableHeight;

          return {
            x,
            y,
          };
        }
      );
  }, [
    analytics.chartData,
    analytics.maxChartCount,
  ]);

  const linePath =
    chartPoints.length > 0
      ? chartPoints
          .map(
            (point, index) =>
              `${
                index === 0
                  ? "M"
                  : "L"
              } ${point.x} ${point.y}`
          )
          .join(" ")
      : "";

  const areaPath =
    chartPoints.length > 0
      ? `${linePath} L ${
          chartPoints[
            chartPoints.length -
              1
          ].x
        } 250 L ${
          chartPoints[0].x
        } 250 Z`
      : "";

  // =====================================================
  // STAT CARDS
  // =====================================================

  const cards = [
    {
      title: "Total Tasks",
      value: analytics.total,
      description:
        "All your tasks",
      icon: (
        <FiBarChart2
          size={20}
        />
      ),
      iconClass:
        "bg-blue-500/10 text-blue-400",
    },
    {
      title: "Completed",
      value:
        analytics.completed,
      description:
        "Tasks finished",
      icon: (
        <FiCheckCircle
          size={20}
        />
      ),
      iconClass:
        "bg-green-500/10 text-green-400",
    },
    {
      title: "Active",
      value:
        analytics.active,
      description:
        "Still in progress",
      icon: (
        <FiClock
          size={20}
        />
      ),
      iconClass:
        "bg-cyan-500/10 text-cyan-400",
    },
    {
      title: "Completion Rate",
      value: `${analytics.completionRate}%`,
      description:
        "Overall productivity",
      icon: (
        <FiTarget
          size={20}
        />
      ),
      iconClass:
        "bg-purple-500/10 text-purple-400",
    },
  ];

  // =====================================================
  // PERIOD LABEL
  // =====================================================

  const periodLabel =
    period === "7"
      ? "last 7 days"
      : period === "30"
      ? "last 30 days"
      : "last 12 months";

  // =====================================================
  // DONUT
  // =====================================================

  const completedPercent =
    analytics.total > 0
      ? analytics.completionRate
      : 0;

  const activePercent =
    analytics.total > 0
      ? 100 -
        completedPercent
      : 0;

  const donutStyle =
    analytics.total === 0
      ? {
          background:
            "conic-gradient(#1e293b 0deg 360deg)",
        }
      : {
          background: `conic-gradient(
            #22d3ee 0deg ${completedPercent * 3.6}deg,
            #a855f7 ${completedPercent * 3.6}deg 360deg
          )`,
        };

  // =====================================================
  // UI
  // =====================================================

  return (
    <section className="mt-8 sm:mt-10">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <p className="text-sm font-medium tracking-wide text-blue-400">
            PRODUCTIVITY
          </p>

          <h3 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Analytics Overview
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Understand your productivity and progress.
          </p>

        </div>

        {/* PERIOD */}

        <div className="flex w-fit items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">

          {[
            {
              value: "7",
              label: "7 Days",
            },
            {
              value: "30",
              label: "30 Days",
            },
            {
              value: "365",
              label: "1 Year",
            },
          ].map(
            (option) => (
              <button
                key={
                  option.value
                }
                type="button"
                onClick={() =>
                  setPeriod(
                    option.value
                  )
                }
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 ${
                  period ===
                  option.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-500 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {
                  option.label
                }
              </button>
            )
          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* STAT CARDS */}
      {/* ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map(
          (card) => (
            <div
              key={
                card.title
              }
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900"
            >

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                {
                  card.icon
                }
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {
                  card.title
                }
              </p>

              <p className="mt-1 text-3xl font-bold text-white">
                {
                  card.value
                }
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {
                  card.description
                }
              </p>

            </div>
          )
        )}

      </div>

      {/* ================================================= */}
      {/* MAIN ANALYTICS GRID */}
      {/* ================================================= */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">

        {/* ================================================= */}
        {/* PRODUCTIVITY CHART */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <FiTrendingUp
                  className="text-blue-400"
                  size={19}
                />

                <h4 className="text-lg font-bold text-white">
                  Productivity Overview
                </h4>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Completed tasks over{" "}
                {periodLabel}.
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2">

              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Completed
              </p>

              <p className="mt-0.5 text-lg font-bold text-white">
                {
                  analytics.periodCompleted
                }
              </p>

            </div>

          </div>

          {analytics.total ===
          0 ? (
            <div className="flex min-h-[320px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-600">
                  <FiActivity
                    size={21}
                  />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-400">
                  No analytics data yet
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Complete some tasks to see your productivity.
                </p>

              </div>

            </div>
          ) : (
            <div className="mt-6">

              <div className="relative h-[300px] w-full">

                {/* GRID */}

                <div className="pointer-events-none absolute inset-x-0 top-5 bottom-12 flex flex-col justify-between">

                  {[
                    100,
                    75,
                    50,
                    25,
                    0,
                  ].map(
                    (
                      value
                    ) => (
                      <div
                        key={
                          value
                        }
                        className="border-t border-slate-800/80"
                      />
                    )
                  )}

                </div>

                {/* SVG */}

                <svg
                  viewBox="0 0 900 280"
                  preserveAspectRatio="none"
                  className="absolute inset-x-0 top-0 h-[250px] w-full overflow-visible"
                >

                  <defs>

                    <linearGradient
                      id="analyticsArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6366f1"
                        stopOpacity="0.30"
                      />

                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity="0.02"
                      />

                    </linearGradient>

                    <linearGradient
                      id="analyticsLine"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="#3b82f6"
                      />

                      <stop
                        offset="100%"
                        stopColor="#22d3ee"
                      />

                    </linearGradient>

                  </defs>

                  <path
                    d={
                      areaPath
                    }
                    fill="url(#analyticsArea)"
                  />

                  <path
                    d={
                      linePath
                    }
                    fill="none"
                    stroke="url(#analyticsLine)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {chartPoints.map(
                    (
                      point,
                      index
                    ) => (
                      <g
                        key={
                          index
                        }
                      >

                        <circle
                          cx={
                            point.x
                          }
                          cy={
                            point.y
                          }
                          r="8"
                          fill="#0f172a"
                          stroke="#22d3ee"
                          strokeWidth="3"
                        />

                        <circle
                          cx={
                            point.x
                          }
                          cy={
                            point.y
                          }
                          r="3"
                          fill="#22d3ee"
                        />

                      </g>
                    )
                  )}

                </svg>

                {/* LABELS */}

                <div className="absolute inset-x-0 bottom-0 flex justify-between px-2">

                  {analytics.chartData.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex flex-1 justify-center"
                      >
                        <span className="text-[11px] font-medium text-slate-500">
                          {
                            item.name
                          }
                        </span>
                      </div>
                    )
                  )}

                </div>

                {/* VALUES */}

                <div className="absolute inset-x-0 top-0 flex justify-between px-2">

                  {analytics.chartData.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`value-${item.name}-${index}`}
                        className="flex flex-1 justify-center"
                      >
                        <span className="rounded-md bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                          {
                            item.count
                          }
                        </span>
                      </div>
                    )
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

        {/* ================================================= */}
        {/* TASK STATUS */}
        {/* ================================================= */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

          <div>

            <div className="flex items-center gap-2">

              <FiActivity
                className="text-purple-400"
                size={19}
              />

              <h4 className="text-lg font-bold text-white">
                Task Status
              </h4>

            </div>

            <p className="mt-1 text-sm text-slate-500">
              Current task distribution.
            </p>

          </div>

          {/* DONUT */}

          <div className="mt-8 flex justify-center">

            <div
              className="relative flex h-48 w-48 items-center justify-center rounded-full"
              style={
                donutStyle
              }
            >

              <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-slate-950">

                <span className="text-3xl font-bold text-white">
                  {
                    analytics.completionRate
                  }
                  %
                </span>

                <span className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                  completed
                </span>

              </div>

            </div>

          </div>

          {/* LEGEND */}

          <div className="mt-8 space-y-4">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

                <span className="text-sm text-slate-400">
                  Completed
                </span>

              </div>

              <div className="flex items-center gap-3">

                <span className="text-sm font-bold text-white">
                  {
                    analytics.completed
                  }
                </span>

                <span className="w-10 text-right text-xs text-slate-600">
                  {
                    completedPercent
                  }
                  %
                </span>

              </div>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />

                <span className="text-sm text-slate-400">
                  Active
                </span>

              </div>

              <div className="flex items-center gap-3">

                <span className="text-sm font-bold text-white">
                  {
                    analytics.active
                  }
                </span>

                <span className="w-10 text-right text-xs text-slate-600">
                  {
                    activePercent
                  }
                  %
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* QUICK INSIGHTS */}
      {/* ================================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <FiTarget
                size={19}
              />
            </div>

            <div>

              <p className="text-xs text-slate-600">
                Completion Rate
              </p>

              <p className="text-lg font-bold text-white">
                {
                  analytics.completionRate
                }
                %
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
              <FiCheckCircle
                size={19}
              />
            </div>

            <div>

              <p className="text-xs text-slate-600">
                Completed Today
              </p>

              <p className="text-lg font-bold text-white">
                {
                  analytics.completedToday
                }
              </p>

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
              <FiActivity
                size={19}
              />
            </div>

            <div>

              <p className="text-xs text-slate-600">
                Best Day
              </p>

              <p className="text-lg font-bold text-white">
                {
                  analytics.mostProductiveDay
                }
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ================================================= */}
      {/* PRIORITY + CATEGORY */}
      {/* ================================================= */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* PRIORITY */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

          <div className="mb-6">

            <h4 className="text-lg font-bold text-white">
              Priority Distribution
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              How your tasks are prioritized.
            </p>

          </div>

          <div className="space-y-6">

            {analytics.priorityData.map(
              (item) => {

                const width =
                  item.count ===
                  0
                    ? 0
                    : Math.max(
                        (item.count /
                          analytics.maxPriorityCount) *
                          100,
                        8
                      );

                return (
                  <div
                    key={
                      item.key
                    }
                  >

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2">

                        <span
                          className={`h-2 w-2 rounded-full ${item.dot}`}
                        />

                        <span className="text-sm font-medium text-slate-300">
                          {
                            item.name
                          }
                        </span>

                      </div>

                      <span className="text-sm font-bold text-slate-400">
                        {
                          item.count
                        }
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.bar} transition-all duration-700`}
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

        {/* CATEGORY */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">

          <div className="mb-6">

            <h4 className="text-lg font-bold text-white">
              Category Breakdown
            </h4>

            <p className="mt-1 text-sm text-slate-500">
              Where your tasks are organized.
            </p>

          </div>

          {analytics.categoryData
            .length ===
          0 ? (
            <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
              No category data available.
            </div>
          ) : (
            <div className="space-y-5">

              {analytics.categoryData
                .slice(0, 6)
                .map(
                  (item) => {

                    const width =
                      item.count ===
                      0
                        ? 0
                        : Math.max(
                            (item.count /
                              analytics.maxCategoryCount) *
                              100,
                            8
                          );

                    return (
                      <div
                        key={
                          item.name
                        }
                      >

                        <div className="mb-2 flex items-center justify-between">

                          <span className="max-w-[75%] truncate text-sm font-medium text-slate-300">
                            {
                              item.name
                            }
                          </span>

                          <span className="text-sm font-bold text-slate-400">
                            {
                              item.count
                            }
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
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

      {/* ================================================= */}
      {/* OVERDUE WARNING */}
      {/* ================================================= */}

      {analytics.overdue >
        0 && (
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <FiAlertCircle
              size={20}
            />
          </div>

          <div>

            <p className="font-semibold text-red-300">
              You have{" "}
              {
                analytics.overdue
              }{" "}
              overdue{" "}
              {
                analytics.overdue ===
                1
                  ? "task"
                  : "tasks"
              }
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Complete or reschedule them to keep your productivity score healthy.
            </p>

          </div>

        </div>
      )}

    </section>
  );
}

export default Analytics;