import Loan from "../models/Loan.js";
import Payment from "../models/Payment.js";
import EMISchedule from "../models/EMISchedule.js";

/**
 * Get comprehensive dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Protected (Admin & Customer)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (userRole === "admin") {
      // Admin Dashboard - System-wide metrics
      const totalLoans = await Loan.countDocuments();
      const approvedLoans = await Loan.countDocuments({ status: "approved" });
      const pendingLoans = await Loan.countDocuments({ status: "pending" });
      const rejectedLoans = await Loan.countDocuments({ status: "rejected" });
      const completedLoans = await Loan.countDocuments({ status: "completed" });

      // Total amount disbursed (approved + completed loans)
      const disbursedResult = await Loan.aggregate([
        { $match: { status: { $in: ["approved", "completed"] } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const totalDisbursed = disbursedResult[0]?.total || 0;

      // Total amount collected
      const collectedResult = await Payment.aggregate([
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]);
      const totalCollected = collectedResult[0]?.total || 0;

      // Approval rate
      const totalProcessed = approvedLoans + rejectedLoans;
      const approvalRate =
        totalProcessed > 0
          ? ((approvedLoans / totalProcessed) * 100).toFixed(1)
          : 0;

      // Outstanding balance (approved loans with remaining amount)
      const approvedLoansData = await Loan.find({ status: "approved" });
      const outstandingBalance = approvedLoansData.reduce(
        (sum, loan) => sum + loan.remainingAmount,
        0
      );

      // Overdue EMIs count (if EMI schedule exists)
      let overdueEMIs = 0;
      try {
        overdueEMIs = await EMISchedule.countDocuments({
          status: "pending",
          dueDate: { $lt: new Date() },
        });
      } catch (e) {
        // EMI Schedule table might not have data yet
        overdueEMIs = 0;
      }

      // Active customers (those with approved loans)
      const activeCustomers = await Loan.distinct("customer", {
        status: "approved",
      });

      return res.json({
        metrics: {
          loans: {
            total: totalLoans,
            approved: approvedLoans,
            pending: pendingLoans,
            rejected: rejectedLoans,
            completed: completedLoans,
            active: approvedLoans,
            closed: completedLoans,
          },
          financial: {
            totalDisbursed: parseFloat(totalDisbursed.toFixed(2)),
            totalCollected: parseFloat(totalCollected.toFixed(2)),
            outstandingBalance: parseFloat(outstandingBalance.toFixed(2)),
          },
          kpis: {
            approvalRate: parseFloat(approvalRate),
            overdueEMIs,
            activeCustomers: activeCustomers.length,
          },
        },
      });
    } else {
      // Customer Dashboard - Personal metrics
      const customerLoans = await Loan.find({ customer: userId });
      const total = customerLoans.length;
      const approved = customerLoans.filter(
        (l) => l.status === "approved"
      ).length;
      const pending = customerLoans.filter(
        (l) => l.status === "pending"
      ).length;
      const rejected = customerLoans.filter(
        (l) => l.status === "rejected"
      ).length;
      const completed = customerLoans.filter(
        (l) => l.status === "completed"
      ).length;

      // Total disbursed to this customer
      const totalDisbursed = customerLoans
        .filter((l) => ["approved", "completed"].includes(l.status))
        .reduce((sum, loan) => sum + loan.amount, 0);

      // Customer's total payments made
      const customerPaymentLoans = customerLoans.map((l) => l._id);
      const customerPayments = await Payment.find({
        loan: { $in: customerPaymentLoans },
      });
      const totalPaid = customerPayments.reduce((sum, p) => sum + p.amountPaid, 0);

      // Outstanding balance for this customer
      const outstandingBalance = customerLoans
        .filter((l) => l.status === "approved")
        .reduce((sum, loan) => sum + loan.remainingAmount, 0);

      return res.json({
        metrics: {
          loans: {
            total,
            approved,
            pending,
            rejected,
            completed,
          },
          financial: {
            totalDisbursed: parseFloat(totalDisbursed.toFixed(2)),
            totalPaid: parseFloat(totalPaid.toFixed(2)),
            outstandingBalance: parseFloat(outstandingBalance.toFixed(2)),
          },
        },
      });
    }
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};
