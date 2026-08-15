import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { supabase } from "./supabaseClient";

import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import AppLayout from "./components/AppLayout";
import Tasks from "./components/Tasks";
import AnalyticsPage from "./components/AnalyticsPage";
import CalendarPage from "./components/CalendarPage";
import Profile from "./components/Profile";
import Settings from "./components/Settings";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================
  // AUTH / SESSION
  // =========================================

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        setUser(
          data.session?.user ?? null
        );
      } catch (error) {
        console.error(
          "Get session error:",
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getSession();

    // =========================================
    // AUTH STATE LISTENER
    // =========================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setUser(
          session?.user ?? null
        );
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // =========================================
  // LOGOUT
  // =========================================

  async function handleLogout() {
    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    }
  }

  // =========================================
  // INITIAL LOADING
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">

        <div className="text-center">

          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-blue-500" />

          <p className="text-sm font-medium text-slate-500">
            Loading TaskFlow...
          </p>

        </div>

      </div>
    );
  }

  // =========================================
  // AUTH SCREEN
  // =========================================

  if (!user) {
    return <Auth />;
  }

  // =========================================
  // AUTHENTICATED APP
  // =========================================

  return (
    <BrowserRouter>
      <Routes>

        {/* ================================= */}
        {/* APP LAYOUT */}
        {/* ================================= */}

        <Route
          element={
            <AppLayout
              user={user}
              onLogout={handleLogout}
            />
          }
        >

          {/* ================================= */}
          {/* DASHBOARD */}
          {/* ================================= */}

          <Route
            path="/dashboard"
            element={
              <Dashboard
                user={user}
                onLogout={handleLogout}
              />
            }
          />

          {/* ================================= */}
          {/* TASKS */}
          {/* ================================= */}

          <Route
            path="/tasks"
            element={
              <Tasks
                user={user}
              />
            }
          />

          {/* ================================= */}
          {/* ANALYTICS */}
          {/* ================================= */}

          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                user={user}
              />
            }
          />

          {/* ================================= */}
          {/* CALENDAR */}
          {/* ================================= */}

          <Route
            path="/calendar"
            element={
              <CalendarPage
                user={user}
              />
            }
          />

          {/* ================================= */}
          {/* PROFILE */}
          {/* ================================= */}

          <Route
            path="/profile"
            element={
              <Profile
                user={user}
              />
            }
          />

          {/* ================================= */}
          {/* SETTINGS */}
          {/* ================================= */}

          <Route
            path="/settings"
            element={
              <Settings
                onLogout={handleLogout}
              />
            }
          />
          {/* ================================= */}
          {/* ROOT */}
          {/* ================================= */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          {/* ================================= */}
          {/* UNKNOWN ROUTE */}
          {/* ================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;