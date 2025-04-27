"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions, CATEGORIES } from "@/lib/hooks/use-transactions"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function CategoryPieChart() {
  const { transactions } = useTransactions()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString())

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))]
    return years.length > 0 ? years.sort((a, b) => b - a).map((y) => y.toString()) : [currentYear.toString()]
  }, [transactions, currentYear])

  // Calculate category data for the selected month and year
  const chartData = useMemo(() => {
    // Filter transactions for selected month and year
    const filteredTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getFullYear().toString() === selectedYear && date.getMonth().toString() === selectedMonth
    })

    // Group by category
    const categoryTotals = {}

    filteredTransactions.forEach((transaction) => {
      const category = transaction.category || "other"
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += transaction.amount
    })

    // Convert to array format for pie chart
    return CATEGORIES.filter((category) => categoryTotals[category.id] > 0).map((category) => ({
      name: category.name,
      value: categoryTotals[category.id] || 0,
      color: category.color,
    }))
  }, [transactions, selectedYear, selectedMonth])

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Breakdown of your spending by category</CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No data for the selected period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
