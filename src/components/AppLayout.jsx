import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import {
  FiHome,
  FiCheckSquare,
  FiBarChart2,
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiChevronRight,
  FiLayers,
} from "react-icons/fi";

import { supabase } from "../supabaseClient";

function AppLayout({ user, onLogout }) {
  const [profile, setProfile] = useState(null);

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

  const avatarUrl = profile?.avatar_url
    ? `${profile.avatar_url}${
        profile.avatar_url.includes("?")
          ? "&"
          : "?"
      }t=${Date.now()}`
    : null;

  const avatarInitial =
    displayName
      .charAt(0)
      .toUpperCase();

  // =========================================================
  // NAV ITEM
  // =========================================================

  const renderNavItem = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
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
        {({ isActive }) => (
          <>
            {/* ========================================= */}
            {/* ACTIVE LEFT INDICATOR */}
            {/* ========================================= */}

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

            {/* ========================================= */}
            {/* ICON */}
            {/* ========================================= */}

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

            {/* ========================================= */}
            {/* TEXT */}
            {/* ========================================= */}

            <span className="relative z-10 flex-1">
              {item.name}
            </span>

            {/* ========================================= */}
            {/* CHEVRON */}
            {/* ========================================= */}

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

            {/* ========================================= */}
            {/* HOVER GLOW */}
            {/* ========================================= */}

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

          {/* ================================================= */}
          {/* BRAND */}
          {/* ================================================= */}

          <div
            className="
              flex h-[88px] shrink-0
              items-center
              border-b border-slate-800/80
              px-6
            "
          >

            <div
              className="
                group flex items-center gap-3
              "
            >

              {/* LOGO */}

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
                    absolute
                    -right-0.5
                    -top-0.5
                    h-2 w-2
                    rounded-full
                    bg-cyan-400
                    shadow-lg
                    shadow-cyan-400/50
                  "
                />

              </div>

              {/* BRAND TEXT */}

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

          {/* ================================================= */}
          {/* SIDEBAR CONTENT */}
          {/* ================================================= */}

          <div
            className="
              flex min-h-0 flex-1
              flex-col
              px-4 py-6
            "
          >

            {/* ================================================= */}
            {/* WORKSPACE */}
            {/* ================================================= */}

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

            {/* ================================================= */}
            {/* DIVIDER */}
            {/* ================================================= */}

            <div className="my-6 border-t border-slate-800/70" />

            {/* ================================================= */}
            {/* MANAGEMENT */}
            {/* ================================================= */}

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

            {/* ================================================= */}
            {/* SPACER */}
            {/* ================================================= */}

            <div className="flex-1" />

            {/* ================================================= */}
            {/* PROFILE CARD */}
            {/* ================================================= */}

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

              {/* PROFILE HOVER GLOW */}

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

                {/* AVATAR */}

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
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    avatarInitial
                  )}

                </div>

                {/* USER */}

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

                {/* CHEVRON */}

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

            {/* ================================================= */}
            {/* LOGOUT */}
            {/* ================================================= */}

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
        {/* MAIN CONTENT */}
        {/* ================================================= */}

        <main
          className="
            min-w-0 flex-1
            lg:ml-[250px]
          "
        >

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

            {/* MOBILE BRAND */}

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

            {/* MOBILE PROFILE */}

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

          {/* ================================================= */}
          {/* PAGE CONTENT */}
          {/* ================================================= */}

          <div className="min-w-0">
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
}

export default AppLayout;