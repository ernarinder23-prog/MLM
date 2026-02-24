"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ReportsChartProps {
  chartData: { name: string; signups: number }[];
}

export function ReportsChart({ chartData }: ReportsChartProps) {
  return (
    <div className="card mb-8">
      <h3 className="font-heading font-semibold text-primary mb-4">Signups Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="signups" stroke="#1DB954" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
