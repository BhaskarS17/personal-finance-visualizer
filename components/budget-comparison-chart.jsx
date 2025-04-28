"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions, CATEGORIES } from "@/lib/hooks/use-transactions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function BudgetComparisonChart() {
  const { transactions, budgets } = useTransactions()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString())

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))]
    return years.length > 0 ? years.sort((a, b) => b - a).map((y) => y.toString()) : [currentYear.toString()]
  }, [transactions, currentYear])

  // Calculate budget vs actual data
  const chartData = useMemo(() => {
    // Filter transactions for selected month and year
    const filteredTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getFullYear().toString() === selectedYear && date.getMonth().toString() === selectedMonth
    })

    // Calculate spending by category
    const categorySpending = {}
    filteredTransactions.forEach((transaction) => {
      const category = transaction.category || "other"
      if (!categorySpending[category]) {
        categorySpending[category] = 0
      }
      categorySpending[category] += transaction.amount
    })

    // Create comparison data with budget and actual spending
    return CATEGORIES.map((category) => {
      const budget = budgets.find((b) => b.categoryId === category.id)?.amount || 0
      const actual = categorySpending[category.id] || 0

      return {
        name: category.name,
        budget,
        actual,
        difference: budget - actual,
      }
    }).filter((item) => item.budget > 0 || item.actual > 0) // Only show categories with data
  }, [transactions, budgets, selectedYear, selectedMonth])

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
          <CardTitle>Budget vs.Actual</CardTitle>
          <CardDescription>Compare your planned budget with actual spending</CardDescription>
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
      <CardContent className="h-[400px]">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No data for the selected period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="budget" fill="#8884d8" name="Budget" />
              <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
