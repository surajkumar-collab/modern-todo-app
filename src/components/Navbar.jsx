import {
  FiSearch,
} from "react-icons/fi";

function Navbar({
  user,
  searchQuery,
  setSearchQuery,
}) {
  // =========================================================
  // USER NAME
  // =========================================================

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarLetter =
    userName
      .charAt(0)
      .toUpperCase();

  // =========================================================
  // AVATAR URL
  // =========================================================

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

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

      {/* ================================================= */}
      {/* MAIN NAVBAR */}
      {/* ================================================= */}

      <div
        className="
          flex min-h-20
          items-center
          justify-between
          gap-4
          px-4
          sm:px-6
          lg:px-10
        "
      >

        {/* ================================================= */}
        {/* LOGO */}
        {/* ================================================= */}

        <div className="flex shrink-0 items-center">

          <h1
            className="
              text-xl
              font-extrabold
              tracking-tight
              sm:text-2xl
            "
          >
            Task
            <span
              className="
                bg-gradient-to-r
                from-blue-400
                to-cyan-400
                bg-clip-text
                text-transparent
              "
            >
              Flow
            </span>
          </h1>

        </div>

        {/* ================================================= */}
        {/* SEARCH */}
        {/* ================================================= */}

        <div
          className="
            hidden
            w-full
            max-w-md
            items-center
            gap-3
            rounded-xl
            border
            border-slate-800
            bg-slate-900/70
            px-4
            py-2.5
            transition-all
            duration-200
            focus-within:border-blue-500/40
            focus-within:bg-slate-900
            focus-within:shadow-lg
            focus-within:shadow-blue-500/5
            lg:flex
          "
        >

          <FiSearch
            className="
              shrink-0
              text-slate-500
            "
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
              w-full
              bg-transparent
              text-sm
              text-white
              outline-none
              placeholder:text-slate-500
            "
          />

        </div>

        {/* ================================================= */}
        {/* PROFILE PHOTO ONLY */}
        {/* ================================================= */}

        <div className="flex shrink-0 items-center">

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-slate-700
              bg-gradient-to-br
              from-blue-500
              to-cyan-400
              text-sm
              font-bold
              text-white
              transition-all
              duration-200
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
                  h-full
                  w-full
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