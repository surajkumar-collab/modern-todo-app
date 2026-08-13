import { useState } from "react";
import {
  FiLogOut,
  FiMenu,
  FiSearch,
  FiX,
} from "react-icons/fi";

function Navbar({
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarLetter = userName
    .charAt(0)
    .toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">

      {/* ========================= */}
      {/* MAIN NAVBAR */}
      {/* ========================= */}

      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">

        {/* ========================= */}
        {/* LOGO + MENU */}
        {/* ========================= */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (prev) => !prev
              )
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            title={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
          >
            {menuOpen ? (
              <FiX size={22} />
            ) : (
              <FiMenu size={22} />
            )}
          </button>

          {/* LOGO */}

          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Task
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Flow
            </span>
          </h1>

        </div>

        {/* ========================= */}
        {/* DESKTOP SEARCH */}
        {/* ========================= */}

        <div className="hidden w-full max-w-md items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 lg:flex">

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
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />

        </div>

        {/* ========================= */}
        {/* DESKTOP USER */}
        {/* ========================= */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">

          {/* USER INFO */}

          <div className="hidden text-right sm:block">

            <p className="max-w-[160px] truncate text-sm font-medium text-white">
              {userName}
            </p>

            <p className="max-w-[180px] truncate text-xs text-slate-500">
              {user?.email}
            </p>

          </div>

          {/* AVATAR */}

          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-bold text-white sm:h-10 sm:w-10"
            title={userName}
          >
            {avatarLetter}
          </div>

          {/* LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="rounded-xl p-2.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <FiLogOut size={20} />
          </button>

        </div>

      </div>

      {/* ========================= */}
      {/* MOBILE MENU */}
      {/* ========================= */}

      <div
        className={`overflow-hidden border-t border-slate-800/80 transition-all duration-300 lg:hidden ${
          menuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >

        <div className="space-y-4 px-4 py-4 sm:px-6">

          {/* MOBILE SEARCH */}

          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">

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
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />

          </div>

          {/* MOBILE USER INFO */}

          <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
              {avatarLetter}
            </div>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email}
              </p>

            </div>

          </div>

          {/* MOBILE LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
          >
            <FiLogOut size={18} />
            Logout
          </button>

        </div>

      </div>

    </header>
  );
}

export default Navbar;