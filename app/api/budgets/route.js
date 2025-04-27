import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

// GET all budgets
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const budgets = await db.collection("budgets").find({}).toArray()

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 })
  }
}

// POST a new budget or update existing
export async function POST(request) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    // Validate required fields
    if (!data.categoryId || !data.amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if budget for this category already exists
    const existingBudget = await db.collection("budgets").findOne({ categoryId: data.categoryId })

    if (existingBudget) {
      // Update existing budget
      const result = await db.collection("budgets").updateOne(
        { categoryId: data.categoryId },
        {
          $set: {
            amount: data.amount,
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({
        ...existingBudget,
        amount: data.amount,
        updatedAt: new Date(),
      })
    } else {
      // Create new budget
      const budget = {
        categoryId: data.categoryId,
        amount: data.amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("budgets").insertOne(budget)

      return NextResponse.json(
        {
          ...budget,
          _id: result.insertedId,
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Error creating/updating budget:", error)
    return NextResponse.json({ error: "Failed to create/update budget" }, { status: 500 })
  }
}
