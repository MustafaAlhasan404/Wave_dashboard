import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface BarChartProps {
  data: any[];
  bars: {
    dataKey: string;
    fill?: string;
    name?: string;
  }[];
  xAxisDataKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  barSize?: number;
  stackId?: string;
}

export function BarChart({
  data,
  bars,
  xAxisDataKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
  layout = 'horizontal',
  barSize = 20,
  stackId,
}: BarChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
          layout={layout}
          barSize={barSize}
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
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.fill || `var(--chart-${(index % 5) + 1})`}
              stackId={stackId}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
} 