import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FiSearch,
  FiBell,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiChevronRight,
} from "react-icons/fi";

import { supabase } from "../supabaseClient";
import NotificationBell from "./NotificationBell";

function Navbar({
  user,
  searchQuery,
  setSearchQuery,
}) {
  const navigate = useNavigate();

  // =========================================================
  // USER
  // =========================================================

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarLetter = userName
    .charAt(0)
    .toUpperCase();

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  const [notifications, setNotifications] =
    useState([]);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  // =========================================================
  // DATE HELPER
  // =========================================================

  const getDateString = (date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // FETCH IMPORTANT NOTIFICATIONS
  // =========================================================
  // Only:
  //   1. Overdue
  //   2. Due today
  //   3. Due tomorrow
  //
  // Completed tasks and tasks due 2+ days from now are ignored.
  // =========================================================

  const fetchNotifications = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setNotificationsLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("tasks")
        .select(
          "id, title, completed, priority, due_date"
        )
        .eq("user_id", user.id)
        .eq("completed", false)
        .not("due_date", "is", null)
        .order("due_date", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      // =====================================================
      // TODAY
      // =====================================================

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const todayString =
        getDateString(today);

      // =====================================================
      // TOMORROW
      // =====================================================

      const tomorrow =
        new Date(today);

      tomorrow.setDate(
        tomorrow.getDate() + 1
      );

      const tomorrowString =
        getDateString(tomorrow);

      // =====================================================
      // BUILD NOTIFICATIONS
      // =====================================================

      const formatted =
        (data || [])
          .map((task) => {
            // ---------------------------------------------
            // OVERDUE
            // ---------------------------------------------

            if (
              task.due_date <
              todayString
            ) {
              return {
                ...task,
                type: "overdue",
                label: "Overdue",
                message:
                  "This task is overdue.",
                icon: "alert",
              };
            }

            // ---------------------------------------------
            // DUE TODAY
            // ---------------------------------------------

            if (
              task.due_date ===
              todayString
            ) {
              return {
                ...task,
                type: "today",
                label: "Due today",
                message:
                  "This task is due today.",
                icon: "clock",
              };
            }

            // ---------------------------------------------
            // DUE TOMORROW
            // ---------------------------------------------

            if (
              task.due_date ===
              tomorrowString
            ) {
              return {
                ...task,
                type: "tomorrow",
                label: "Due tomorrow",
                message:
                  "This task is due tomorrow.",
                icon: "clock",
              };
            }

            // ---------------------------------------------
            // IGNORE EVERYTHING ELSE
            // ---------------------------------------------

            return null;
          })
          .filter(Boolean);

      setNotifications(
        formatted
      );
    } catch (error) {
      console.error(
        "Notification fetch error:",
        error
      );
    } finally {
      setNotificationsLoading(
        false
      );
    }
  };

  // =========================================================
  // INITIAL LOAD + AUTO REFRESH
  // =========================================================

  useEffect(() => {
    fetchNotifications();

    const interval =
      window.setInterval(
        () => {
          fetchNotifications();
        },
        60000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [user?.id]);

  // =========================================================
  // CLOSE DROPDOWN OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          !event.target.closest(
            "[data-notification-wrapper]"
          )
        ) {
          setNotificationOpen(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  const getNotificationIcon =
    (type) => {
      if (
        type === "overdue"
      ) {
        return (
          <div
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-xl
              bg-red-500/10
              text-red-400
            "
          >
            <FiAlertCircle
              size={17}
            />
          </div>
        );
      }

      return (
        <div
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-xl
            bg-blue-500/10
            text-blue-400
          "
        >
          <FiClock
            size={17}
          />
        </div>
      );
    };

  // =========================================================
  // NAVBAR
  // =========================================================

  return (
    <header
      className="
        sticky top-0 z-50
        border-b border-slate-800/80
        bg-slate-950/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex min-h-20
          items-center justify-between
          gap-4
          px-4 sm:px-6 lg:px-10
        "
      >
        {/* LOGO */}

        <div className="flex shrink-0 items-center">
          <h1
            className="
              text-xl font-extrabold
              tracking-tight sm:text-2xl
            "
          >
            Task
            <span
              className="
                bg-gradient-to-r
                from-blue-400 to-cyan-400
                bg-clip-text text-transparent
              "
            >
              Flow
            </span>
          </h1>
        </div>

        {/* SEARCH */}

        <div
          className="
            hidden w-full max-w-md
            items-center gap-3
            rounded-xl border border-slate-800
            bg-slate-900/70 px-4 py-2.5
            lg:flex
            focus-within:border-blue-500/40
            focus-within:bg-slate-900
          "
        >
          <FiSearch
            className="shrink-0 text-slate-500"
            size={18}
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="
              w-full bg-transparent
              text-sm text-white
              outline-none
              placeholder:text-slate-500
            "
          />
        </div>

        {/* RIGHT ACTIONS */}

        <div
          className="
            flex shrink-0
            items-center gap-3
          "
        >
          {/* NOTIFICATION */}

          <div
            className="relative"
            data-notification-wrapper
          >
            <button
              type="button"
              onClick={() =>
                setNotificationOpen(
                  (prev) => !prev
                )
              }
              className="
                relative flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-transparent
                text-slate-500
                transition-all
                hover:border-slate-800
                hover:bg-slate-900
                hover:text-white
              "
              title="Notifications"
              aria-label="Notifications"
            >
              <FiBell size={20} />

              {notifications.length >
                0 && (
                <span
                  className="
                    absolute right-1 top-1
                    flex h-4 min-w-4
                    items-center justify-center
                    rounded-full
                    bg-red-500 px-1
                    text-[9px] font-bold text-white
                    shadow-lg shadow-red-500/30
                  "
                >
                  {notifications.length >
                  9
                    ? "9+"
                    : notifications.length}
                </span>
              )}
            </button>

            {/* DROPDOWN */}

            {notificationOpen && (
              <div
                className="
                  absolute right-0 top-14 z-[100]
                  w-[360px]
                  overflow-hidden
                  rounded-2xl
                  border border-slate-800
                  bg-slate-900
                  shadow-2xl shadow-black/40
                "
              >
                {/* HEADER */}

                <div
                  className="
                    flex items-center justify-between
                    border-b border-slate-800
                    px-4 py-4
                  "
                >
                  <div>
                    <h3
                      className="
                        text-sm font-semibold
                        text-white
                      "
                    >
                      Notifications
                    </h3>

                    <p
                      className="
                        mt-0.5 text-xs
                        text-slate-500
                      "
                    >
                      Important task reminders
                    </p>
                  </div>

                  {notifications.length >
                    0 && (
                    <span
                      className="
                        rounded-full
                        bg-red-500/10
                        px-2 py-1
                        text-[10px] font-semibold
                        text-red-400
                      "
                    >
                      {notifications.length} active
                    </span>
                  )}
                </div>

                {/* BODY */}

                <div
                  className="
                    max-h-[380px]
                    overflow-y-auto
                  "
                >
                  {notificationsLoading ? (
                    <div
                      className="
                        px-5 py-10
                        text-center
                      "
                    >
                      <div
                        className="
                          mx-auto h-6 w-6
                          animate-spin rounded-full
                          border-2 border-slate-700
                          border-t-blue-400
                        "
                      />

                      <p
                        className="
                          mt-3 text-xs
                          text-slate-500
                        "
                      >
                        Checking your tasks...
                      </p>
                    </div>
                  ) : notifications.length ===
                    0 ? (
                    <div
                      className="
                        px-5 py-10
                        text-center
                      "
                    >
                      <div
                        className="
                          mx-auto flex h-12 w-12
                          items-center justify-center
                          rounded-full
                          bg-green-500/10
                          text-green-400
                        "
                      >
                        <FiCheckCircle
                          size={22}
                        />
                      </div>

                      <p
                        className="
                          mt-3 text-sm
                          font-medium text-slate-300
                        "
                      >
                        You're all caught up!
                      </p>

                      <p
                        className="
                          mt-1 text-xs
                          text-slate-600
                        "
                      >
                        No important task alerts.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="
                        divide-y
                        divide-slate-800
                      "
                    >
                      {notifications.map(
                        (notification) => (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() => {
                              setNotificationOpen(
                                false
                              );

                              navigate(
                                `/tasks?task=${notification.id}`
                              );
                            }}
                            className="
                              group flex w-full
                              items-start gap-3
                              px-4 py-3.5
                              text-left transition
                              hover:bg-slate-800/50
                            "
                          >
                            {getNotificationIcon(
                              notification.type
                            )}

                            <div
                              className="
                                min-w-0 flex-1
                              "
                            >
                              <div
                                className="
                                  flex items-start
                                  justify-between gap-2
                                "
                              >
                                <p
                                  className="
                                    truncate text-sm
                                    font-medium
                                    text-slate-200
                                    group-hover:text-blue-300
                                  "
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                <FiChevronRight
                                  size={15}
                                  className="
                                    mt-0.5 shrink-0
                                    text-slate-700
                                    transition
                                    group-hover:translate-x-0.5
                                    group-hover:text-blue-400
                                  "
                                />
                              </div>

                              <p
                                className={`
                                  mt-1 text-xs
                                  ${
                                    notification.type ===
                                    "overdue"
                                      ? "text-red-400"
                                      : notification.type ===
                                        "today"
                                      ? "text-orange-400"
                                      : "text-yellow-400"
                                  }
                                `}
                              >
                                {
                                  notification.label
                                }
                              </p>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* FOOTER */}

                <div
                  className="
                    border-t border-slate-800
                    p-3
                  "
                >
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationOpen(
                        false
                      );

                      navigate(
                        "/tasks"
                      );
                    }}
                    className="
                      w-full rounded-xl
                      bg-slate-950
                      px-3 py-2.5
                      text-xs font-medium
                      text-slate-400
                      transition
                      hover:bg-blue-500/10
                      hover:text-blue-400
                    "
                  >
                    View all tasks
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PROFILE PHOTO */}

          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              overflow-hidden rounded-full
              border border-slate-700
              bg-gradient-to-br
              from-blue-500 to-cyan-400
              text-sm font-bold text-white
              transition-all duration-200
              hover:scale-105
              hover:border-blue-400
              hover:shadow-lg
              hover:shadow-blue-500/20
            "
            title={userName}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="
                  h-full w-full
                  object-cover
                "
                referrerPolicy="no-referrer"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              avatarLetter
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
