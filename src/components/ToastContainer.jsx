import Toast from "./Toast";

function ToastContainer({
  toasts,
  removeToast,
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-24 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() =>
            removeToast(toast.id)
          }
        />
      ))}
    </div>
  );
}

export default ToastContainer;