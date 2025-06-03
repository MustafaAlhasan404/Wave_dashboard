import React from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface LineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    stroke?: string;
    name?: string;
  }[];
  xAxisDataKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function LineChart({
  data,
  lines,
  xAxisDataKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
}: LineChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />}
          <XAxis 
            dataKey={xAxisDataKey} 
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis 
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--card-foreground)',
            }}
          />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.stroke || `var(--chart-${(index % 5) + 1})`}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
} 