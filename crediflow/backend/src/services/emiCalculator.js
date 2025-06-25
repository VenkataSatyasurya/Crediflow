/**
 * Calculate EMI using the standard formula with proper decimal precision
 * Formula: EMI = (P × r × (1+r)^n) / ((1+r)^n - 1)
 * where P = Principal, r = monthly rate, n = tenure in months
 */
export const calculateEMI = (amount, interestRate, tenure) => {
  if (amount <= 0 || interestRate < 0 || tenure <= 0) {
    throw new Error("Invalid loan parameters");
  }

  const monthlyRate = interestRate / 12 / 100;
  
  if (monthlyRate === 0) {
    // If no interest, EMI = Principal / Tenure
    return parseFloat((amount / tenure).toFixed(2));
  }

  const numerator = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure);
  const denominator = Math.pow(1 + monthlyRate, tenure) - 1;
  const emi = numerator / denominator;

  // Return with 2 decimal precision for currency
  return parseFloat(emi.toFixed(2));
};

/**
 * Generate complete EMI schedule for a loan
 */
export const generateEMISchedule = (
  loanAmount,
  interestRate,
  tenure,
  emiAmount,
  startDate = new Date()
) => {
  const schedule = [];
  let remainingPrincipal = loanAmount;
  const monthlyRate = interestRate / 12 / 100;

  for (let i = 1; i <= tenure; i++) {
    // Calculate interest for this month
    const interest = parseFloat(
      (remainingPrincipal * monthlyRate).toFixed(2)
    );

    // Calculate principal portion
    const principal = parseFloat((emiAmount - interest).toFixed(2));

    // Update remaining principal
    remainingPrincipal = parseFloat(
      (remainingPrincipal - principal).toFixed(2)
    );

    // Ensure remaining principal doesn't go negative due to rounding
    if (remainingPrincipal < 0) {
      remainingPrincipal = 0;
    }

    // Calculate due date (same day each month)
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      installmentNumber: i,
      dueDate,
      emiAmount,
      principal,
      interest,
      remainingPrincipal,
      status: "pending",
      paidDate: null,
      paidAmount: 0,
    });
  }

  return schedule;
};
