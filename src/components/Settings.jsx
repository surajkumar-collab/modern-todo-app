import { useEffect, useState } from "react";

import {
  FiMoon,
  FiCheckSquare,
  FiBell,
  FiBarChart2,
  FiSave,
  FiLogOut,
} from "react-icons/fi";

function Settings({ onLogout }) {
  // =========================================
  // DEFAULT SETTINGS
  // =========================================

  const defaultSettings = {
    theme: "dark",

    defaultPriority: "medium",
    defaultView: "list",
    weekStarts: "monday",

    taskReminders: true,
    dueDateAlerts: true,
    dailySummary: false,

    showProgress: true,
    showQuickActions: true,
  };

  // =========================================
  // STATE
  // =========================================

  const [settings, setSettings] =
    useState(defaultSettings);

  const [saved, setSaved] =
    useState(false);

  // =========================================
  // APPLY THEME
  // =========================================

  const applyTheme = (theme) => {
    const root =
      document.documentElement;

    root.classList.remove(
      "theme-light"
    );

    // DARK
    if (theme === "dark") {
      return;
    }

    // LIGHT
    if (theme === "light") {
      root.classList.add(
        "theme-light"
      );

      return;
    }

    // SYSTEM
    if (theme === "system") {
      const prefersLight =
        window.matchMedia(
          "(prefers-color-scheme: light)"
        ).matches;

      if (prefersLight) {
        root.classList.add(
          "theme-light"
        );
      }
    }
  };

  // =========================================
  // LOAD SETTINGS
  // =========================================

  useEffect(() => {
    try {
      const storedSettings =
        localStorage.getItem(
          "taskflow-settings"
        );

      if (storedSettings) {
        const parsedSettings =
          JSON.parse(
            storedSettings
          );

        const mergedSettings = {
          ...defaultSettings,
          ...parsedSettings,
        };

        setSettings(
          mergedSettings
        );

        applyTheme(
          mergedSettings.theme
        );
      } else {
        applyTheme("dark");
      }
    } catch (error) {
      console.error(
        "Settings load error:",
        error
      );

      applyTheme("dark");
    }
  }, []);

  // =========================================
  // SYSTEM THEME LISTENER
  // =========================================

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: light)"
      );

    const handleSystemThemeChange =
      () => {
        if (
          settings.theme ===
          "system"
        ) {
          applyTheme("system");
        }
      };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [settings.theme]);

  // =========================================
  // UPDATE SETTING
  // =========================================

  const updateSetting = (
    key,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);

    // Apply theme immediately
    if (key === "theme") {
      applyTheme(value);
    }
  };

  // =========================================
  // SAVE SETTINGS
  // =========================================

  const handleSave = () => {
    try {
      localStorage.setItem(
        "taskflow-settings",
        JSON.stringify(settings)
      );

      applyTheme(
        settings.theme
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white transition-colors duration-300 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            PREFERENCES
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Customize how TaskFlow works for you.
          </p>

        </div>

        <div className="space-y-5">

          {/* ================================= */}
          {/* APPEARANCE */}
          {/* ================================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">

            <div className="flex items-center gap-3 border-b border-slate-800 p-5 sm:p-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <FiMoon size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Appearance
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Control how TaskFlow looks.
                </p>
              </div>

            </div>

            <div className="divide-y divide-slate-800">

              {/* THEME */}

              <SettingRow
                title="Theme"
                description="Choose your preferred interface theme."
              >

                <select
                  value={settings.theme}
                  onChange={(e) =>
                    updateSetting(
                      "theme",
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >

                  <option value="dark">
                    Dark
                  </option>

                  <option value="light">
                    Light
                  </option>

                  <option value="system">
                    System
                  </option>

                </select>

              </SettingRow>

            </div>

          </section>

          {/* ================================= */}
          {/* TASK PREFERENCES */}
          {/* ================================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">

            <div className="flex items-center gap-3 border-b border-slate-800 p-5 sm:p-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <FiCheckSquare size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Task Preferences
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Set your default task behavior.
                </p>
              </div>

            </div>

            <div className="divide-y divide-slate-800">

              {/* DEFAULT PRIORITY */}

              <SettingRow
                title="Default Priority"
                description="Priority automatically selected for new tasks."
              >

                <select
                  value={
                    settings.defaultPriority
                  }
                  onChange={(e) =>
                    updateSetting(
                      "defaultPriority",
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >

                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                </select>

              </SettingRow>

              {/* DEFAULT VIEW */}

              <SettingRow
                title="Default Task View"
                description="Choose how your tasks open by default."
              >

                <select
                  value={
                    settings.defaultView
                  }
                  onChange={(e) =>
                    updateSetting(
                      "defaultView",
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >

                  <option value="list">
                    List
                  </option>

                  <option value="calendar">
                    Calendar
                  </option>

                </select>

              </SettingRow>

              {/* WEEK START */}

              <SettingRow
                title="Week Starts On"
                description="Choose the first day shown in your calendar."
              >

                <select
                  value={
                    settings.weekStarts
                  }
                  onChange={(e) =>
                    updateSetting(
                      "weekStarts",
                      e.target.value
                    )
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >

                  <option value="monday">
                    Monday
                  </option>

                  <option value="sunday">
                    Sunday
                  </option>

                </select>

              </SettingRow>

            </div>

          </section>

          {/* ================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">

            <div className="flex items-center gap-3 border-b border-slate-800 p-5 sm:p-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
                <FiBell size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Notifications
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Control task reminders and alerts.
                </p>
              </div>

            </div>

            <div className="divide-y divide-slate-800">

              <ToggleRow
                title="Task Reminders"
                description="Receive reminders for upcoming tasks."
                checked={
                  settings.taskReminders
                }
                onChange={(value) =>
                  updateSetting(
                    "taskReminders",
                    value
                  )
                }
              />

              <ToggleRow
                title="Due Date Alerts"
                description="Get notified when a task is approaching its due date."
                checked={
                  settings.dueDateAlerts
                }
                onChange={(value) =>
                  updateSetting(
                    "dueDateAlerts",
                    value
                  )
                }
              />

              <ToggleRow
                title="Daily Summary"
                description="Receive a daily overview of your productivity."
                checked={
                  settings.dailySummary
                }
                onChange={(value) =>
                  updateSetting(
                    "dailySummary",
                    value
                  )
                }
              />

            </div>

          </section>

          {/* ================================= */}
          {/* DASHBOARD */}
          {/* ================================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">

            <div className="flex items-center gap-3 border-b border-slate-800 p-5 sm:p-6">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <FiBarChart2 size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Dashboard
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Control your dashboard layout.
                </p>
              </div>

            </div>

            <div className="divide-y divide-slate-800">

              <ToggleRow
                title="Show Progress Card"
                description="Display your overall completion progress."
                checked={
                  settings.showProgress
                }
                onChange={(value) =>
                  updateSetting(
                    "showProgress",
                    value
                  )
                }
              />

              <ToggleRow
                title="Show Quick Actions"
                description="Display shortcuts to common actions."
                checked={
                  settings.showQuickActions
                }
                onChange={(value) =>
                  updateSetting(
                    "showQuickActions",
                    value
                  )
                }
              />

            </div>

          </section>

          {/* ================================= */}
          {/* ACCOUNT */}
          {/* ================================= */}

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">

            <div className="border-b border-slate-800 p-5 sm:p-6">

              <h2 className="font-semibold text-white">
                Account
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Manage your TaskFlow session.
              </p>

            </div>

            <div className="p-5 sm:p-6">

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
              >

                <FiLogOut size={17} />

                Log Out

              </button>

            </div>

          </section>

        </div>

        {/* ================================= */}
        {/* SAVE BAR */}
        {/* ================================= */}

        <div className="sticky bottom-4 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">

          <div>

            {saved ? (
              <p className="text-sm font-medium text-green-400">
                Settings saved successfully.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Changes are stored locally on this device.
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >

            <FiSave size={17} />

            Save Settings

          </button>

        </div>

      </div>

    </div>
  );
}

// =========================================
// SETTING ROW
// =========================================

function SettingRow({
  title,
  description,
  children,
}) {
  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

      <div className="min-w-0">

        <p className="text-sm font-medium text-slate-200">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">
          {description}
        </p>

      </div>

      <div className="shrink-0">
        {children}
      </div>

    </div>
  );
}

// =========================================
// TOGGLE ROW
// =========================================

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 p-5 sm:p-6">

      <div className="min-w-0">

        <p className="text-sm font-medium text-slate-200">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600">
          {description}
        </p>

      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-600"
            : "bg-slate-700"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

export default Settings;