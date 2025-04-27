"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions, CATEGORIES } from "@/lib/hooks/use-transactions"
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export function SpendingInsights() {
  const { transactions } = useTransactions()

  const insights = useMemo(() => {
    // Get current and previous month
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear

    // Filter transactions for current and previous month
    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })

    const previousMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === previousMonth && date.getFullYear() === previousYear
    })

    // Calculate total spending for current and previous month
    const currentMonthTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
    const previousMonthTotal = previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Calculate spending by category for current month
    const currentMonthByCategory = {}
    currentMonthTransactions.forEach((t) => {
      const category = t.category || "other"
      if (!currentMonthByCategory[category]) {
        currentMonthByCategory[category] = 0
      }
      currentMonthByCategory[category] += t.amount
    })

    // Find top spending category
    let topCategory = null
    let topAmount = 0

    Object.entries(currentMonthByCategory).forEach(([categoryId, amount]) => {
      if (amount > topAmount) {
        topAmount = amount
        topCategory = categoryId
      }
    })

    // Calculate month-over-month change
    const percentChange =
      previousMonthTotal === 0 ? 100 : ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100

    // Generate insights
    const monthNames = [
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

    return {
      currentMonth: monthNames[currentMonth],
      previousMonth: monthNames[previousMonth],
      currentTotal: currentMonthTotal,
      previousTotal: previousMonthTotal,
      percentChange,
      isIncrease: percentChange > 0,
      topCategory: CATEGORIES.find((c) => c.id === topCategory)?.name || "None",
      topCategoryAmount: topAmount,
      topCategoryPercentage: currentMonthTotal === 0 ? 0 : (topAmount / currentMonthTotal) * 100,
    }
  }, [transactions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
        <CardDescription>Analysis of your spending patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Month-over-Month Change</h3>
          <div className="flex items-center gap-2">
            {insights.isIncrease ? (
              <ArrowUpIcon className="h-5 w-5 text-red-500" />
            ) : (
              <ArrowDownIcon className="h-5 w-5 text-green-500" />
            )}
            <span className={insights.isIncrease ? "text-red-500" : "text-green-500"}>
              {Math.abs(insights.percentChange).toFixed(1)}%{insights.isIncrease ? " increase" : " decrease"} from{" "}
              {insights.previousMonth}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            You spent ${insights.currentTotal.toFixed(2)} in {insights.currentMonth} compared to $
            {insights.previousTotal.toFixed(2)} in {insights.previousMonth}.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Top Spending Category</h3>
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-orange-500" />
            <span className="font-medium">{insights.topCategory}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You spent ${insights.topCategoryAmount.toFixed(2)} ({insights.topCategoryPercentage.toFixed(1)}% of total)
            on {insights.topCategory} this month.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Spending Tip</h3>
          <div className="flex items-center gap-2">
            <TrendingDownIcon className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Budget Management</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {insights.isIncrease
              ? "Your spending has increased. Consider reviewing your budget for the coming month."
              : "Great job keeping your spending down this month! Keep up the good work."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
