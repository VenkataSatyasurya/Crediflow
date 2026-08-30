/**
 * Intelligent Rule-Based Credit Risk Scoring Engine
 * Evaluates borrower creditworthiness, calculates Debt-To-Income (DTI),
 * and assigns a standardized risk score (1 - 100) with risk tier classification.
 */

export const calculateCreditAssessment = ({
  monthlyIncome = 50000,
  existingMonthlyEmi = 0,
  requestedEmi = 0,
  loanAmount = 100000,
  tenure = 12,
  employmentType = "salaried", // salaried, self-employed, business, freelance
  creditScoreRange = "good",  // excellent (750-900), good (650-749), fair (550-649), poor (<550)
}) => {
  const income = Math.max(1000, Number(monthlyIncome) || 50000);
  const existingDebt = Math.max(0, Number(existingMonthlyEmi) || 0);
  const newEmi = Math.max(0, Number(requestedEmi) || 0);
  const totalMonthlyObligation = existingDebt + newEmi;

  // 1. Debt-To-Income (DTI) Ratio (%)
  const dtiRatio = parseFloat(((totalMonthlyObligation / income) * 100).toFixed(1));

  let score = 70; // baseline score
  const riskFactors = [];
  const positiveFactors = [];

  // DTI Scoring Impact (Max +/- 30 points)
  if (dtiRatio <= 25) {
    score += 20;
    positiveFactors.push("Very low debt burden (DTI <= 25%)");
  } else if (dtiRatio <= 40) {
    score += 10;
    positiveFactors.push("Healthy debt-to-income ratio (DTI <= 40%)");
  } else if (dtiRatio <= 50) {
    score -= 10;
    riskFactors.push("Elevated debt-to-income ratio (DTI between 40%-50%)");
  } else if (dtiRatio <= 65) {
    score -= 25;
    riskFactors.push("High debt burden (DTI exceeds 50%)");
  } else {
    score -= 40;
    riskFactors.push("Critical debt distress (DTI exceeds 65%)");
  }

  // Credit Bureau Tier Impact (Max +/- 20 points)
  switch (creditScoreRange) {
    case "excellent":
      score += 15;
      positiveFactors.push("Excellent credit history (750+ CIBIL/FICO equivalent)");
      break;
    case "good":
      score += 8;
      positiveFactors.push("Good credit profile with consistent repayments");
      break;
    case "fair":
      score -= 10;
      riskFactors.push("Fair credit score with minor past delays");
      break;
    case "poor":
      score -= 25;
      riskFactors.push("Subprime credit profile with elevated default risk");
      break;
    default:
      break;
  }

  // Employment Stability Impact (Max +/- 10 points)
  switch (employmentType) {
    case "salaried":
      score += 10;
      positiveFactors.push("Stable regular salaried income stream");
      break;
    case "business":
      score += 5;
      positiveFactors.push("Registered enterprise cash flow");
      break;
    case "self-employed":
      score += 2;
      break;
    case "freelance":
      score -= 8;
      riskFactors.push("Variable income stream (Freelance / Contract)");
      break;
    default:
      break;
  }

  // Loan to Monthly Income Ratio (Exposure Index)
  const loanToIncomeMultiplier = Number((loanAmount / income).toFixed(1));
  if (loanToIncomeMultiplier > 15) {
    score -= 12;
    riskFactors.push(`High leverage: Requested loan is ${loanToIncomeMultiplier}x monthly income`);
  } else if (loanToIncomeMultiplier <= 5) {
    score += 5;
    positiveFactors.push("Conservative borrowing amount relative to income");
  }

  // Clamp score between 10 and 99
  const finalScore = Math.min(99, Math.max(10, Math.round(score)));

  // Determine Risk Tier & Automated Underwriting Recommendation
  let riskTier = "Tier B (Moderate Risk)";
  let recommendation = "Standard Approval Review";
  let statusBadge = "moderate";
  let maxSafeEmi = Math.round(income * 0.45 - existingDebt);
  if (maxSafeEmi < 0) maxSafeEmi = 0;

  if (finalScore >= 80) {
    riskTier = "Tier A (Low Risk)";
    recommendation = "Instant Auto-Approval Eligible - Prime Borrower";
    statusBadge = "low";
  } else if (finalScore >= 50) {
    riskTier = "Tier B (Moderate Risk)";
    recommendation = "Standard Underwriting Review Recommended";
    statusBadge = "moderate";
  } else {
    riskTier = "Tier C (High Risk)";
    recommendation = "Manual Risk Review / Guarantor or Collateral Advised";
    statusBadge = "high";
  }

  return {
    score: finalScore,
    riskTier,
    statusBadge,
    dtiRatio,
    monthlyIncome: income,
    existingMonthlyEmi: existingDebt,
    employmentType,
    creditScoreRange,
    loanToIncomeMultiplier,
    maxSafeEmi,
    recommendation,
    positiveFactors,
    riskFactors: riskFactors.length > 0 ? riskFactors : ["No critical risk flags detected"],
  };
};
