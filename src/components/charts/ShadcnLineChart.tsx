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

interface ShadcnLineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    stroke?: string;
    name?: string;
    strokeWidth?: number;
    dot?: boolean | object;
  }[];
  xAxisDataKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function ShadcnLineChart({
  data,
  lines,
  xAxisDataKey,
  height = 300,
  showGrid = true,
  showLegend = false,
  className,
  title,
  subtitle,
}: ShadcnLineChartProps) {
  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -10,
            bottom: 0,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />}
          <XAxis 
            dataKey={xAxisDataKey} 
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tick={{ fill: 'var(--muted-foreground)' }}
          />
          <YAxis 
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--card-foreground)',
              boxShadow: 'var(--shadow)',
              fontSize: '12px',
              padding: '8px 12px',
            }}
            cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, opacity: 0.5 }}
          />
          {showLegend && (
            <Legend 
              verticalAlign="top" 
              align="right"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
          )}
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.stroke || `var(--primary)`}
              strokeWidth={line.strokeWidth || 2}
              dot={line.dot !== undefined ? line.dot : { r: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive={true}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
} 