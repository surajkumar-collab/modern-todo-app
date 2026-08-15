import { NavLink, Outlet } from "react-router-dom";

import {
  FiHome,
  FiCheckSquare,
  FiBarChart2,
  FiCalendar,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

function AppLayout({ user, onLogout }) {
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
    {
      name: "Settings",
      path: "/settings",
      icon: FiSettings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="flex min-h-screen">

        {/* ========================================= */}
        {/* DESKTOP SIDEBAR */}
        {/* ========================================= */}

        <aside
          className="
            group
            hidden
            w-20
            shrink-0
            overflow-hidden
            border-r
            border-slate-800
            bg-slate-950
            transition-all
            duration-300
            ease-in-out
            hover:w-64
            lg:flex
            lg:flex-col
          "
        >

          {/* ========================================= */}
          {/* LOGO */}
          {/* ========================================= */}

          <div
            className="
              flex
              h-20
              shrink-0
              items-center
              border-b
              border-slate-800
              px-5
            "
          >

            <div className="flex min-w-[224px] items-center">

              {/* Logo mark */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/10
                  text-lg
                  font-bold
                  text-blue-400
                "
              >
                T
              </div>

              {/* Logo text */}

              <div
                className="
                  ml-3
                  min-w-0
                  opacity-0
                  transition-all
                  duration-200
                  group-hover:opacity-100
                "
              >

                <h1 className="whitespace-nowrap text-xl font-bold tracking-tight text-white">
                  TaskFlow
                </h1>

                <p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
                  Productivity workspace
                </p>

              </div>

            </div>

          </div>

          {/* ========================================= */}
          {/* NAVIGATION */}
          {/* ========================================= */}

          <nav className="flex-1 space-y-1 overflow-hidden px-3 py-6">

            {/* Section title */}

            <div className="mb-3 h-4 overflow-hidden px-3">

              <p
                className="
                  whitespace-nowrap
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-slate-600
                  opacity-0
                  transition-opacity
                  duration-200
                  group-hover:opacity-100
                "
              >
                Workspace
              </p>

            </div>

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.name}
                  className={({ isActive }) =>
                    `
                    group/nav
                    flex
                    h-12
                    items-center
                    gap-3
                    overflow-hidden
                    rounded-xl
                    px-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${
                      isActive
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                    }
                    `
                  }
                >

                  {({ isActive }) => (
                    <>

                      {/* Icon */}

                      <Icon
                        size={20}
                        className={`
                          ml-0.5
                          shrink-0
                          transition-colors
                          duration-200

                          ${
                            isActive
                              ? "text-blue-400"
                              : "text-slate-600 group-hover/nav:text-slate-400"
                          }
                        `}
                      />

                      {/* Label */}

                      <span
                        className="
                          whitespace-nowrap
                          opacity-0
                          transition-all
                          duration-200
                          group-hover:translate-x-0
                          group-hover:opacity-100
                        "
                      >
                        {item.name}
                      </span>

                      {/* Active indicator */}

                      {isActive && (
                        <span
                          className="
                            ml-auto
                            h-1.5
                            w-1.5
                            shrink-0
                            rounded-full
                            bg-blue-400
                            opacity-0
                            transition-opacity
                            duration-200
                            group-hover:opacity-100
                          "
                        />
                      )}

                    </>
                  )}

                </NavLink>
              );
            })}

          </nav>

          {/* ========================================= */}
          {/* USER AREA */}
          {/* ========================================= */}

          <div className="shrink-0 border-t border-slate-800 p-3">

            {/* User card */}

            <NavLink
              to="/profile"
              title="View Profile"
              className="
                group/profile
                mb-2
                flex
                h-14
                items-center
                overflow-hidden
                rounded-xl
                bg-slate-900/60
                px-2.5
                transition
                hover:bg-slate-900
              "
            >

              {/* Avatar */}

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-500/10
                  text-sm
                  font-semibold
                  text-blue-400
                "
              >
                {(
                  user?.user_metadata?.display_name ||
                  user?.email ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              {/* User details */}

              <div
                className="
                  ml-3
                  min-w-0
                  opacity-0
                  transition-opacity
                  duration-200
                  group-hover:opacity-100
                "
              >

                <p className="truncate whitespace-nowrap text-sm font-semibold text-slate-200">
                  {user?.user_metadata?.display_name ||
                    user?.email?.split("@")[0] ||
                    "User"}
                </p>

                <p className="mt-0.5 whitespace-nowrap text-xs text-slate-600">
                  View Profile
                </p>

              </div>

            </NavLink>

            {/* Logout */}

            <button
              type="button"
              onClick={onLogout}
              title="Log out"
              className="
                flex
                h-12
                w-full
                items-center
                gap-3
                overflow-hidden
                rounded-xl
                px-3
                text-sm
                font-medium
                text-slate-500
                transition
                hover:bg-red-500/10
                hover:text-red-400
              "
            >

              <FiLogOut
                size={20}
                className="ml-0.5 shrink-0"
              />

              <span
                className="
                  whitespace-nowrap
                  opacity-0
                  transition-opacity
                  duration-200
                  group-hover:opacity-100
                "
              >
                Log out
              </span>

            </button>

          </div>

        </aside>

        {/* ========================================= */}
        {/* MAIN AREA */}
        {/* ========================================= */}

        <main className="min-w-0 flex-1">

          {/* ========================================= */}
          {/* MOBILE HEADER */}
          {/* ========================================= */}

          <div
            className="
              sticky
              top-0
              z-40
              flex
              h-16
              items-center
              border-b
              border-slate-800
              bg-slate-950/90
              px-4
              backdrop-blur
              lg:hidden
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/10
                  font-bold
                  text-blue-400
                "
              >
                T
              </div>

              <h1 className="text-lg font-bold text-white">
                TaskFlow
              </h1>

            </div>

          </div>

          {/* ========================================= */}
          {/* PAGE CONTENT */}
          {/* ========================================= */}

          <div className="min-w-0">
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
}

export default AppLayout;