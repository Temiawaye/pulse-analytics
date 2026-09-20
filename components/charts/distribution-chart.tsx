"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DistributionChart({
  data,
  label,
}: {
  data: { name: string; value: number }[];
  label: string;
}) {
  return (
    <div role="img" aria-label={label}>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 12, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              horizontal={false}
            />
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <Tooltip />
            <Bar
              dataKey="value"
              name="Visits"
              fill="#047857"
              radius={[0, 5, 5, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="sr-only">
        {data.map((item) => (
          <li key={item.name}>
            {item.name}: {item.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
