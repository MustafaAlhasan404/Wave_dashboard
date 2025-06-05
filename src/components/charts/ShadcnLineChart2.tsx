"use client"

import React from 'react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  CartesianGrid,
  ResponsiveContainer
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

  return (
    <Card className={className}>
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
                top: 8,
                left: 20,
                right: 20,
                bottom: 8,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : value}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel valueLabel={valueLabel} />}
              />
              <Line
                dataKey={dataKey}
                type="natural"
                stroke={`var(--color-${dataKey})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={200}
                animationEasing="ease-in-out"
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