import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
} from "react-router-dom";

import {
  FiHome,
  FiCheckSquare,
  FiBarChart2,
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiLayers,
  FiBell,
  FiCheck,
  FiClock,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";

import { supabase } from "../supabaseClient";

function AppLayout({
  user,
  onLogout,
}) {
  const [profile, setProfile] =
    useState(null);

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [notifications, setNotifications] =
    useState([]);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const notificationRef =
    useRef(null);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FiHome,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: FiCheckSquare,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: FiBarChart2,
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: FiCalendar,
    },
  ];

  const secondaryNavigation = [
    {
      name: "Settings",
      path: "/settings",
      icon: FiSettings,
    },
  ];

  // =========================================================
  // FETCH PROFILE
  // =========================================================

  async function fetchProfile() {
    if (!user?.id) {
      return;
    }

    try {
      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select(
          "id, name, bio, avatar_url"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "AppLayout profile fetch error:",
          error
        );
        return;
      }

      setProfile(data || null);
    } catch (error) {
      console.error(
        "AppLayout profile error:",
        error
      );
    }
  }

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  // =========================================================
  // PROFILE UPDATE LISTENER
  // =========================================================

  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener(
      "taskflow-profile-updated",
      handleProfileUpdate
    );

    return () => {
      window.removeEventListener(
        "taskflow-profile-updated",
        handleProfileUpdate
      );
    };
  }, [user?.id]);

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const displayName =
    profile?.name ||
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const email =
    user?.email || "";

  const avatarUrl =
    profile?.avatar_url
      ? `${profile.avatar_url}${
          profile.avatar_url.includes(
            "?"
          )
            ? "&"
            : "?"
        }t=${Date.now()}`
      : null;

  const avatarInitial =
    displayName
      .charAt(0)
      .toUpperCase();

  // =========================================================
  // NOTIFICATION HELPERS
  // =========================================================

  const getStartOfDay = (
    date
  ) => {
    const result =
      new Date(date);

    result.setHours(
      0,
      0,
      0,
      0
    );

    return result;
  };

  const getValidDate = (
    value
  ) => {
    if (!value) {
      return null;
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return date;
  };

  const getDueDate = (
    value
  ) => {
    if (!value) {
      return null;
    }

    const date =
      new Date(
        `${value}T00:00:00`
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
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

  const formatDueDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  // =========================================================
  // BUILD NOTIFICATIONS
  // =========================================================

  const buildNotifications = (
    tasks
  ) => {
    if (
      !Array.isArray(tasks)
    ) {
      return [];
    }

    const now =
      new Date();

    const today =
      getStartOfDay(now);

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() +
        1
    );

    const upcomingLimit =
      new Date(now);

    upcomingLimit.setHours(
      upcomingLimit.getHours() +
        48
    );

    const result = [];

    tasks.forEach(
      (task) => {
        if (!task?.id) {
          return;
        }

        const title =
          task.title ||
          task.name ||
          "Untitled task";

        // ===================================================
        // OVERDUE
        // ===================================================

        if (
          !task.completed &&
          task.due_date
        ) {
          const dueDate =
            getDueDate(
              task.due_date
            );

          if (
            dueDate &&
            dueDate < today
          ) {
            result.push({
              id: `overdue-${task.id}`,
              taskId: task.id,
              type: "overdue",
              title:
                "Task overdue",
              message: title,
              meta: `Due ${formatDueDate(
                dueDate
              )}`,
              icon: FiAlertCircle,
              iconClass:
                "bg-red-500/10 text-red-400",
              createdAt:
                dueDate.getTime(),
            });

            return;
          }
        }

        // ===================================================
        // DUE TODAY
        // ===================================================

        if (
          !task.completed &&
          task.due_date
        ) {
          const dueDate =
            getDueDate(
              task.due_date
            );

          if (
            dueDate &&
            dueDate.getTime() ===
              today.getTime()
          ) {
            result.push({
              id: `today-${task.id}`,
              taskId: task.id,
              type: "today",
              title:
                "Task due today",
              message: title,
              meta: "Due today",
              icon: FiClock,
              iconClass:
                "bg-yellow-500/10 text-yellow-400",
              createdAt:
                now.getTime(),
            });

            return;
          }
        }

        // ===================================================
        // UPCOMING
        // ===================================================

        if (
          !task.completed &&
          task.due_date
        ) {
          const dueDate =
            getDueDate(
              task.due_date
            );

          if (
            dueDate &&
            dueDate > today &&
            dueDate <=
              upcomingLimit
          ) {
            result.push({
              id: `upcoming-${task.id}`,
              taskId: task.id,
              type: "upcoming",
              title:
                "Upcoming task",
              message: title,
              meta: `Due ${formatDueDate(
                dueDate
              )}`,
              icon: FiClock,
              iconClass:
                "bg-blue-500/10 text-blue-400",
              createdAt:
                dueDate.getTime(),
            });

            return;
          }
        }

        // ===================================================
        // RECENTLY COMPLETED
        // ===================================================

        if (
          task.completed
        ) {
          const updatedAt =
            getValidDate(
              task.updated_at
            );

          if (
            updatedAt
          ) {
            const fortyEightHours =
              48 *
              60 *
              60 *
              1000;

            const age =
              now.getTime() -
              updatedAt.getTime();

            if (
              age >= 0 &&
              age <=
                fortyEightHours
            ) {
              result.push({
                id: `completed-${task.id}-${updatedAt.getTime()}`,
                taskId: task.id,
                type: "completed",
                title:
                  "Task completed",
                message: title,
                meta: "Completed recently",
                icon: FiCheck,
                iconClass:
                  "bg-green-500/10 text-green-400",
                createdAt:
                  updatedAt.getTime(),
              });
            }
          }
        }
      }
    );

    // ===================================================
    // SORT
    // ===================================================

    return result
      .sort(
        (a, b) =>
          b.createdAt -
          a.createdAt
      )
      .slice(0, 20);
  };

  // =========================================================
  // FETCH TASKS FOR NOTIFICATIONS
  // =========================================================

  async function fetchNotifications() {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    try {
      const {
        data,
        error,
      } = await supabase
        .from("tasks")
        .select(
          "id, title, completed, due_date, updated_at"
        )
        .eq(
          "user_id",
          user.id
        );

      if (error) {
        console.error(
          "Notification task fetch error:",
          error
        );

        return;
      }

      const generated =
        buildNotifications(
          data || []
        );

      const storageKey =
        `taskflow-read-notifications-${user.id}`;

      let readIds = [];

      try {
        const stored =
          localStorage.getItem(
            storageKey
          );

        readIds = stored
          ? JSON.parse(
              stored
            )
          : [];
      } catch {
        readIds = [];
      }

      const withReadState =
        generated.map(
          (notification) => ({
            ...notification,
            read:
              readIds.includes(
                notification.id
              ),
          })
        );

      setNotifications(
        withReadState
      );
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );
    }
  }

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // =========================================================
  // REFRESH NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    const refresh =
      () => {
        fetchNotifications();
      };

    window.addEventListener(
      "taskflow-notifications-refresh",
      refresh
    );

    return () => {
      window.removeEventListener(
        "taskflow-notifications-refresh",
        refresh
      );
    };
  }, [user?.id]);

  // =========================================================
  // OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(
          false
        );
      }
    };

    if (
      notificationOpen
    ) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [
    notificationOpen,
  ]);

  // =========================================================
  // UNREAD COUNT
  // =========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  // =========================================================
  // SAVE READ IDS
  // =========================================================

  const saveReadIds = (
    ids
  ) => {
    if (!user?.id) {
      return;
    }

    localStorage.setItem(
      `taskflow-read-notifications-${user.id}`,
      JSON.stringify(ids)
    );
  };

  // =========================================================
  // MARK ONE READ
  // =========================================================

  const markNotificationRead = (
    notificationId
  ) => {
    setNotifications(
      (previous) =>
        previous.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
    );

    const currentReadIds =
      notifications
        .filter(
          (notification) =>
            notification.read ||
            notification.id ===
              notificationId
        )
        .map(
          (notification) =>
            notification.id
        );

    saveReadIds(
      currentReadIds
    );
  };

  // =========================================================
  // MARK ALL READ
  // =========================================================

  const markAllNotificationsRead =
    () => {
      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          )
      );

      saveReadIds(
        notifications.map(
          (notification) =>
            notification.id
        )
      );
    };

  // =========================================================
  // NAV ITEM
  // =========================================================

  const renderNavItem = (
    item
  ) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({
          isActive,
        }) =>
          `
          group relative flex items-center gap-3
          overflow-hidden rounded-xl
          px-3.5 py-3
          text-sm font-medium
          transition-all duration-200
          ${
            isActive
              ? "bg-blue-500/10 text-blue-400 shadow-[inset_3px_0_0_#3b82f6]"
              : "text-slate-500 hover:-translate-y-[1px] hover:bg-slate-900 hover:text-slate-200 hover:shadow-lg hover:shadow-blue-500/5"
          }
          `
        }
      >
        {({
          isActive,
        }) => (
          <>
            {isActive && (
              <span
                className="
                  absolute inset-y-2 left-0
                  w-[3px]
                  rounded-r-full
                  bg-blue-400
                  shadow-[0_0_12px_rgba(59,130,246,0.8)]
                "
              />
            )}

            <span
              className={`
                relative z-10 flex shrink-0
                transition-all duration-200
                ${
                  isActive
                    ? "scale-105 text-blue-400"
                    : "text-slate-600 group-hover:scale-110 group-hover:text-blue-400"
                }
              `}
            >
              <Icon size={19} />
            </span>

            <span className="relative z-10 flex-1">
              {item.name}
            </span>

            <FiChevronRight
              size={14}
              className={`
                relative z-10
                transition-all duration-200
                ${
                  isActive
                    ? "translate-x-0 text-blue-400 opacity-100"
                    : "-translate-x-2 text-slate-700 opacity-0 group-hover:translate-x-0 group-hover:text-slate-400 group-hover:opacity-100"
                }
              `}
            />

            {!isActive && (
              <span
                className="
                  pointer-events-none
                  absolute inset-0
                  rounded-xl
                  bg-gradient-to-r
                  from-blue-500/[0.04]
                  to-cyan-400/[0.02]
                  opacity-0
                  transition-opacity duration-200
                  group-hover:opacity-100
                "
              />
            )}
          </>
        )}
      </NavLink>
    );
  };

  // =========================================================
  // NOTIFICATION BELL
  // =========================================================

  const NotificationBell =
    () => (
      <div
        ref={
          notificationRef
        }
        className="relative"
      >

        <button
          type="button"
          onClick={() =>
            setNotificationOpen(
              (previous) =>
                !previous
            )
          }
          aria-label="Notifications"
          className="
            relative flex h-10 w-10
            items-center justify-center
            rounded-xl
            border border-slate-800
            bg-slate-900/80
            text-slate-500
            transition-all duration-200
            hover:border-slate-700
            hover:bg-slate-900
            hover:text-blue-400
            hover:shadow-lg
            hover:shadow-blue-500/5
          "
        >

          <FiBell
            size={19}
            className={
              unreadCount > 0
                ? "animate-[pulse_2s_ease-in-out_infinite]"
                : ""
            }
          />

          {unreadCount > 0 && (
            <span
              className="
                absolute -right-1 -top-1
                flex h-5 min-w-5
                items-center justify-center
                rounded-full
                border-2 border-slate-950
                bg-red-500
                px-1
                text-[9px]
                font-bold
                text-white
                shadow-lg
                shadow-red-500/20
              "
            >
              {unreadCount >
              9
                ? "9+"
                : unreadCount}
            </span>
          )}

        </button>

        {/* ================================================= */}
        {/* DROPDOWN */}
        {/* ================================================= */}

        {notificationOpen && (
          <div
            className="
              absolute right-0 top-12
              z-[100]
              w-[360px]
              max-w-[calc(100vw-2rem)]
              overflow-hidden
              rounded-2xl
              border border-slate-800
              bg-[#080d1c]
              shadow-2xl
              shadow-black/40
            "
          >

            {/* HEADER */}

            <div
              className="
                flex items-center
                justify-between
                border-b border-slate-800
                px-4 py-4
              "
            >

              <div>

                <h3 className="text-sm font-bold text-white">
                  Notifications
                </h3>

                <p className="mt-0.5 text-[11px] text-slate-600">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </p>

              </div>

              <div className="flex items-center gap-1">

                {unreadCount >
                  0 && (
                  <button
                    type="button"
                    onClick={
                      markAllNotificationsRead
                    }
                    className="
                      rounded-lg
                      px-2.5 py-1.5
                      text-[10px]
                      font-semibold
                      text-blue-400
                      transition
                      hover:bg-blue-500/10
                    "
                  >
                    Mark all read
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setNotificationOpen(
                      false
                    )
                  }
                  className="
                    flex h-7 w-7
                    items-center justify-center
                    rounded-lg
                    text-slate-600
                    transition
                    hover:bg-slate-800
                    hover:text-slate-300
                  "
                >
                  <FiX size={15} />
                </button>

              </div>

            </div>

            {/* BODY */}

            {notifications.length ===
            0 ? (
              <div className="px-6 py-12 text-center">

                <div
                  className="
                    mx-auto flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-slate-900
                    text-slate-600
                  "
                >
                  <FiBell size={21} />
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-400">
                  No notifications
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  You're all caught up.
                  We'll show important task updates here.
                </p>

              </div>
            ) : (
              <div className="max-h-[430px] overflow-y-auto">

                {notifications.map(
                  (
                    notification
                  ) => {
                    const Icon =
                      notification.icon;

                    return (
                      <button
                        key={
                          notification.id
                        }
                        type="button"
                        onClick={() =>
                          markNotificationRead(
                            notification.id
                          )
                        }
                        className={`
                          group flex w-full
                          gap-3
                          border-b border-slate-800/70
                          px-4 py-4
                          text-left
                          transition
                          hover:bg-slate-900/80
                          ${
                            notification.read
                              ? "opacity-60"
                              : "bg-slate-900/20"
                          }
                        `}
                      >

                        {/* ICON */}

                        <div
                          className={`
                            flex h-9 w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${notification.iconClass}
                          `}
                        >
                          <Icon
                            size={16}
                          />
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">

                            <p className="text-xs font-semibold text-slate-200">
                              {
                                notification.title
                              }
                            </p>

                            {!notification.read && (
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            )}

                          </div>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {
                              notification.message
                            }
                          </p>

                          <p className="mt-1.5 text-[10px] text-slate-700">
                            {
                              notification.meta
                            }
                          </p>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>
        )}

      </div>
    );

  // =========================================================
  // LAYOUT
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="flex min-h-screen">

        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <aside
          className="
            fixed inset-y-0 left-0 z-50
            hidden w-[250px]
            border-r border-slate-800/80
            bg-[#070b18]
            lg:flex lg:flex-col
          "
        >

          {/* BRAND */}

          <div
            className="
              flex h-[88px] shrink-0
              items-center
              border-b border-slate-800/80
              px-6
            "
          >

            <div className="group flex items-center gap-3">

              <div
                className="
                  relative flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-blue-500/20
                  to-cyan-400/10
                  ring-1 ring-blue-500/20
                  transition-all duration-300
                  group-hover:scale-105
                  group-hover:ring-blue-400/40
                  group-hover:shadow-lg
                  group-hover:shadow-blue-500/10
                "
              >

                <FiLayers
                  size={21}
                  className="
                    text-blue-400
                    transition-transform
                    duration-300
                    group-hover:scale-110
                  "
                />

                <span
                  className="
                    absolute -right-0.5 -top-0.5
                    h-2 w-2
                    rounded-full
                    bg-cyan-400
                    shadow-lg
                    shadow-cyan-400/50
                  "
                />

              </div>

              <div>

                <h1 className="text-xl font-bold tracking-tight text-white">
                  Task
                  <span className="text-cyan-400">
                    Flow
                  </span>
                </h1>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-slate-600
                  "
                >
                  Productivity OS
                </p>

              </div>

            </div>

          </div>

          {/* SIDEBAR CONTENT */}

          <div
            className="
              flex min-h-0 flex-1
              flex-col
              px-4 py-6
            "
          >

            <div>

              <p
                className="
                  mb-3 px-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-slate-600
                "
              >
                Workspace
              </p>

              <nav className="space-y-1">
                {navigation.map(
                  renderNavItem
                )}
              </nav>

            </div>

            <div className="my-6 border-t border-slate-800/70" />

            <div>

              <p
                className="
                  mb-3 px-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-slate-600
                "
              >
                Management
              </p>

              <nav className="space-y-1">
                {secondaryNavigation.map(
                  renderNavItem
                )}
              </nav>

            </div>

            <div className="flex-1" />

            {/* PROFILE */}

            <NavLink
              to="/profile"
              className="
                group relative mb-2
                overflow-hidden
                rounded-2xl
                border border-slate-800/80
                bg-slate-900/50
                p-3
                transition-all duration-200
                hover:-translate-y-[1px]
                hover:border-blue-500/30
                hover:bg-slate-900
                hover:shadow-lg
                hover:shadow-blue-500/5
              "
            >

              <span
                className="
                  pointer-events-none
                  absolute inset-0
                  bg-gradient-to-r
                  from-blue-500/[0.04]
                  to-cyan-400/[0.02]
                  opacity-0
                  transition-opacity
                  duration-200
                  group-hover:opacity-100
                "
              />

              <div className="relative flex items-center gap-3">

                <div
                  className="
                    relative flex h-10 w-10
                    shrink-0
                    items-center justify-center
                    overflow-hidden
                    rounded-full
                    border border-slate-700
                    bg-gradient-to-br
                    from-blue-500/20
                    to-cyan-400/10
                    text-sm font-bold
                    text-blue-400
                    transition-all duration-200
                    group-hover:border-blue-400/40
                    group-hover:shadow-md
                    group-hover:shadow-blue-500/10
                  "
                >

                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                      onError={(
                        event
                      ) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    avatarInitial
                  )}

                </div>

                <div className="min-w-0 flex-1">

                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-slate-200
                    "
                  >
                    {displayName}
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-xs
                      text-slate-600
                      transition-colors
                      group-hover:text-blue-400/70
                    "
                  >
                    View Profile
                  </p>

                </div>

                <FiChevronRight
                  size={15}
                  className="
                    shrink-0
                    text-slate-700
                    transition-all
                    duration-200
                    group-hover:translate-x-0.5
                    group-hover:text-blue-400
                  "
                />

              </div>

            </NavLink>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={onLogout}
              className="
                group flex w-full
                items-center
                gap-3
                rounded-xl
                px-3.5 py-3
                text-sm font-medium
                text-slate-600
                transition-all duration-200
                hover:-translate-y-[1px]
                hover:bg-red-500/5
                hover:text-red-400
                hover:shadow-lg
                hover:shadow-red-500/5
              "
            >

              <FiLogOut
                size={19}
                className="
                  shrink-0
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                "
              />

              <span>
                Log out
              </span>

            </button>

          </div>

        </aside>

        {/* ================================================= */}
        {/* MAIN */}
        {/* ================================================= */}

        <main
          className="
            min-w-0 flex-1
            lg:ml-[250px]
          "
        >

          {/* ================================================= */}
          {/* DESKTOP TOP BAR */}
          {/* ================================================= */}

          <header
            className="
              sticky top-0 z-40
              hidden h-[84px]
              items-center
              border-b border-slate-800/70
              bg-slate-950/85
              px-10
              backdrop-blur-xl
              lg:flex
            "
          >
            {/* LEFT — BRAND */}

            <div className="flex shrink-0 items-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Task
                <span className="text-cyan-400">
                  Flow
                </span>
              </h1>
            </div>

            {/* CENTER — SEARCH */}

            <div className="mx-auto w-full max-w-[500px]">
              <div
                className="
                  flex h-12
                  items-center gap-3
                  rounded-xl
                  border border-slate-800
                  bg-slate-900/70
                  px-4
                  transition-all
                  focus-within:border-blue-500/40
                  focus-within:ring-2
                  focus-within:ring-blue-500/10
                "
              >
                <svg
                  className="h-5 w-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path
                    d="m20 20-3.5-3.5"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-slate-600
                  "
                />
              </div>
            </div>

            {/* RIGHT */}

            <div className="flex shrink-0 items-center gap-4">

              <NotificationBell />

              <NavLink
                to="/profile"
                className="
                  flex h-10 w-10
                  items-center justify-center
                  overflow-hidden
                  rounded-full
                  border border-slate-700
                  bg-blue-500/10
                  text-sm font-bold
                  text-blue-400
                  transition-all
                  hover:border-blue-400/40
                  hover:shadow-lg
                  hover:shadow-blue-500/10
                "
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}
              </NavLink>

            </div>
          </header>

          {/* ================================================= */}
          {/* MOBILE HEADER */}
          {/* ================================================= */}

          <div
            className="
              sticky top-0 z-40
              flex h-16
              items-center
              justify-between
              border-b border-slate-800/80
              bg-slate-950/90
              px-4
              backdrop-blur-xl
              lg:hidden
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-xl
                  bg-blue-500/10
                  text-blue-400
                "
              >
                <FiLayers size={18} />
              </div>

              <h1 className="text-lg font-bold text-white">
                Task
                <span className="text-cyan-400">
                  Flow
                </span>
              </h1>

            </div>

            <div className="flex items-center gap-2">

              <NotificationBell  user={user}/>

              <NavLink
                to="/profile"
                className="
                  flex h-9 w-9
                  items-center justify-center
                  overflow-hidden
                  rounded-full
                  border border-slate-700
                  bg-blue-500/10
                  text-sm font-bold
                  text-blue-400
                  transition-all
                  hover:border-blue-400/40
                  hover:shadow-lg
                  hover:shadow-blue-500/10
                "
              >

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}

              </NavLink>

            </div>

          </div>

          {/* PAGE */}

          <div className="min-w-0">
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
}

export default AppLayout;