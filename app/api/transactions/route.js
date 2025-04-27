import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"

// GET all transactions
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    const transactions = await db.collection("transactions").find({}).sort({ date: -1 }).toArray()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

// POST a new transaction
export async function POST(request) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    // Validate required fields
    if (!data.description || !data.amount || !data.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transaction = {
      ...data,
      date: new Date(data.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("transactions").insertOne(transaction)

    return NextResponse.json(
      {
        ...transaction,
        _id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
