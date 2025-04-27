export interface Transaction {
  _id?: string
  description: string
  amount: number
  date: Date
  createdAt?: Date
  updatedAt?: Date
}
