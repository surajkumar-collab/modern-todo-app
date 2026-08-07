function Auth() {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-16">
        <div className="max-w-lg">
          <h1 className="text-6xl font-bold text-white">
            Task<span className="text-blue-500">Flow</span>
          </h1>

          <p className="mt-6 text-2xl text-slate-300">
            Organize your work.
            <br />
            Simplify your life.
          </p>

          <p className="mt-8 text-slate-500 leading-7">
            Stay productive with a modern task manager built for students,
            developers, freelancers, and professionals.
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">

          <h2 className="text-3xl font-bold text-white">
            Welcome Back 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Sign in to continue.
          </p>

          <div className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Sign In
            </button>

          </div>

          <p className="mt-8 text-center text-slate-400">
            Don't have an account?{" "}
            <span className="cursor-pointer font-semibold text-blue-500 hover:text-blue-400">
              Sign Up
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Auth;