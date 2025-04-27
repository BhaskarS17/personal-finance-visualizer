import { NextResponse } from "next/server"
import clientPromise from "@/lib/db"
import { ObjectId } from "mongodb"

// GET a single transaction
export async function GET(request, { params }) {
  try {
    const client = await clientPromise
    const db = client.db()

    const transaction = await db.collection("transactions").findOne({ _id: new ObjectId(params.id) })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}

// PUT (update) a transaction
export async function PUT(request, { params }) {
  try {
    const client = await clientPromise
    const db = client.db()

    const data = await request.json()

    // Prepare update data
    const updateData = {
      ...data,
      updatedAt: new Date(),
    }

    // Convert date string to Date object if present
    if (data.date) {
      updateData.date = new Date(data.date)
    }

    const result = await db.collection("transactions").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, id: params.id })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}

// DELETE a transaction
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("transactions").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 })
  }
}
