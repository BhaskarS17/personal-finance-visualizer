"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { useTransactions } from "@/lib/hooks/use-transactions"
import { Progress } from "@/components/ui/progress"

export function BudgetManagement() {
  const { budgets, updateBudget, getCategorySpending } = useTransactions()
  const [isEditing, setIsEditing] = useState(false)
  const [budgetValues, setBudgetValues] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Get current month's spending by category
  const categorySpending = getCategorySpending(currentMonth, currentYear)

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save budgets
      setIsSubmitting(true)

      try {
        const updates = Object.entries(budgetValues).filter(([categoryId, amount]) => amount && !isNaN(amount))

        // Process updates sequentially to avoid race conditions
        for (const [categoryId, amount] of updates) {
          await updateBudget(categoryId, Number.parseFloat(amount))
        }

        toast({
          title: "Budgets updated",
          description: "Your category budgets have been updated successfully.",
        })

        setIsEditing(false)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update budgets. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Initialize budget values for editing
      const initialValues = {}
      budgets.forEach((budget) => {
        initialValues[budget.categoryId] = budget.amount.toString()
      })
      setBudgetValues(initialValues)
      setIsEditing(true)
    }
  }

  const handleBudgetChange = (categoryId, value) => {
    setBudgetValues((prev) => ({
      ...prev,
      [categoryId]: value,
    }))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Budgets</CardTitle>
          <CardDescription>Set and track your spending limits by category</CardDescription>
        </div>
        <Button onClick={handleEditToggle} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Save Budgets" : "Edit Budgets"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categorySpending.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={budgetValues[category.id] || ""}
                    onChange={(e) => handleBudgetChange(category.id, e.target.value)}
                    className="w-24"
                  />
                ) : (
                  <span className="font-medium">${category.budget.toFixed(2)}</span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Spent: ${category.spending.toFixed(2)}</span>
                  <span>Remaining: ${category.remaining.toFixed(2)}</span>
                </div>
                <Progress
                  value={Math.min(category.percentage, 100)}
                  className={category.percentage > 100 ? "bg-red-200" : ""}
                />
                {category.percentage > 100 && (
                  <p className="text-xs text-red-500">
                    Over budget by ${(category.spending - category.budget).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
