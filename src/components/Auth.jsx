import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";

function Auth() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">

      {/* Background Glow */}
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl"></div>

      {/* Left Section */}
      <div className="hidden w-1/2 items-center justify-center p-16 lg:flex">
        <div className="max-w-lg">

          <h1 className="text-6xl font-bold text-white">
            Task<span className="text-blue-500">Flow</span>
          </h1>

          <p className="mt-6 text-2xl text-slate-300">
            Organize your work.
            <br />
            Simplify your life.
          </p>

          <p className="mt-8 leading-7 text-slate-500">
            Stay productive with a modern task manager built for students,
            developers, freelancers, and professionals.
          </p>

        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-xl"
        >

          <h2 className="text-3xl font-bold text-white">
            Welcome Back 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Sign in to continue.
          </p>

          <div className="mt-8 space-y-5">

            {/* Email */}

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

            {/* Password */}

            <div>

              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-white outline-none transition focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>

              </div>

            </div>

            {/* Button */}

            <button
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition duration-300 hover:scale-[1.02] hover:bg-blue-700 active:scale-95"
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

        </motion.div>

      </div>

    </div>
  );
}

export default Auth;