const StatCard = ({ title, value, color = "default" }) => {
  const colorClasses = {
    default: "bg-[var(--color-primary)]",
    blue: "bg-blue-950/40 border border-blue-700/30",
    green: "bg-green-950/40 border border-green-700/30",
    red: "bg-red-950/40 border border-red-700/30",
    yellow: "bg-yellow-950/40 border border-yellow-700/30",
    purple: "bg-purple-950/40 border border-purple-700/30",
    orange: "bg-orange-950/40 border border-orange-700/30",
  };

  return (
    <div className={`${colorClasses[color] || colorClasses.default} rounded-lg shadow-xl/30 p-4`}>
      <p className="text-sm text-[var(--color-text-muted)]">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
};

export default StatCard;
