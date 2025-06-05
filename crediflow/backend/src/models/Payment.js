import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMode: {
      type: String,
      enum: ["cash", "upi", "bank"],
      default: "upi",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
