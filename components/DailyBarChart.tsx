"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface DayData {
  date: string;
  clicks: number;
  uniqueUsers: number;
  countries: number;
}

interface DailyBarChartProps {
  data: DayData[];
}

export const DailyBarChart: React.FC<DailyBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const formattedData = data.slice(0, 10).map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
        >
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#fff" }}
            axisLine={{ stroke: "#fff" }}
            tickLine={{ stroke: "#fff" }}
          />
          <YAxis
            tick={{ fill: "#fff" }}
            axisLine={{ stroke: "#fff" }}
            tickLine={{ stroke: "#fff" }}
          />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="clicks"
            fill="#3b82f6"
            name="Clicks"
            barSize={100}
            label={{ position: "top", fill: "#fff", fontSize: 12 }}
          />
        </BarChart>
      </ResponsiveContainer>

      {data.length > 10 && (
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            Showing last 10 days · {data.length} days total
          </p>
        </div>
      )}
    </div>
  );
};
