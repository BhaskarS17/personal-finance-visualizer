"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions, CATEGORIES } from "@/lib/hooks/use-transactions"
import { DollarSign, CreditCard, Calendar, PieChart } from "lucide-react"

export function DashboardSummary() {
  const { transactions } = useTransactions()

  const summaryData = useMemo(() => {
    // Total expenses
    const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    // Current month expenses
    const now = new Date()
    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    const currentMonthExpenses = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Category breakdown
    const categoryTotals = {}
    transactions.forEach((t) => {
      const category = t.category || "other"
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0
      }
      categoryTotals[category] += t.amount
    })

    // Find top category
    let topCategory = null
    let topAmount = 0

    Object.entries(categoryTotals).forEach(([categoryId, amount]) => {
      if (amount > topAmount) {
        topAmount = amount
        topCategory = categoryId
      }
    })

    const topCategoryName = CATEGORIES.find((c) => c.id === topCategory)?.name || "None"

    return {
      totalExpenses,
      transactionCount: transactions.length,
      currentMonthExpenses,
      currentMonth: now.toLocaleString("default", { month: "long" }),
      currentYear: now.getFullYear(),
      topCategory: topCategoryName,
      topCategoryAmount: topAmount,
    }
  }, [transactions])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summaryData.totalExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From {summaryData.transactionCount} transaction{summaryData.transactionCount !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{summaryData.currentMonth} Expenses</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${summaryData.currentMonthExpenses.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{summaryData.currentYear}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.topCategory}</div>
          <p className="text-xs text-muted-foreground">${summaryData.topCategoryAmount.toFixed(2)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Transaction</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <>
              <div className="text-2xl font-bold">{transactions[0].description}</div>
              <p className="text-xs text-muted-foreground">
                ${transactions[0].amount.toFixed(2)} • {new Date(transactions[0].date).toLocaleDateString()}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold">No transactions</div>
              <p className="text-xs text-muted-foreground">Add your first transaction</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
