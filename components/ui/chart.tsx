"use client"

import type * as React from "react"

interface ChartProps {
  data: any[]
  children: React.ReactNode
}

export const Chart = ({ data, children }: ChartProps) => {
  return <div className="w-full">{children}</div>
}

export const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative">{children}</div>
}

export const ChartBars = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

interface ChartBarProps {
  value: number
  name: string
  className?: string
}

export const ChartBar = ({ value, name, className }: ChartBarProps) => {
  const height = `${(value / Math.max(...[value])) * 100}%`
  return <div className={`bar ${className}`} style={{ height: height }} data-name={name} data-value={value} />
}

export const ChartXAxis = () => {
  return <div className="axis x-axis"></div>
}

export const ChartYAxis = () => {
  return <div className="axis y-axis"></div>
}

interface ChartTooltipProps {
  content: ({ name, value }: { name: string; value: number }) => React.ReactNode
}

export const ChartTooltip = ({ content }: ChartTooltipProps) => {
  return <div className="tooltip">{content({ name: "", value: 0 })}</div>
}
