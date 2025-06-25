import Payment from "../models/Payment.js";
import Loan from "../models/Loan.js";
import EMISchedule from "../models/EMISchedule.js";

// @desc    Make a payment against a loan
// @route   POST /api/payments
// @access  Customer
export const makePayment = async (req, res) => {
  try {
    const { loanId, amountPaid, paymentMode = "upi" } = req.body;

    // Validate input
    if (!loanId || !amountPaid) {
      return res.status(400).json({
        field: "general",
        message: "Loan ID and payment amount are required",
      });
    }

    if (amountPaid <= 0) {
      return res.status(400).json({
        field: "amountPaid",
        message: "Payment amount must be greater than zero",
      });
    }

    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({
        field: "loan",
        message: "Loan not found",
      });
    }

    if (loan.status !== "approved") {
      return res.status(400).json({
        field: "loan",
        message: "Loan is not approved for payments",
      });
    }

    if (amountPaid > loan.remainingAmount) {
      return res.status(400).json({
        field: "amountPaid",
        message: `Payment exceeds remaining amount of ₹${loan.remainingAmount.toFixed(
          2
        )}`,
      });
    }

    // Validate payment mode
    if (!["cash", "upi", "bank"].includes(paymentMode)) {
      return res.status(400).json({
        field: "paymentMode",
        message: "Invalid payment mode",
      });
    }

    // Create payment record
    const payment = await Payment.create({
      loan: loan._id,
      amountPaid,
      paymentMode,
      paymentDate: new Date(),
    });

    // Update remaining amount with decimal precision
    loan.remainingAmount = parseFloat(
      (loan.remainingAmount - amountPaid).toFixed(2)
    );

    // Auto-complete loan when fully paid
    if (Math.abs(loan.remainingAmount) < 0.01) {
      loan.status = "completed";
      loan.remainingAmount = 0;
    }

    await loan.save();

    // Try to mark EMI schedules as paid (if they exist)
    try {
      const pendingEMIs = await EMISchedule.find({
        loan: loan._id,
        status: "pending",
      }).sort({ dueDate: 1 });

      let remainingPayment = amountPaid;

      for (const emi of pendingEMIs) {
        if (remainingPayment <= 0.01) break;

        if (remainingPayment >= emi.emiAmount) {
          emi.status = "paid";
          emi.paidDate = new Date();
          emi.paidAmount = emi.emiAmount;
          remainingPayment -= emi.emiAmount;
        } else {
          // Partial payment
          emi.paidAmount = remainingPayment;
          remainingPayment = 0;
        }

        await emi.save();
      }
    } catch (emiError) {
      console.error("Error updating EMI schedule:", emiError);
      // Continue without stopping the payment
    }

    res.status(201).json({
      message: "Payment successful",
      payment: {
        _id: payment._id,
        loan: payment.loan,
        amountPaid: payment.amountPaid,
        paymentDate: payment.paymentDate,
        paymentMode: payment.paymentMode,
      },
      loan: {
        remainingAmount: loan.remainingAmount,
        status: loan.status,
        emi: loan.emi,
      },
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({
      message: "Payment failed",
      error: error.message,
    });
  }
};

// @desc    Get payments for a loan
// @route   GET /api/payments/:loanId
// @access  Protected
export const getPaymentsByLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    // Verify authorization
    if (req.user.role === "customer" && loan.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const payments = await Payment.find({ loan: loanId }).sort({
      createdAt: -1,
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
