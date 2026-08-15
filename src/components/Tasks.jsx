import TaskList from "./TaskList";

function Tasks({ user }) {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-400">
            WORKSPACE
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">
            Tasks
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage, organize and complete your tasks.
          </p>
        </div>

        <TaskList user={user} />

      </div>
    </div>
  );
}

export default Tasks;