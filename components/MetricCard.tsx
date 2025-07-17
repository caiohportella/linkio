import { ReactNode } from "react";

interface MetricCardProps {
  icon: ReactNode;
  badge?: ReactNode;
  title: string;
  value: string | number;
  color?: "blue" | "green" | "indigo" | "orange" | "slate";
}

const colorMap = {
  blue: {
    bg: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    icon: "bg-blue-500 text-white",
    title: "text-blue-600",
    value: "text-blue-900",
  },
  green: {
    bg: "from-green-50 to-green-100",
    border: "border-green-200",
    icon: "bg-green-500 text-white",
    title: "text-green-600",
    value: "text-green-900",
  },
  indigo: {
    bg: "from-indigo-50 to-indigo-100",
    border: "border-indigo-200",
    icon: "bg-indigo-500 text-white",
    title: "text-indigo-600",
    value: "text-indigo-900",
  },
  orange: {
    bg: "from-orange-50 to-orange-100",
    border: "border-orange-200",
    icon: "bg-orange-500 text-white",
    title: "text-orange-600",
    value: "text-orange-900",
  },
  slate: {
    bg: "from-slate-50 to-slate-100",
    border: "border-slate-200",
    icon: "bg-slate-500 text-white",
    title: "text-slate-600",
    value: "text-slate-900",
  },
};

export const MetricCard = ({
  icon,
  badge,
  title,
  value,
  color = "blue",
}: MetricCardProps) => {
  const c = colorMap[color];

  return (
    <div
      className={`bg-gradient-to-br ${c.bg} p-6 rounded-2xl border ${c.border}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.icon}`}>{icon}</div>
        <div className={c.title}>{badge}</div>
      </div>
      <div>
        <p className={`text-sm font-medium ${c.title} mb-1`}>{title}</p>
        <p className={`text-3xl font-bold ${c.value}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
};
