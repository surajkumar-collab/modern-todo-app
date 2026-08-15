import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiSave,
  FiCamera,
  FiTrash2,
} from "react-icons/fi";

import { supabase } from "../supabaseClient";

function Profile({ user }) {
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );

  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url || ""
  );

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [previewUrl, setPreviewUrl] =
    useState(
      user?.user_metadata?.avatar_url || ""
    );

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =========================================
  // LOAD USER DATA
  // =========================================

  useEffect(() => {
    const name =
      user?.user_metadata?.full_name || "";

    const avatar =
      user?.user_metadata?.avatar_url || "";

    setFullName(name);
    setAvatarUrl(avatar);
    setPreviewUrl(avatar);
  }, [user]);

  // =========================================
  // DISPLAY NAME
  // =========================================

  const displayName =
    fullName ||
    user?.email?.split("@")[0] ||
    "User";

  // =========================================
  // SELECT PHOTO
  // =========================================

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      setError(
        "Image must be smaller than 2MB."
      );

      event.target.value = "";
      return;
    }

    // Image validation
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const localPreview =
      URL.createObjectURL(file);

    setPreviewUrl(localPreview);
  };

  // =========================================
  // UPLOAD AVATAR
  // =========================================

  const uploadAvatar = async () => {
    if (!selectedFile || !user?.id) {
      return avatarUrl;
    }

    try {
      setUploading(true);
      setError("");

      const fileExtension =
        selectedFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath = `${user.id}/avatar.${fileExtension}`;

      // Upload / replace existing avatar
      const {
        error: uploadError,
      } = await supabase.storage
        .from("avatars")
        .upload(
          filePath,
          selectedFile,
          {
            cacheControl: "3600",
            upsert: true,
            contentType:
              selectedFile.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: publicUrlData,
      } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl =
        publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Could not generate avatar URL."
        );
      }

      // Cache-busting
      const finalUrl =
        `${publicUrl}?t=${Date.now()}`;

      setAvatarUrl(finalUrl);
      setPreviewUrl(finalUrl);
      setSelectedFile(null);

      return finalUrl;
    } catch (uploadError) {
      console.error(
        "Avatar upload error:",
        uploadError
      );

      throw uploadError;
    } finally {
      setUploading(false);
    }
  };

  // =========================================
  // REMOVE AVATAR
  // =========================================

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setAvatarUrl("");
    setPreviewUrl("");

    setMessage(
      "Photo will be removed when you save."
    );
  };

  // =========================================
  // SAVE PROFILE
  // =========================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      let finalAvatarUrl =
        avatarUrl;

      // Upload selected image
      if (selectedFile) {
        finalAvatarUrl =
          await uploadAvatar();
      }

      // Update Supabase user metadata
      const {
        data,
        error: updateError,
      } = await supabase.auth.updateUser({
        data: {
          full_name:
            fullName.trim(),
          avatar_url:
            finalAvatarUrl || null,
        },
      });

      if (updateError) {
        throw updateError;
      }

      // Update local state
      const updatedAvatar =
        data?.user?.user_metadata
          ?.avatar_url ||
        finalAvatarUrl ||
        "";

      setAvatarUrl(updatedAvatar);
      setPreviewUrl(updatedAvatar);

      setMessage(
        "Profile updated successfully."
      );
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

          {/* PROFILE HEADER */}

          <div className="border-b border-slate-800 p-6 sm:p-8">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* AVATAR */}

              <div className="relative">

                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-blue-500/10 text-3xl font-bold text-blue-400 ring-2 ring-slate-800">

                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    displayName
                      .charAt(0)
                      .toUpperCase()
                  )}

                </div>

                {/* CAMERA BUTTON */}

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 shadow-lg transition hover:bg-slate-800 hover:text-white"
                  title="Change photo"
                >
                  <FiCamera size={16} />

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />
                </label>

              </div>

              {/* USER INFO */}

              <div className="min-w-0">

                <h2 className="truncate text-xl font-semibold text-white">
                  {displayName}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {user?.email ||
                    "No email"}
                </p>

                <p className="mt-2 text-xs text-slate-600">
                  JPG, PNG or WebP • Max 2MB
                </p>

              </div>

            </div>

            {/* REMOVE PHOTO */}

            {previewUrl && (
              <button
                type="button"
                onClick={
                  handleRemoveAvatar
                }
                className="mt-5 flex items-center gap-2 text-xs font-medium text-red-400 transition hover:text-red-300"
              >
                <FiTrash2 size={14} />

                Remove photo
              </button>
            )}

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
                onChange={(event) => {
                  setFullName(
                    event.target.value
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
                value={
                  user?.email || ""
                }
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-500 outline-none"
              />

              <p className="mt-2 text-xs text-slate-600">
                Your email is managed by your authentication account.
              </p>

            </div>

            {/* SUCCESS */}

            {message && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
                {message}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* SAVE */}

            <div className="flex justify-end">

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  uploading
                }
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <FiSave size={17} />

                {uploading
                  ? "Uploading..."
                  : saving
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