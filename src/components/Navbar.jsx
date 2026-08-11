import { FiLogOut, FiMenu, FiSearch } from "react-icons/fi";

function Navbar({
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
}) {
  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between px-6 lg:px-10">

        {/* ========================= */}
        {/* LOGO */}
        {/* ========================= */}

        <div className="flex items-center gap-3">

          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            title="Menu"
          >
            <FiMenu size={22} />
          </button>

          <h1 className="text-2xl font-extrabold tracking-tight">
            Task
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Flow
            </span>
          </h1>

        </div>

        {/* ========================= */}
        {/* SEARCH */}
        {/* ========================= */}

        <div className="hidden w-full max-w-md items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 md:flex">

          <FiSearch className="shrink-0 text-slate-500" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search tasks..."
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />

        </div>

        {/* ========================= */}
        {/* USER */}
        {/* ========================= */}

        <div className="flex items-center gap-4">

          <div className="hidden text-right sm:block">

            <p className="text-sm font-medium text-white">
              {userName}
            </p>

            <p className="text-xs text-slate-500">
              {user?.email}
            </p>

          </div>

          {/* Avatar */}

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white">
            {userName
              .charAt(0)
              .toUpperCase()}
          </div>

          {/* Logout */}

          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            className="rounded-xl p-2.5 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <FiLogOut size={20} />
          </button>

        </div>

      </div>
    </header>
  );
}

export default Navbar;