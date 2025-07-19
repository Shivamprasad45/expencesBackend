import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  userId: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  tags: string[];
  date: Date;
  paymentMethod: string;
  isRecurring: boolean;
  recurringFrequency?: string;
}

const ExpenseSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    date: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IExpense>("Expense", ExpenseSchema);
