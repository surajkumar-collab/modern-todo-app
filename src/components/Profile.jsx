import { useState } from "react";
import {
  FiUser,
  FiMail,
  FiSave,
} from "react-icons/fi";

function Profile({ user }) {
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const displayName =
    fullName ||
    user?.email?.split("@")[0] ||
    "User";

  // =========================================
  // SAVE PROFILE
  // =========================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      // Supabase connection will be added
      // in the next step.

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setMessage(
        "Profile saved successfully."
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            ACCOUNT
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your personal information.
          </p>

        </div>

        {/* ================================= */}
        {/* PROFILE CARD */}
        {/* ================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">

          {/* ================================= */}
          {/* PROFILE HEADER */}
          {/* ================================= */}

          <div className="border-b border-slate-800 p-6 sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* AVATAR */}

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-2xl font-bold text-blue-400 ring-1 ring-blue-500/20">

                {displayName
                  .charAt(0)
                  .toUpperCase()}

              </div>

              {/* USER INFO */}

              <div className="min-w-0">

                <h2 className="truncate text-xl font-semibold text-white">
                  {displayName}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {user?.email || "No email"}
                </p>

              </div>

            </div>

          </div>

          {/* ================================= */}
          {/* FORM */}
          {/* ================================= */}

          <div className="space-y-6 p-6 sm:p-8">

            {/* FULL NAME */}

            <div>

              <label
                htmlFor="fullName"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <FiUser size={16} />

                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(
                    e.target.value
                  );
                  setMessage("");
                  setError("");
                }}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300"
              >
                <FiMail size={16} />

                Email
              </label>

              <input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-500 outline-none"
              />

              <p className="mt-2 text-xs text-slate-600">
                Your email is managed by your authentication account.
              </p>

            </div>

            {/* SUCCESS MESSAGE */}

            {message && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
                {message}
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* SAVE BUTTON */}

            <div className="flex justify-end">

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <FiSave size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;