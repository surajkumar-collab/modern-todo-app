import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiCamera,
  FiSave,
  FiCheckCircle,
  FiList,
  FiTrendingUp,
} from "react-icons/fi";

import { supabase } from "../supabaseClient";

function Profile({ user }) {
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    avatar: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    rate: 0,
  });

  const [saved, setSaved] = useState(false);

  // =========================================
  // LOAD PROFILE
  // =========================================

  useEffect(() => {
    const storedProfile =
      localStorage.getItem(
        "taskflow-profile"
      );

    if (storedProfile) {
      try {
        setProfile(
          JSON.parse(storedProfile)
        );
      } catch (error) {
        console.error(
          "Profile load error:",
          error
        );
      }
    } else {
      setProfile({
        name:
          user?.user_metadata?.name ||
          user?.user_metadata?.full_name ||
          "",
        bio: "Developer & Student",
        avatar: "",
      });
    }
  }, [user]);

  // =========================================
  // LOAD TASK STATS
  // =========================================

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        const { data, error } =
          await supabase
            .from("tasks")
            .select("completed")
            .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        const tasks = data || [];

        const total = tasks.length;

        const completed =
          tasks.filter(
            (task) =>
              task.completed === true
          ).length;

        const active =
          total - completed;

        const rate =
          total > 0
            ? Math.round(
                (completed / total) * 100
              )
            : 0;

        setStats({
          total,
          completed,
          active,
          rate,
        });
      } catch (error) {
        console.error(
          "Profile stats error:",
          error
        );
      }
    };

    fetchStats();
  }, [user]);

  // =========================================
  // UPDATE PROFILE
  // =========================================

  const updateProfile = (
    key,
    value
  ) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  // =========================================
  // IMAGE UPLOAD
  // =========================================

  const handleAvatarChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    // 2 MB limit
    if (file.size > 2 * 1024 * 1024) {
      alert(
        "Please choose an image smaller than 2MB."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      updateProfile(
        "avatar",
        reader.result
      );
    };

    reader.readAsDataURL(file);
  };

  // =========================================
  // SAVE PROFILE
  // =========================================

  const handleSave = () => {
    try {
      localStorage.setItem(
        "taskflow-profile",
        JSON.stringify(profile)
      );

      //Tell the rest of the app that profile changed

      window.dispatchEvent(
        new Event(
            "taskflow-profile-updated"
        )
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );
    }
  };

  // =========================================
  // INITIAL
  // =========================================

  const displayName =
    profile.name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials =
    displayName
      .charAt(0)
      .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white transition-colors duration-300 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

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
            Manage your personal TaskFlow profile.
          </p>

        </div>

        {/* ================================= */}
        {/* PROFILE HERO */}
        {/* ================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">

          <div className="h-32 bg-gradient-to-r from-blue-600/20 via-cyan-500/10 to-purple-600/20" />

          <div className="px-5 pb-6 sm:px-8">

            <div className="-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              {/* AVATAR */}

              <div className="relative">

                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-slate-900 bg-slate-800 text-4xl font-bold text-blue-400">

                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}

                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-slate-900 bg-blue-600 text-white shadow-lg transition hover:bg-blue-500"
                >
                  <FiCamera size={17} />

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={
                      handleAvatarChange
                    }
                  />
                </label>

              </div>

              {/* NAME */}

              <div className="sm:pb-1">

                <h2 className="text-2xl font-bold text-white">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {user?.email}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <section className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon={FiList}
            label="Total Tasks"
            value={stats.total}
          />

          <StatCard
            icon={FiCheckCircle}
            label="Completed"
            value={stats.completed}
          />

          <StatCard
            icon={FiTrendingUp}
            label="Active"
            value={stats.active}
          />

          <StatCard
            icon={FiCheckCircle}
            label="Completion Rate"
            value={`${stats.rate}%`}
          />

        </section>

        {/* ================================= */}
        {/* PROFILE FORM */}
        {/* ================================= */}

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60">

          <div className="flex items-center gap-3 border-b border-slate-800 p-5 sm:p-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
              <FiUser size={19} />
            </div>

            <div>

              <h2 className="font-semibold text-white">
                Personal Information
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Update your profile information.
              </p>

            </div>

          </div>

          <div className="space-y-5 p-5 sm:p-6">

            {/* NAME */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Display Name
              </label>

              <div className="relative">

                <FiUser
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    updateProfile(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <div className="relative">

                <FiMail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  type="email"
                  value={
                    user?.email || ""
                  }
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-slate-500 outline-none"
                />

              </div>

              <p className="mt-2 text-xs text-slate-600">
                Your authentication email cannot be changed here.
              </p>

            </div>

            {/* BIO */}

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Bio
              </label>

              <textarea
                value={profile.bio}
                onChange={(e) =>
                  updateProfile(
                    "bio",
                    e.target.value
                  )
                }
                placeholder="Tell something about yourself..."
                rows={4}
                maxLength={160}
                className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <p className="mt-2 text-right text-xs text-slate-600">
                {profile.bio.length}/160
              </p>

            </div>

          </div>

        </section>

        {/* ================================= */}
        {/* SAVE */}
        {/* ================================= */}

        <div className="sticky bottom-4 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">

          <div>

            {saved ? (
              <p className="text-sm font-medium text-green-400">
                Profile saved successfully.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Your profile is stored on this device.
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >

            <FiSave size={17} />

            Save Profile

          </button>

        </div>

      </div>

    </div>
  );
}

// =========================================
// STAT CARD
// =========================================

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        <Icon size={18} />
      </div>

      <p className="mt-4 text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

export default Profile;