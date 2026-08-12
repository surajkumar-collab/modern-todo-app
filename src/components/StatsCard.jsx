function StatsCard({
  title,
  value,
  icon,
  description,
  iconClassName = "bg-blue-500/10 text-blue-400",
  hoverClassName = "hover:border-blue-500/30",
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:-translate-y-1 ${hoverClassName}`}
    >
      <div className="flex items-center justify-between">

        {/* ========================= */}
        {/* CONTENT */}
        {/* ========================= */}

        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold text-white">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>

        {/* ========================= */}
        {/* ICON */}
        {/* ========================= */}

        <div
          className={`rounded-xl p-3 ${iconClassName}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

export default StatsCard;