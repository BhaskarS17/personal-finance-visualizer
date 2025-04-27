"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { MonthlyExpensesChart } from "@/components/monthly-expenses-chart"
import { CategoryPieChart } from "@/components/category-pie-chart"
import { BudgetComparisonChart } from "@/components/budget-comparison-chart"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSummary } from "@/components/dashboard-summary"
import { BudgetManagement } from "@/components/budget-management"
import { SpendingInsights } from "@/components/spending-insights"
import { TransactionsProvider } from "@/lib/hooks/use-transactions"

export default function Home() {
  return (
    <TransactionsProvider>
      <main className="container mx-auto py-6 px-4 md:px-6">
        <DashboardHeader />

        <div className="mt-6">
          <DashboardSummary />
        </div>

        <Tabs defaultValue="transactions" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionForm />
            <TransactionList />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <MonthlyExpensesChart />
              <CategoryPieChart />
            </div>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <BudgetManagement />
            <BudgetComparisonChart />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <SpendingInsights />
          </TabsContent>
        </Tabs>
      </main>
    </TransactionsProvider>
  )
}
