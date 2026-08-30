import Loan from "../models/Loan.js";
import { calculateEMI, generateEMISchedule } from "../services/emiCalculator.js";
import EMISchedule from "../models/EMISchedule.js";
import { calculateCreditAssessment } from "../services/creditScoreService.js";

// @desc    Pre-assess borrower credit risk (live preview)
// @route   POST /api/loans/assess-risk
// @access  Customer
export const assessCreditRisk = async (req, res) => {
  try {
    const {
      amount = 50000,
      interestRate = 10.5,
      tenure = 12,
      monthlyIncome = 50000,
      existingMonthlyEmi = 0,
      employmentType = "salaried",
      creditScoreRange = "good",
    } = req.body;

    const emi = calculateEMI(Number(amount) || 50000, Number(interestRate) || 10.5, Number(tenure) || 12);
    const assessment = calculateCreditAssessment({
      monthlyIncome,
      existingMonthlyEmi,
      requestedEmi: emi,
      loanAmount: Number(amount),
      tenure: Number(tenure),
      employmentType,
      creditScoreRange,
    });

    res.json({ emi, ...assessment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new loan
// @route   POST /api/loans
// @access  Customer
export const createLoan = async (req, res) => {
  try {
    const {
      amount,
      interestRate,
      tenure,
      monthlyIncome = 50000,
      existingMonthlyEmi = 0,
      employmentType = "salaried",
      creditScoreRange = "good",
    } = req.body;

    // Validate required fields
    if (!amount || interestRate === undefined || !tenure) {
      return res.status(400).json({
        field: "general",
        message: "Amount, interest rate, and tenure are required",
      });
    }

    // Validate amount range
    if (amount < 10000 || amount > 100000000) {
      return res.status(400).json({
        field: "amount",
        message: "Loan amount must be between ₹10,000 and ₹100 crores",
      });
    }

    // Validate interest rate range
    if (interestRate < 0 || interestRate > 25) {
      return res.status(400).json({
        field: "interestRate",
        message: "Interest rate must be between 0% and 25% per annum",
      });
    }

    // Validate tenure range
    if (tenure < 1 || tenure > 360) {
      return res.status(400).json({
        field: "tenure",
        message: "Tenure must be between 1 month and 30 years (360 months)",
      });
    }

    // Calculate EMI with proper decimal precision
    const emi = calculateEMI(amount, interestRate, tenure);
    const totalPayable = parseFloat((emi * tenure).toFixed(2));
    const remainingAmount = totalPayable;

    // Calculate Credit Assessment
    const creditAssessment = calculateCreditAssessment({
      monthlyIncome: Number(monthlyIncome),
      existingMonthlyEmi: Number(existingMonthlyEmi),
      requestedEmi: emi,
      loanAmount: Number(amount),
      tenure: Number(tenure),
      employmentType,
      creditScoreRange,
    });

    const loan = await Loan.create({
      customer: req.user._id,
      amount,
      interestRate,
      tenure,
      emi,
      totalPayable,
      remainingAmount,
      creditAssessment,
    });

    res.status(201).json({
      _id: loan._id,
      customer: loan.customer,
      amount: loan.amount,
      interestRate: loan.interestRate,
      tenure: loan.tenure,
      emi: loan.emi,
      totalPayable: loan.totalPayable,
      remainingAmount: loan.remainingAmount,
      status: loan.status,
      creditAssessment: loan.creditAssessment,
      createdAt: loan.createdAt,
    });
  } catch (error) {
    console.error("Create loan error:", error);
    res.status(500).json({
      message: "Failed to create loan",
      error: error.message,
    });
  }
};

// @desc    Approve or reject loan
// @route   PUT /api/loans/:id/status
// @access  Admin / Agent
export const updateLoanStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (loan.status !== "pending") {
      return res.status(400).json({
        message: "Only pending loans can be approved or rejected",
      });
    }

    loan.status = status;
    loan.approvedBy = req.user._id;
    await loan.save();

    // Generate EMI schedule if approved
    if (status === "approved") {
      try {
        // Check if schedule already exists
        const existingSchedule = await EMISchedule.findOne({ loan: loan._id });
        if (!existingSchedule) {
          const schedule = generateEMISchedule(
            loan.amount,
            loan.interestRate,
            loan.tenure,
            loan.emi
          );

          // Bulk insert EMI schedule
          const scheduleWithLoanId = schedule.map((emi) => ({
            ...emi,
            loan: loan._id,
          }));
          await EMISchedule.insertMany(scheduleWithLoanId);
        }
      } catch (scheduleError) {
        console.error("EMI schedule generation error:", scheduleError);
        // Don't fail the approval if schedule generation fails
      }
    }

    // Populate customer details before returning
    const populatedLoan = await Loan.findById(loan._id).populate(
      "customer",
      "name email"
    );

    res.json(populatedLoan);
  } catch (error) {
    console.error("Update loan status error:", error);
    res.status(500).json({
      message: "Failed to update loan status",
      error: error.message,
    });
  }
};

// @desc    Get loans
// @route   GET /api/loans
// @access  All (role-based)
export const getLoans = async (req, res) => {
  try {
    let loans;

    if (req.user.role === "customer") {
      loans = await Loan.find({ customer: req.user._id });
    } else {
      loans = await Loan.find().populate("customer", "name email");
    }

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch loans" });
  }
};
