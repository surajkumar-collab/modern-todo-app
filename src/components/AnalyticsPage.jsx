import { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";
import Analytics from "./Analytics";

function AnalyticsPage({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchTasks() {
      try {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw error;
        }

        if (mounted) {
          setTasks(data || []);
        }
      } catch (error) {
        console.error(
          "Analytics fetch tasks error:",
          error
        );

        if (mounted) {
          setError(
            "Unable to load analytics data."
          );
          setTasks([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchTasks();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-800" />

            <div className="mt-3 h-9 w-48 animate-pulse rounded bg-slate-800" />

            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-800" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60"
                />
              )
            )}

          </div>

        </div>

      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">

            <h1 className="text-xl font-semibold text-white">
              Analytics unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =========================================
  // ANALYTICS
  // =========================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            PRODUCTIVITY
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Analytics
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Understand your productivity and progress.
          </p>

        </div>

        <Analytics tasks={tasks} />

      </div>

    </div>
  );
}

export default AnalyticsPage;