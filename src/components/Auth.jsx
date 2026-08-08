import { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { supabase } from "../supabaseClient";

function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please fill all required fields.");
      return;
    }

    if (!isLogin && !fullName) {
      alert("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (!isLogin) {
  alert("Account created successfully.");
}
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-950">

      {/* Background */}

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>

      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]"></div>

      <div className="absolute bottom-[-150px] right-[-100px] h-[500px] w-[500px] rounded-full bg-cyan-400/15 blur-[120px]"></div>

      {/* Left Side */}

      <div className="relative z-10 hidden w-1/2 items-center justify-center p-16 lg:flex">

        <div className="max-w-xl">

          <h1 className="text-7xl font-extrabold tracking-tight text-white">
            Task
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Flow
            </span>
          </h1>

          <p className="mt-8 text-2xl leading-relaxed text-slate-300">
            Organize your work.
            <br />
            Simplify your life.
          </p>

          <p className="mt-8 leading-8 text-slate-400">
            Stay productive with a modern task manager built for
            students, developers, freelancers, and professionals.
          </p>

          <div className="mt-12 space-y-4">

            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900/70">

              <div className="text-2xl">🚀</div>

              <div>

                <h3 className="font-semibold text-white">
                  Lightning Fast
                </h3>

                <p className="text-sm text-slate-400">
                  Organize your tasks instantly.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900/70">

              <div className="text-2xl">☁️</div>

              <div>

                <h3 className="font-semibold text-white">
                  Cloud Sync
                </h3>

                <p className="text-sm text-slate-400">
                  Access your tasks from anywhere.
                </p>

              </div>

            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900/70">

              <div className="text-2xl">🔒</div>

              <div>

                <h3 className="font-semibold text-white">
                  Secure Authentication
                </h3>

                <p className="text-sm text-slate-400">
                  Powered by Supabase.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Right Side */}

      <div className="relative z-10 flex w-full items-center justify-center p-6 lg:w-1/2">

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-900/60 p-12 shadow-2xl backdrop-blur-xl"
        >
                      <h2 className="text-3xl font-bold text-white">
            {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
          </h2>

          <p className="mt-2 text-slate-400">
            {isLogin
              ? "Sign in to continue."
              : "Create your TaskFlow account."}
          </p>

          <div className="mt-8 space-y-7">

            {!isLogin && (
              <div>

                <label className="mb-3 block text-sm text-slate-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-4 text-lg text-white placeholder:text-slate-500 outline-none transition focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />

              </div>
            )}

            <div>

              <label className="mb-3 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-4 text-lg text-white placeholder:text-slate-500 outline-none transition focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />

            </div>

            <div>

              <label className="mb-3 block text-sm text-slate-300">
                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-4 pr-14 text-lg text-white placeholder:text-slate-500 outline-none transition focus:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                >
                  {showPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>

              </div>

            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please Wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </button>

          </div>

          <p className="mt-8 text-center text-slate-400">

            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setFullName("");
                setEmail("");
                setPassword("");
              }}
              className="ml-2 font-semibold text-blue-500 transition hover:text-blue-400"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>

          </p>
        </motion.div>

      </div>

    </div>
  );
}

export default Auth;