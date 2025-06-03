import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AreaChartProps {
  data: any[];
  areas: {
    dataKey: string;
    fill?: string;
    stroke?: string;
    name?: string;
    stackId?: string;
  }[];
  xAxisDataKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
}

export function AreaChart({
  data,
  areas,
  xAxisDataKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  className,
}: AreaChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
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
          {areas.map((area, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              stroke={area.stroke || `var(--chart-${(index % 5) + 1})`}
              fill={area.fill || `var(--chart-${(index % 5) + 1})`}
              fillOpacity={0.3}
              stackId={area.stackId}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
} 