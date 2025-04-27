"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Predefined categories
export const CATEGORIES = [
  { id: "groceries", name: "Groceries", color: "#4CAF50" },
  { id: "housing", name: "Housing", color: "#2196F3" },
  { id: "transportation", name: "Transportation", color: "#FF9800" },
  { id: "utilities", name: "Utilities", color: "#9C27B0" },
  { id: "entertainment", name: "Entertainment", color: "#F44336" },
  { id: "healthcare", name: "Healthcare", color: "#00BCD4" },
  { id: "dining", name: "Dining Out", color: "#795548" },
  { id: "shopping", name: "Shopping", color: "#E91E63" },
  { id: "education", name: "Education", color: "#3F51B5" },
  { id: "other", name: "Other", color: "#607D8B" },
]

// Initial budgets for new users
const defaultBudgets = CATEGORIES.map((category) => ({
  categoryId: category.id,
  amount:
    category.id === "housing"
      ? 1500
      : category.id === "groceries"
        ? 400
        : category.id === "transportation"
          ? 200
          : category.id === "utilities"
            ? 150
            : 100,
}))

const TransactionsContext = createContext(undefined)

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/transactions")

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()

      // Convert string dates to Date objects
      const formattedTransactions = data.map((t) => ({
        ...t,
        date: new Date(t.date),
      }))

      setTransactions(formattedTransactions)
      setError(null)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Failed to load transactions. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch budgets from API
  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets")

      if (!response.ok) {
        throw new Error("Failed to fetch budgets")
      }

      const data = await response.json()

      if (data.length === 0) {
        // If no budgets exist yet, initialize with defaults
        await Promise.all(
          defaultBudgets.map((budget) =>
            fetch("/api/budgets", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(budget),
            }),
          ),
        )

        setBudgets(defaultBudgets)
      } else {
        setBudgets(data)
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching budgets:", err)
      setError("Failed to load budgets. Please try again later.")
    }
  }

  // Load data on initial render
  useEffect(() => {
    const loadData = async () => {
      await fetchTransactions()
      await fetchBudgets()
    }

    loadData()
  }, [])

  // Add a new transaction
  const addTransaction = async (transaction) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        throw new Error("Failed to add transaction")
      }

      const newTransaction = await response.json()

      // Update local state
      setTransactions((prev) => [{ ...newTransaction, date: new Date(newTransaction.date) }, ...prev])

      return true
    } catch (err) {
      console.error("Error adding transaction:", err)
      setError("Failed to add transaction. Please try again.")
      return false
    }
  }

  // Update an existing transaction
  const updateTransaction = async (id, updatedFields) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      })

      if (!response.ok) {
        throw new Error("Failed to update transaction")
      }

      // Update local state
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction._id === id
            ? {
                ...transaction,
                ...updatedFields,
                date: updatedFields.date ? new Date(updatedFields.date) : transaction.date,
              }
            : transaction,
        ),
      )

      return true
    } catch (err) {
      console.error("Error updating transaction:", err)
      setError("Failed to update transaction. Please try again.")
      return false
    }
  }

  // Delete a transaction
  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete transaction")
      }

      // Update local state
      setTransactions((prev) => prev.filter((transaction) => transaction._id !== id))

      return true
    } catch (err) {
      console.error("Error deleting transaction:", err)
      setError("Failed to delete transaction. Please try again.")
      return false
    }
  }

  // Update a budget
  const updateBudget = async (categoryId, amount) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, amount }),
      })

      if (!response.ok) {
        throw new Error("Failed to update budget")
      }

      // Update local state
      setBudgets((prev) => prev.map((budget) => (budget.categoryId === categoryId ? { ...budget, amount } : budget)))

      return true
    } catch (err) {
      console.error("Error updating budget:", err)
      setError("Failed to update budget. Please try again.")
      return false
    }
  }

  // Get category spending for a specific month and year
  const getCategorySpending = (month, year) => {
    const filteredTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year
    })

    return CATEGORIES.map((category) => {
      const spending = filteredTransactions
        .filter((t) => t.category === category.id)
        .reduce((sum, t) => sum + t.amount, 0)

      const budget = budgets.find((b) => b.categoryId === category.id)?.amount || 0

      return {
        ...category,
        spending,
        budget,
        remaining: budget - spending,
        percentage: budget > 0 ? (spending / budget) * 100 : 0,
      }
    })
  }

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        editingTransaction,
        setEditingTransaction,
        budgets,
        updateBudget,
        getCategorySpending,
        isLoading,
        error,
        refreshData: fetchTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionsContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionsProvider")
  }
  return context
}
