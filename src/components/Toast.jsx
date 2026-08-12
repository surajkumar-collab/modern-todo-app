import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

function Toast({
  type = "success",
  message,
  onClose,
}) {
  const config = {
    success: {
      icon: <FiCheckCircle size={20} />,
      iconClass: "text-green-400 bg-green-500/10",
      borderClass: "border-green-500/20",
    },

    error: {
      icon: <FiXCircle size={20} />,
      iconClass: "text-red-400 bg-red-500/10",
      borderClass: "border-red-500/20",
    },

    info: {
      icon: <FiInfo size={20} />,
      iconClass: "text-blue-400 bg-blue-500/10",
      borderClass: "border-blue-500/20",
    },

    warning: {
      icon: <FiAlertTriangle size={20} />,
      iconClass: "text-yellow-400 bg-yellow-500/10",
      borderClass: "border-yellow-500/20",
    },
  };

  const current = config[type] || config.success;

  if (!message) {
    return null;
  }

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl ${current.borderClass}`}
    >
      {/* Icon */}

      <div
        className={`flex shrink-0 items-center justify-center rounded-lg p-2 ${current.iconClass}`}
      >
        {current.icon}
      </div>

      {/* Message */}

      <p className="flex-1 text-sm font-medium text-slate-200">
        {message}
      </p>

      {/* Close */}

      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-white"
        title="Close"
      >
        <FiX size={16} />
      </button>
    </div>
  );
}

export default Toast;