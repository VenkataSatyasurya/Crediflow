import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    tenure: {
      type: Number, // in months
      required: true,
    },
    emi: {
      type: Number,
      required: true,
    },
    totalPayable: {
      type: Number,
      required: true,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    creditAssessment: {
      score: { type: Number, default: 70 },
      riskTier: { type: String, default: "Tier B (Moderate Risk)" },
      statusBadge: { type: String, default: "moderate" },
      dtiRatio: { type: Number, default: 35 },
      monthlyIncome: { type: Number, default: 50000 },
      existingMonthlyEmi: { type: Number, default: 0 },
      employmentType: { type: String, default: "salaried" },
      creditScoreRange: { type: String, default: "good" },
      loanToIncomeMultiplier: { type: Number, default: 2 },
      maxSafeEmi: { type: Number, default: 20000 },
      recommendation: { type: String, default: "Standard Underwriting Review Recommended" },
      positiveFactors: [{ type: String }],
      riskFactors: [{ type: String }],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);
