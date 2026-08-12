import { FiAlertTriangle, FiX } from "react-icons/fi";

function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="flex items-start justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
              <FiAlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                {title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Please confirm this action.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            title="Close"
          >
            <FiX size={20} />
          </button>

        </div>

        {/* ========================= */}
        {/* MESSAGE */}
        {/* ========================= */}

        <p className="mt-5 text-sm leading-6 text-slate-400">
          {message}
        </p>

        {/* ========================= */}
        {/* ACTIONS */}
        {/* ========================= */}

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Deleting..." : confirmText}
          </button>

        </div>

      </div>
    </div>
  );
}

export default ConfirmModal;