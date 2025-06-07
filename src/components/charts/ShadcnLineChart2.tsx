"use client"

import React from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  CartesianGrid,
  ResponsiveContainer,
  YAxis
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ShadcnLineChart2Props {
  data: any[];
  title?: string;
  description?: string;
  footerTrend?: string;
  footerDescription?: string;
  trendIcon?: React.ReactNode;
  height?: number;
  className?: string;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  valueLabel?: string;
}

export function ShadcnLineChart2({
  data,
  title = "Line Chart",
  description,
  footerTrend,
  footerDescription,
  trendIcon,
  height = 300,
  className,
  dataKey,
  xAxisKey,
  color = "var(--chart-1)",
  valueLabel,
}: ShadcnLineChart2Props) {
  const chartConfig = {
    [dataKey]: {
      label: dataKey,
      color: color,
    },
  } satisfies ChartConfig;

  // Calculate evenly spaced grid points that are higher in the chart
  const calculateGridPoints = () => {
    const points = [];
    const numLines = 4;
    const step = height / (numLines + 1);
    
    for (let i = 1; i <= numLines; i++) {
      // Adjust this multiplier to move grid up or down
      // Lower values move grid up, higher values move grid down
      const position = step * i * 0.8; 
      points.push(position);
    }
    
    return points;
  };

  return (
    <Card className={className}>
      <style jsx global>{`
        /* Override Recharts animation for line */
        .recharts-line-curve {
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw 1.5s ease-in-out forwards;
        }
        
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        /* Delay dot appearance */
        .recharts-line .recharts-line-dot {
          opacity: 0;
          animation: fadeDot 0.3s ease-in-out 1.2s forwards;
        }
        
        @keyframes fadeDot {
          to {
            opacity: 1;
          }
        }
      `}</style>
      
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-1">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart
              accessibilityLayer
              data={data}
              margin={{
                top: 20,
                left: 20,
                right: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid 
                vertical={false} 
                horizontalPoints={calculateGridPoints()}
                stroke="var(--grid-line-color)"
                strokeWidth={1}
                strokeDasharray="3 3" 
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="var(--foreground)"
                domain={['dataMin - 1', 'dataMax + 1']}
                tickMargin={8}
              />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={{ stroke: 'var(--foreground)', opacity: 0.3 }}
                tickMargin={8}
                stroke="var(--foreground)"
                tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : value}
              />
              <ChartTooltip
                cursor={{ stroke: 'var(--foreground)', strokeOpacity: 0.5, strokeWidth: 1 }}
                content={<ChartTooltipContent hideLabel valueLabel={valueLabel} />}
              />
              <Line
                dataKey={dataKey}
                type="natural"
                stroke={`var(--color-${dataKey})`}
                strokeWidth={3}
                dot={{
                  stroke: `var(--color-${dataKey})`,
                  strokeWidth: 2,
                  r: 4,
                  fill: "var(--background)"
                }}
                activeDot={{
                  stroke: `var(--color-${dataKey})`,
                  strokeWidth: 2,
                  r: 6,
                  fill: "var(--background)"
                }}
                isAnimationActive={false}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      {(footerTrend || footerDescription) && (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {footerTrend && (
            <div className="flex gap-2 leading-none font-medium">
              {footerTrend} {trendIcon}
            </div>
          )}
          {footerDescription && (
            <div className="text-muted-foreground leading-none">
              {footerDescription}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
} 