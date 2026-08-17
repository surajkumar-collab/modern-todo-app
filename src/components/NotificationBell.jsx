import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiX,
} from "react-icons/fi";

function NotificationBell({ user }) {
  const [notifications, setNotifications] =
    useState([]);

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  // =========================================
  // FETCH NOTIFICATIONS
  // =========================================

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    let mounted = true;

    async function fetchNotifications() {
      try {
        setLoading(true);

        const { data, error } =
          await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            })
            .limit(30);

        if (error) {
          throw error;
        }

        if (mounted) {
          setNotifications(
            data || []
          );
        }
      } catch (error) {
        console.error(
          "Notification fetch error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // =========================================
  // SUPABASE REALTIME
  // =========================================

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    console.log(
      "Starting notification realtime..."
    );

    const channel =
      supabase
        .channel(
          `notifications-${user.id}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log(
              "Notification realtime event:",
              payload
            );

            // =====================================
            // INSERT
            // =====================================

            if (
              payload.eventType ===
              "INSERT"
            ) {
              setNotifications(
                (prev) => {
                  const exists =
                    prev.some(
                      (
                        notification
                      ) =>
                        notification.id ===
                        payload.new.id
                    );

                  if (exists) {
                    return prev;
                  }

                  return [
                    payload.new,
                    ...prev,
                  ].slice(0, 30);
                }
              );

              return;
            }

            // =====================================
            // UPDATE
            // =====================================

            if (
              payload.eventType ===
              "UPDATE"
            ) {
              setNotifications(
                (prev) =>
                  prev.map(
                    (
                      notification
                    ) =>
                      notification.id ===
                      payload.new.id
                        ? payload.new
                        : notification
                  )
              );

              return;
            }

            // =====================================
            // DELETE
            // =====================================

            if (
              payload.eventType ===
              "DELETE"
            ) {
              setNotifications(
                (prev) =>
                  prev.filter(
                    (
                      notification
                    ) =>
                      notification.id !==
                      payload.old.id
                  )
              );
            }
          }
        )
        .subscribe(
          (status) => {
            console.log(
              "Notification realtime status:",
              status
            );
          }
        );

    // =========================================
    // CLEANUP
    // =========================================

    return () => {
      console.log(
        "Stopping notification realtime..."
      );

      supabase.removeChannel(
        channel
      );
    };
  }, [user?.id]);

  // =========================================
  // UNREAD COUNT
  // =========================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  // =========================================
  // MARK ONE AS READ
  // =========================================

  const markAsRead = async (
    notificationId
  ) => {
    if (
      !user?.id ||
      !notificationId
    ) {
      return;
    }

    console.log(
      "MARK AS READ CLICKED:",
      notificationId
    );

    // =========================================
    // UPDATE UI IMMEDIATELY
    // =========================================

    setNotifications(
      (prev) =>
        prev.map(
          (notification) =>
            notification.id ===
            notificationId
              ? {
                  ...notification,
                  is_read: true,
                }
              : notification
        )
    );

    // =========================================
    // UPDATE DATABASE
    // =========================================

    try {
      const {
        data,
        error,
      } = await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq(
          "id",
          notificationId
        )
        .eq(
          "user_id",
          user.id
        )
        .select()
        .single();

      if (error) {
        console.error(
          "MARK AS READ SUPABASE ERROR:",
          error
        );

        // Rollback UI

        setNotifications(
          (prev) =>
            prev.map(
              (
                notification
              ) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      is_read: false,
                    }
                  : notification
            )
        );

        return;
      }

      console.log(
        "MARK AS READ SUCCESS:",
        data
      );
    } catch (error) {
      console.error(
        "MARK AS READ ERROR:",
        error
      );

      // Rollback UI

      setNotifications(
        (prev) =>
          prev.map(
            (
              notification
            ) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    is_read: false,
                  }
                : notification
          )
      );
    }
  };

  // =========================================
  // MARK ALL AS READ
  // =========================================

  const markAllAsRead =
    async () => {
      if (
        !user?.id ||
        unreadCount === 0
      ) {
        return;
      }

      console.log(
        "MARK ALL AS READ CLICKED"
      );

      // =======================================
      // UPDATE UI
      // =======================================

      setNotifications(
        (prev) =>
          prev.map(
            (notification) => ({
              ...notification,
              is_read: true,
            })
          )
      );

      // =======================================
      // UPDATE DATABASE
      // =======================================

      try {
        const { error } =
          await supabase
            .from("notifications")
            .update({
              is_read: true,
            })
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "is_read",
              false
            );

        if (error) {
          console.error(
            "MARK ALL READ SUPABASE ERROR:",
            error
          );

          // Reload from database

          const {
            data,
          } =
            await supabase
              .from(
                "notifications"
              )
              .select("*")
              .eq(
                "user_id",
                user.id
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                }
              )
              .limit(30);

          setNotifications(
            data || []
          );

          return;
        }

        console.log(
          "MARK ALL AS READ SUCCESS"
        );
      } catch (error) {
        console.error(
          "MARK ALL READ ERROR:",
          error
        );
      }
    };

  // =========================================
  // DELETE NOTIFICATION
  // =========================================

  const deleteNotification =
    async (
      notificationId
    ) => {
      if (
        !user?.id ||
        !notificationId
      ) {
        return;
      }

      try {
        const { error } =
          await supabase
            .from(
              "notifications"
            )
            .delete()
            .eq(
              "id",
              notificationId
            )
            .eq(
              "user_id",
              user.id
            );

        if (error) {
          throw error;
        }

        setNotifications(
          (prev) =>
            prev.filter(
              (
                notification
              ) =>
                notification.id !==
                notificationId
            )
        );
      } catch (error) {
        console.error(
          "Delete notification error:",
          error
        );
      }
    };

  // =========================================
  // OPEN NOTIFICATION
  // =========================================

  const handleNotificationClick =
    async (
      notification
    ) => {
      if (!notification) {
        return;
      }

      console.log(
        "Notification clicked:",
        notification
      );

      if (
        !notification.is_read
      ) {
        await markAsRead(
          notification.id
        );
      }

      setOpen(false);

      // =======================================
      // OPEN RELATED TASK
      // =======================================

      if (
        notification.task_id
      ) {
        window.location.href =
          `/tasks?task=${encodeURIComponent(
            notification.task_id
          )}`;
      }
    };

  // =========================================
  // TIME AGO
  // =========================================

  const formatTimeAgo = (
    createdAt
  ) => {
    if (!createdAt) {
      return "";
    }

    const created =
      new Date(
        createdAt
      );

    const now =
      new Date();

    const seconds =
      Math.floor(
        (now - created) /
          1000
      );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    if (days < 7) {
      return `${days}d ago`;
    }

    return created.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // =========================================
  // ICON
  // =========================================

  const getNotificationIcon =
    (type) => {
      switch (type) {
        case "task_completed":
          return "✓";

        case "task_created":
          return "+";

        case "task_updated":
          return "✎";

        case "task_overdue":
          return "!";

        case "task_due_today":
          return "•";

        case "task_upcoming":
          return "◷";

        case "productivity":
          return "↗";

        default:
          return "•";
      }
    };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="relative z-[100]">

      {/* ================================= */}
      {/* BELL */}
      {/* ================================= */}

      <button
        type="button"
        onClick={() =>
          setOpen(
            (prev) => !prev
          )
        }
        className="
          relative
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-slate-800
          bg-slate-900/70
          text-slate-400
          transition
          hover:border-slate-700
          hover:bg-slate-800
          hover:text-white
        "
        aria-label="Notifications"
      >
        <FiBell size={19} />

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              min-h-[18px]
              min-w-[18px]
              items-center
              justify-center
              rounded-full
              border-2
              border-slate-950
              bg-red-500
              px-1
              text-[9px]
              font-bold
              text-white
            "
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* ================================= */}
      {/* DROPDOWN */}
      {/* ================================= */}

      {open && (
        <>
          {/* BACKDROP */}

          <div
            className="
              fixed
              inset-0
              z-[90]
            "
            onClick={() =>
              setOpen(false)
            }
          />

          {/* PANEL */}

          <div
            className="
              absolute
              right-0
              top-12
              z-[110]
              w-[360px]
              overflow-hidden
              rounded-2xl
              border
              border-slate-800
              bg-slate-950
              shadow-2xl
              shadow-black/50
            "
          >

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-800
                px-4
                py-3
              "
            >

              <div>

                <h3 className="text-sm font-semibold text-white">
                  Notifications
                </h3>

                <p className="mt-0.5 text-[11px] text-slate-600">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </p>

              </div>

              <div className="flex items-center gap-1">

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      markAllAsRead();
                    }}
                    className="
                      relative
                      z-[120]
                      rounded-lg
                      px-2
                      py-1.5
                      text-[11px]
                      font-medium
                      text-blue-400
                      transition
                      hover:bg-blue-500/10
                      hover:text-blue-300
                    "
                  >
                    Mark all read
                  </button>
                )}

                <button
                  type="button"
                  onClick={(
                    event
                  ) => {
                    event.stopPropagation();

                    setOpen(
                      false
                    );
                  }}
                  className="
                    relative
                    z-[120]
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-600
                    transition
                    hover:bg-slate-800
                    hover:text-white
                  "
                  aria-label="Close notifications"
                >
                  <FiX size={15} />
                </button>

              </div>

            </div>

            {/* ================================= */}
            {/* BODY */}
            {/* ================================= */}

            <div className="max-h-[420px] overflow-y-auto">

              {loading ? (

                <div className="px-4 py-10 text-center">

                  <div
                    className="
                      mx-auto
                      h-6
                      w-6
                      animate-spin
                      rounded-full
                      border-2
                      border-slate-800
                      border-t-blue-500
                    "
                  />

                  <p className="mt-3 text-xs text-slate-600">
                    Loading notifications...
                  </p>

                </div>

              ) : notifications.length ===
                0 ? (

                <div className="px-5 py-12 text-center">

                  <div
                    className="
                      mx-auto
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-900
                      text-slate-600
                    "
                  >
                    <FiCheck size={22} />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-400">
                    You're all caught up
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    No new notifications.
                  </p>

                </div>

              ) : (

                <div>

                  {notifications.map(
                    (
                      notification
                    ) => (

                      <div
                        key={
                          notification.id
                        }
                        className={`
                          border-b
                          border-slate-900
                          px-4
                          py-3
                          transition
                          ${
                            !notification.is_read
                              ? "bg-blue-500/[0.03]"
                              : ""
                          }
                        `}
                      >

                        <div className="flex gap-3">

                          {/* ICON */}

                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              text-sm
                              font-bold
                              ${
                                notification.type ===
                                "task_completed"
                                  ? "bg-green-500/10 text-green-400"
                                  : notification.type ===
                                    "task_overdue"
                                  ? "bg-red-500/10 text-red-400"
                                  : notification.type ===
                                    "task_due_today"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-blue-500/10 text-blue-400"
                              }
                            `}
                          >
                            {getNotificationIcon(
                              notification.type
                            )}
                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            {/* CLICKABLE NOTIFICATION */}

                            <button
                              type="button"
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                              className="
                                block
                                w-full
                                cursor-pointer
                                text-left
                              "
                            >

                              <div className="flex items-start justify-between gap-2">

                                <p
                                  className={`
                                    text-xs
                                    font-semibold
                                    transition
                                    ${
                                      notification.is_read
                                        ? "text-slate-500"
                                        : "text-slate-200"
                                    }
                                    hover:text-blue-400
                                  `}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                {!notification.is_read && (
                                  <span
                                    className="
                                      mt-1
                                      h-1.5
                                      w-1.5
                                      shrink-0
                                      rounded-full
                                      bg-blue-400
                                    "
                                  />
                                )}

                              </div>

                              {notification.message && (
                                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                                  {
                                    notification.message
                                  }
                                </p>
                              )}

                            </button>

                            {/* FOOTER */}

                            <div className="mt-1.5 flex items-center justify-between">

                              <span className="text-[10px] text-slate-700">
                                {formatTimeAgo(
                                  notification.created_at
                                )}
                              </span>

                              <div className="flex items-center gap-1">

                                {/* MARK AS READ */}

                                {!notification.is_read && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      markAsRead(
                                        notification.id
                                      )
                                    }
                                    className="
                                      relative
                                      z-[120]
                                      rounded-md
                                      p-1.5
                                      text-slate-500
                                      transition
                                      hover:bg-blue-500/10
                                      hover:text-blue-400
                                    "
                                    title="Mark as read"
                                  >
                                    <FiCheck
                                      size={13}
                                    />
                                  </button>
                                )}

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteNotification(
                                      notification.id
                                    )
                                  }
                                  className="
                                    relative
                                    z-[120]
                                    rounded-md
                                    p-1.5
                                    text-slate-500
                                    transition
                                    hover:bg-red-500/10
                                    hover:text-red-400
                                  "
                                  title="Delete"
                                >
                                  <FiTrash2
                                    size={13}
                                  />
                                </button>

                              </div>

                            </div>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>
        </>
      )}

    </div>
  );
}

export default NotificationBell;