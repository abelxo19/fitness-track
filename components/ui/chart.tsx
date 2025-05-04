"use client"

import { Tooltip } from "@/components/ui/tooltip"

import type React from "react"

import type { ReactNode } from "react"

interface ChartContainerProps {
  children: ReactNode
  config?: Record<string, { label: string; color: string }>
}

export function ChartContainer({ children, config }: ChartContainerProps) {
  return <div className="w-full">{children}</div>
}

interface ChartTooltipContentProps {
  children?: ReactNode
  active?: boolean
  payload?: any[]
  label?: string
}

export function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-md p-2 shadow-md">
        <p className="font-bold">{`${label}`}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-gray-700">
            {`${item.name}: ${item.value}`}
          </p>
        ))}
      </div>
    )
  }

  return null
}

interface ChartTooltipProps {
  content: React.ComponentType<ChartTooltipContentProps>
}

export function ChartTooltip({ content }: ChartTooltipProps) {
  return <Tooltip content={content} />
}

export const Chart = () => {
  return null
}
