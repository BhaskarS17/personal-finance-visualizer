"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/lib/hooks/use-transactions"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function MonthlyExpensesChart() {
  const { transactions } = useTransactions()
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())

  // Get available years from transactions
  const availableYears = useMemo(() => {
    const years = [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))]
    return years.length > 0 ? years.sort((a, b) => b - a).map((y) => y.toString()) : [currentYear.toString()]
  }, [transactions, currentYear])

  // Calculate monthly data for the selected year
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyData = months.map((month, index) => ({
      name: month,
      amount: 0,
      monthIndex: index,
    }))

    transactions.forEach((transaction) => {
      if (new Date(transaction.date).getFullYear().toString() === selectedYear) {
        const month = new Date(transaction.date).getMonth()
        monthlyData[month].amount += transaction.amount
      }
    })

    // Sort by month index to ensure correct order
    return monthlyData.sort((a, b) => a.monthIndex - b.monthIndex)
  }, [transactions, selectedYear])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Your spending patterns throughout the year</CardDescription>
        </div>
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
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`$${value.toFixed(2)}`, "Amount"]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Bar dataKey="amount" fill="#8884d8" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
