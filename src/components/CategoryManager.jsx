import { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiTag,
  FiX,
} from "react-icons/fi";
import { supabase } from "../supabaseClient";

function CategoryManager({ user, onClose }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // FETCH CATEGORIES
  // =========================

  const fetchCategories = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error(
        "Fetch categories error:",
        error
      );

      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD CATEGORIES
  // =========================

  useEffect(() => {
    fetchCategories();
  }, [user?.id]);

  // =========================
  // ADD CATEGORY
  // =========================

  const handleAddCategory = async (e) => {
    e.preventDefault();

    const categoryName =
      newCategory.trim();

    if (!categoryName) {
      setError(
        "Please enter a category name."
      );
      return;
    }

    if (!user?.id) {
      setError(
        "User session not found."
      );
      return;
    }

    // Prevent duplicate categories
    const alreadyExists =
      categories.some(
        (category) =>
          category.name
            .toLowerCase() ===
          categoryName.toLowerCase()
      );

    if (alreadyExists) {
      setError(
        "This category already exists."
      );
      return;
    }

    setAdding(true);
    setError("");

    try {
      const { data, error } =
        await supabase
          .from("categories")
          .insert([
            {
              user_id: user.id,
              name: categoryName,
            },
          ])
          .select()
          .single();

      if (error) {
        throw error;
      }

      setCategories((prev) => [
        ...prev,
        data,
      ]);

      setNewCategory("");
    } catch (error) {
      console.error(
        "Add category error:",
        error
      );

      setError(
        error.message ||
          "Failed to add category."
      );
    } finally {
      setAdding(false);
    }
  };

  // =========================
  // DELETE CATEGORY
  // =========================

  const handleDeleteCategory = async (
    categoryId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    if (!user?.id) {
      setError(
        "User session not found."
      );
      return;
    }

    setDeletingId(categoryId);
    setError("");

    try {
      const { error } =
        await supabase
          .from("categories")
          .delete()
          .eq("id", categoryId)
          .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setCategories((prev) =>
        prev.filter(
          (category) =>
            category.id !== categoryId
        )
      );
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete category."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <FiTag size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Categories
              </h2>

              <p className="text-sm text-slate-500">
                Manage your task categories.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Close"
          >
            <FiX size={20} />
          </button>

        </div>

        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ========================= */}
        {/* ADD CATEGORY */}
        {/* ========================= */}

        <form
          onSubmit={handleAddCategory}
          className="mb-6 flex gap-2"
        >

          <input
            type="text"
            value={newCategory}
            onChange={(e) =>
              setNewCategory(
                e.target.value
              )
            }
            placeholder="New category..."
            maxLength={40}
            disabled={adding}
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={
              adding ||
              !newCategory.trim()
            }
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiPlus size={18} />

            {adding
              ? "Adding..."
              : "Add"}
          </button>

        </form>

        {/* ========================= */}
        {/* CATEGORY LIST */}
        {/* ========================= */}

        <div className="max-h-72 space-y-2 overflow-y-auto">

          {/* LOADING */}

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (

            /* EMPTY */

            <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center">

              <FiTag
                size={28}
                className="mx-auto mb-3 text-slate-600"
              />

              <p className="text-sm text-slate-500">
                No custom categories yet.
              </p>

            </div>

          ) : (

            /* CATEGORY ITEMS */

            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-3"
              >

                <div className="flex items-center gap-3">

                  <div className="h-2 w-2 rounded-full bg-blue-400" />

                  <span className="text-sm font-medium text-slate-200">
                    {category.name}
                  </span>

                </div>

                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteCategory(
                      category.id
                    )
                  }
                  disabled={
                    deletingId ===
                    category.id
                  }
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Delete category"
                >
                  {deletingId ===
                  category.id ? (
                    <span className="text-xs font-semibold">
                      ...
                    </span>
                  ) : (
                    <FiTrash2 size={16} />
                  )}
                </button>

              </div>
            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default CategoryManager;