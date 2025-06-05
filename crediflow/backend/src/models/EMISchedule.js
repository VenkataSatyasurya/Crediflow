import mongoose from "mongoose";

const emiScheduleSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true,
    },
    installmentNumber: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    emiAmount: {
      type: Number,
      required: true,
    },
    principal: {
      type: Number,
      required: true,
    },
    interest: {
      type: Number,
      required: true,
    },
    remainingPrincipal: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    paidDate: {
      type: Date,
      default: null,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("EMISchedule", emiScheduleSchema);
