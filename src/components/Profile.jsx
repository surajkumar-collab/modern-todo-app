import { useEffect, useState } from "react";

import {
  FiUser,
  FiMail,
  FiCamera,
  FiSave,
  FiCheckCircle,
  FiList,
  FiTrendingUp,
  FiTrash2,
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

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // LOAD PROFILE
  // =========================================

  useEffect(() => {
    if (!user?.id) return;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("id, name, bio, avatar_url, updated_at")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        // =====================================
        // PROFILE EXISTS
        // =====================================

        if (data) {
          setProfile({
            name: data.name || "",
            bio: data.bio || "",
            avatar: data.avatar_url || "",
          });

          return;
        }

        // =====================================
        // CREATE PROFILE
        // =====================================

        const defaultName =
          user?.user_metadata?.name ||
          user?.user_metadata?.full_name ||
          user?.email?.split("@")[0] ||
          "User";

        const newProfile = {
          id: user.id,
          name: defaultName,
          bio: "Developer & Student",
          avatar_url: "",
          updated_at: new Date().toISOString(),
        };

        const {
          data: createdProfile,
          error: createError,
        } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select("id, name, bio, avatar_url")
          .single();

        if (createError) {
          throw createError;
        }

        setProfile({
          name: createdProfile?.name || "",
          bio: createdProfile?.bio || "",
          avatar: createdProfile?.avatar_url || "",
        });
      } catch (profileError) {
        console.error("Profile load error:", profileError);

        setError(
          profileError?.message ||
            "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  // =========================================
  // LOAD TASK STATS
  // =========================================

  useEffect(() => {
    if (!user?.id) return;

    async function fetchStats() {
      try {
        const { data, error: statsError } = await supabase
          .from("tasks")
          .select("completed")
          .eq("user_id", user.id);

        if (statsError) {
          throw statsError;
        }

        const tasks = data || [];

        const total = tasks.length;

        const completed = tasks.filter(
          (task) => task.completed === true
        ).length;

        const active = total - completed;

        const rate =
          total > 0
            ? Math.round((completed / total) * 100)
            : 0;

        setStats({
          total,
          completed,
          active,
          rate,
        });
      } catch (statsError) {
        console.error(
          "Profile stats error:",
          statsError
        );
      }
    }

    fetchStats();
  }, [user]);

  // =========================================
  // UPDATE PROFILE STATE
  // =========================================

  function updateProfile(key, value) {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
    setError("");
  }

  // =========================================
  // CONVERT IMAGE TO PNG
  // =========================================

  async function convertImageToPng(file) {
    const imageUrl = URL.createObjectURL(file);

    try {
      const image = new Image();

      image.src = imageUrl;

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const maxSize = 800;

      let width = image.naturalWidth;
      let height = image.naturalHeight;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");

      canvas.width = Math.round(width);
      canvas.height = Math.round(height);

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Unable to process image."
        );
      }

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const pngBlob = await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          "image/png",
          0.9
        );
      });

      if (!pngBlob) {
        throw new Error(
          "Unable to convert image."
        );
      }

      return new File(
        [pngBlob],
        "avatar.png",
        {
          type: "image/png",
        }
      );
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  // =========================================
  // SAVE AVATAR URL TO DATABASE
  // =========================================

  async function saveAvatarToDatabase(avatarUrl) {
    if (!user?.id) {
      throw new Error(
        "User session not available."
      );
    }

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          name: profile.name.trim(),
          bio: profile.bio.trim(),
          avatar_url: avatarUrl || "",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (error) {
      throw error;
    }

    // Update Supabase auth metadata too
    const { error: authError } =
      await supabase.auth.updateUser({
        data: {
          name: profile.name.trim(),
          full_name: profile.name.trim(),
          avatar_url: avatarUrl || "",
        },
      });

    if (authError) {
      console.warn(
        "Auth metadata update warning:",
        authError
      );
    }

    // Tell the rest of TaskFlow that profile changed
    window.dispatchEvent(
      new Event("taskflow-profile-updated")
    );
  }

  // =========================================
  // UPLOAD AVATAR
  // =========================================

  async function uploadAvatar(file) {
    if (!user?.id || !file) {
      return null;
    }

    try {
      setUploading(true);
      setError("");

      // =====================================
      // VALIDATE
      // =====================================

      if (!file.type.startsWith("image/")) {
        throw new Error(
          "Please select a valid image."
        );
      }

      // Allow large original images because
      // we resize them before uploading.
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(
          "Image must be smaller than 10MB."
        );
      }

      // =====================================
      // CONVERT
      // =====================================

      const pngFile =
        await convertImageToPng(file);

      // =====================================
      // FINAL SIZE CHECK
      // =====================================

      if (pngFile.size > 2 * 1024 * 1024) {
        throw new Error(
          "Processed image is still larger than 2MB. Please choose a smaller image."
        );
      }

      // =====================================
      // STORAGE PATH
      // =====================================

      const filePath =
        `${user.id}/avatar.png`;

      // =====================================
      // DELETE OLD AVATAR FIRST
      // =====================================

      const { error: removeOldError } =
        await supabase.storage
          .from("avatars")
          .remove([filePath]);

      // Ignore "not found" style errors
      // because the file may not exist yet.
      if (
        removeOldError &&
        !removeOldError.message
          ?.toLowerCase()
          .includes("not found")
      ) {
        console.warn(
          "Old avatar removal warning:",
          removeOldError
        );
      }

      // =====================================
      // UPLOAD NEW AVATAR
      // =====================================

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(
            filePath,
            pngFile,
            {
              cacheControl: "3600",
              upsert: true,
              contentType: "image/png",
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      // =====================================
      // PUBLIC URL
      // =====================================

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Unable to generate avatar URL."
        );
      }

      // =====================================
      // SAVE URL IN DATABASE IMMEDIATELY
      // =====================================

      await saveAvatarToDatabase(
        publicUrl
      );

      // =====================================
      // CACHE BUST ONLY FOR UI
      // =====================================

      const displayUrl =
        `${publicUrl}?v=${Date.now()}`;

      return displayUrl;
    } catch (uploadError) {
      console.error(
        "Avatar upload error:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Unable to upload image."
      );

      return null;
    } finally {
      setUploading(false);
    }
  }

  // =========================================
  // AVATAR CHANGE
  // =========================================

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const avatarUrl =
      await uploadAvatar(file);

    if (avatarUrl) {
      updateProfile(
        "avatar",
        avatarUrl
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    }

    event.target.value = "";
  }

  // =========================================
  // REMOVE AVATAR
  // =========================================

  async function handleRemoveAvatar() {
    if (!user?.id || uploading) return;

    try {
      setUploading(true);
      setError("");
      setSaved(false);

      const filePath =
        `${user.id}/avatar.png`;

      // =====================================
      // REMOVE STORAGE FILE
      // =====================================

      const { error: storageError } =
        await supabase.storage
          .from("avatars")
          .remove([filePath]);

      if (storageError) {
        console.warn(
          "Avatar storage removal warning:",
          storageError
        );
      }

      // =====================================
      // REMOVE URL FROM DATABASE
      // =====================================

      await saveAvatarToDatabase("");

      // =====================================
      // UPDATE UI
      // =====================================

      setProfile((prev) => ({
        ...prev,
        avatar: "",
      }));

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (removeError) {
      console.error(
        "Remove avatar error:",
        removeError
      );

      setError(
        removeError?.message ||
          "Unable to remove profile photo."
      );
    } finally {
      setUploading(false);
    }
  }

  // =========================================
  // SAVE PROFILE
  // =========================================

  async function handleSave() {
    if (!user?.id) return;

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const cleanName =
        profile.name.trim();

      const cleanBio =
        profile.bio.trim();

      const avatarUrl =
        profile.avatar
          ? profile.avatar.split("?")[0]
          : "";

      // =====================================
      // SAVE DATABASE
      // =====================================

      const { error: updateError } =
        await supabase
          .from("profiles")
          .upsert(
            {
              id: user.id,
              name: cleanName,
              bio: cleanBio,
              avatar_url: avatarUrl,
              updated_at:
                new Date().toISOString(),
            },
            {
              onConflict: "id",
            }
          );

      if (updateError) {
        throw updateError;
      }

      // =====================================
      // UPDATE AUTH METADATA
      // =====================================

      const {
        error: authError,
      } = await supabase.auth.updateUser({
        data: {
          name: cleanName,
          full_name: cleanName,
          avatar_url: avatarUrl,
        },
      });

      if (authError) {
        console.warn(
          "Auth metadata update warning:",
          authError
        );
      }

      // =====================================
      // SYNC APP
      // =====================================

      window.dispatchEvent(
        new Event(
          "taskflow-profile-updated"
        )
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (saveError) {
      console.error(
        "Profile save error:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // DISPLAY DATA
  // =========================================

  const displayName =
    profile.name ||
    user?.email?.split("@")[0] ||
    "User";

  const initials =
    displayName
      .charAt(0)
      .toUpperCase();

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <div className="text-center">

          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-blue-500" />

          <p className="text-sm text-slate-500">
            Loading profile...
          </p>

        </div>

      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white transition-colors duration-300 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

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

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* PROFILE HERO */}

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
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    initials
                  )}

                </div>

                {/* CAMERA */}

                <label
                  htmlFor="avatar-upload"
                  className={`absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-slate-900 bg-blue-600 text-white shadow-lg transition hover:bg-blue-500 ${
                    uploading
                      ? "pointer-events-none opacity-60"
                      : ""
                  }`}
                >

                  {uploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <FiCamera size={17} />
                  )}

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    disabled={uploading}
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

            {/* REMOVE PHOTO */}

            {profile.avatar && (
              <button
                type="button"
                onClick={
                  handleRemoveAvatar
                }
                disabled={uploading}
                className="mt-4 flex items-center gap-2 text-xs font-medium text-red-400 transition hover:text-red-300 disabled:opacity-50"
              >

                <FiTrash2 size={14} />

                Remove photo

              </button>
            )}

          </div>

        </section>

        {/* STATS */}

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

        {/* PERSONAL INFORMATION */}

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
                  value={user?.email || ""}
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

        {/* SAVE BAR */}

        <div className="sticky bottom-4 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">

          <div>

            {saved ? (
              <p className="text-sm font-medium text-green-400">
                Profile saved successfully.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Your profile is synced with your TaskFlow account.
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Saving...
              </>
            ) : (
              <>
                <FiSave size={17} />

                Save Profile
              </>
            )}

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