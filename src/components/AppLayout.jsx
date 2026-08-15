import { NavLink, Outlet } from "react-router-dom";

import {
  FiHome,
  FiCheckSquare,
  FiBarChart2,
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiUser,
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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarLetter =
    displayName
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <div className="flex min-h-screen">

        {/* ================================= */}
        {/* SIDEBAR */}
        {/* ================================= */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">

          {/* ================================= */}
          {/* LOGO */}
          {/* ================================= */}

          <div className="flex h-20 items-center border-b border-slate-800 px-6">

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                TaskFlow
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                Productivity workspace
              </p>
            </div>

          </div>

          {/* ================================= */}
          {/* NAVIGATION */}
          {/* ================================= */}

          <nav className="flex-1 space-y-1 px-3 py-6">

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Workspace
            </p>

            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={18}
                        className={
                          isActive
                            ? "text-blue-400"
                            : "text-slate-600 group-hover:text-slate-400"
                        }
                      />

                      <span>
                        {item.name}
                      </span>

                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

          </nav>

          {/* ================================= */}
          {/* USER AREA */}
          {/* ================================= */}

          <div className="border-t border-slate-800 p-4">

            {/* PROFILE LINK */}

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `mb-3 block rounded-xl p-3 transition ${
                  isActive
                    ? "bg-blue-500/10"
                    : "bg-slate-900/60 hover:bg-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">

                  {/* AVATAR */}

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isActive
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {avatarLetter}
                  </div>

                  {/* INFO */}

                  <div className="min-w-0">

                    <p
                      className={`truncate text-sm font-medium ${
                        isActive
                          ? "text-blue-400"
                          : "text-slate-200"
                      }`}
                    >
                      {displayName}
                    </p>

                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                      <FiUser size={11} />

                      View Profile
                    </p>

                  </div>

                </div>
              )}
            </NavLink>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
            >

              <FiLogOut size={18} />

              <span>
                Log out
              </span>

            </button>

          </div>

        </aside>

        {/* ================================= */}
        {/* MAIN AREA */}
        {/* ================================= */}

        <main className="min-w-0 flex-1">

          {/* ================================= */}
          {/* MOBILE HEADER */}
          {/* ================================= */}

          <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur lg:hidden">

            <h1 className="text-lg font-bold text-white">
              TaskFlow
            </h1>

            <NavLink
              to="/profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-400"
            >
              {avatarLetter}
            </NavLink>

          </div>

          {/* ================================= */}
          {/* PAGE CONTENT */}
          {/* ================================= */}

          <div className="min-w-0">
            <Outlet />
          </div>

        </main>

      </div>

    </div>
  );
}

export default AppLayout;