import { DollarSign } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <DollarSign className="h-6 w-6 text-green-500" />
        <h1 className="text-2xl font-bold tracking-tight">Personal Finance Tracker</h1>
      </div>
      <p className="text-muted-foreground">
        Track your expenses, manage budgets, and gain insights into your spending habits
      </p>
    </div>
  )
}
