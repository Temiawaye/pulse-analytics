"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TrafficChart({
  data,
}: {
  data: { label: string; views: number; visitors: number }[];
}) {
  return (
    <div
      role="img"
      aria-label="Traffic over time showing page views and unique visitors"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="views"
              name="Page views"
              stroke="#047857"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="visitors"
              name="Visitors"
              stroke="#0f766e"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Solid line: page views. Dashed line: unique visitors.
      </p>
    </div>
  );
}
