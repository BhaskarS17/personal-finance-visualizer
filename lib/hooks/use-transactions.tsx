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

// Mock data for initial transactions
const initialTransactions = [
  {
    id: "1",
    description: "Groceries",
    amount: 85.75,
    date: new Date("2023-04-15"),
    category: "groceries",
  },
  {
    id: "2",
    description: "Monthly Rent",
    amount: 1200,
    date: new Date("2023-04-01"),
    category: "housing",
  },
  {
    id: "3",
    description: "Internet Bill",
    amount: 65.99,
    date: new Date("2023-04-05"),
    category: "utilities",
  },
  {
    id: "4",
    description: "Coffee Shop",
    amount: 4.5,
    date: new Date("2023-04-16"),
    category: "dining",
  },
  {
    id: "5",
    description: "Gas",
    amount: 45.25,
    date: new Date("2023-04-10"),
    category: "transportation",
  },
]

// Initial budgets
const initialBudgets = CATEGORIES.map((category) => ({
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
  const [transactions, setTransactions] = useState(initialTransactions)
  const [budgets, setBudgets] = useState(initialBudgets)
  const [editingTransaction, setEditingTransaction] = useState(null)

  // Load transactions from localStorage on initial render
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem("transactions")
      const savedBudgets = localStorage.getItem("budgets")

      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions)
        // Convert string dates back to Date objects
        const formattedTransactions = parsedTransactions.map((t) => ({
          ...t,
          date: new Date(t.date),
        }))
        setTransactions(formattedTransactions)
      }

      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets))
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
    }
  }, [])

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions))
    } catch (error) {
      console.error("Error saving transactions to localStorage:", error)
    }
  }, [transactions])

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("budgets", JSON.stringify(budgets))
    } catch (error) {
      console.error("Error saving budgets to localStorage:", error)
    }
  }, [budgets])

  const addTransaction = (transaction) => {
    setTransactions((prev) => [transaction, ...prev])
  }

  const updateTransaction = (id, updatedFields) => {
    setTransactions((prev) =>
      prev.map((transaction) => (transaction.id === id ? { ...transaction, ...updatedFields } : transaction)),
    )
  }

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((transaction) => transaction.id !== id))
  }

  const updateBudget = (categoryId, amount) => {
    setBudgets((prev) => prev.map((budget) => (budget.categoryId === categoryId ? { ...budget, amount } : budget)))
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
