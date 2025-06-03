import * as React from "react"
import { Tooltip } from "recharts"

export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  children,
  config,
  ...props
}: ChartContainerProps) {
  return (
    <div {...props}>
      <style jsx global>{`
        :root {
          ${Object.entries(config).map(
            ([key, value]) => `--color-${key}: ${value.color};`
          )}
        }
      `}</style>
      {children}
    </div>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: string | number
    payload: {
      [key: string]: string | number
    }
  }>
  label?: string
  hideLabel?: boolean
  valueLabel?: string
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  valueLabel,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && <div className="text-xs font-medium">{label}</div>}
      <div className="flex flex-col gap-0.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: `var(--color-${item.name})`,
              }}
            />
            <span className="text-xs font-medium">
              {item.value.toLocaleString()} {valueLabel || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ChartTooltip = Tooltip 