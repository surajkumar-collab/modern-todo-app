import { useEffect, useState } from "react";
import { FiCheckSquare, FiClock, FiTrash2 } from "react-icons/fi";
import { supabase } from "../supabaseClient";

function TaskList({ user, refreshKey = 0, onStatsChange }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setTasks(data || []);

      if (onStatsChange) {
        const total = data?.length || 0;
        const completed =
          data?.filter((task) => task.completed).length || 0;
        const active = total - completed;

        onStatsChange({
          total,
          active,
          completed,
        });
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.id, refreshKey]);

  const toggleTask = async (task) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          completed: !task.completed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTasks((prevTasks) =>
        prevTasks.map((item) =>
          item.id === task.id ? data : item
        )
      );

      fetchTasks();
    } catch (error) {
      console.error("Update task error:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskId)
      );

      fetchTasks();
    } catch (error) {
      console.error("Delete task error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/30">
        <p className="text-slate-400">Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 text-center">

        <div className="mb-4 rounded-2xl bg-blue-500/10 p-5 text-blue-400">
          <FiCheckSquare size={32} />
        </div>

        <h4 className="text-lg font-semibold text-white">
          No tasks yet
        </h4>

        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Create your first task and start getting things done.
        </p>

      </div>
    );
  }

  return (
    <div className="space-y-3">

      {tasks.map((task) => (

        <div
          key={task.id}
          className={`group rounded-2xl border p-5 transition ${
            task.completed
              ? "border-green-500/20 bg-green-500/5"
              : "border-slate-800 bg-slate-900/60 hover:border-blue-500/30"
          }`}
        >

          <div className="flex items-start gap-4">

            {/* Checkbox */}

            <button
              onClick={() => toggleTask(task)}
              className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                task.completed
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-slate-600 hover:border-blue-500"
              }`}
            >
              {task.completed && (
                <FiCheckSquare size={16} />
              )}
            </button>

            {/* Content */}

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <h4
                  className={`text-base font-semibold ${
                    task.completed
                      ? "text-slate-500 line-through"
                      : "text-white"
                  }`}
                >
                  {task.title}
                </h4>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    task.priority === "high"
                      ? "bg-red-500/10 text-red-400"
                      : task.priority === "medium"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-green-500/10 text-green-400"
                  }`}
                >
                  {task.priority}
                </span>

                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                  {task.category}
                </span>

              </div>

              {task.description && (
                <p className="mt-2 text-sm text-slate-400">
                  {task.description}
                </p>
              )}

              {task.due_date && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <FiClock size={14} />
                  Due: {task.due_date}
                </div>
              )}

            </div>

            {/* Delete */}

            <button
              onClick={() => deleteTask(task.id)}
              className="rounded-lg p-2 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
              title="Delete task"
            >
              <FiTrash2 size={18} />
            </button>

          </div>

        </div>

      ))}

    </div>
  );
}

export default TaskList;