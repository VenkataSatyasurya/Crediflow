import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createLoan } from "../../services/loanService";
import AmortizationChart from "../../components/charts/AmortizationChart";

const CreateLoan = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "100000",
    interestRate: "10.5",
    tenure: "12",
    monthlyIncome: "60000",
    existingMonthlyEmi: "5000",
    employmentType: "salaried",
    creditScoreRange: "good",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* EMI + Total Payable (Preview Only) */
  const { emi, totalPayable } = useMemo(() => {
    const P = Number(formData.amount);
    const annualRate = Number(formData.interestRate);
    const n = Number(formData.tenure);

    if (!P || !annualRate || !n) {
      return { emi: 0, totalPayable: 0 };
    }

    const r = annualRate / 12 / 100;
    const calculatedEmi =
      (P * r * Math.pow(1 + r, n)) /
      (Math.pow(1 + r, n) - 1);

    const roundedEmi = Math.round(calculatedEmi);
    return {
      emi: roundedEmi,
      totalPayable: roundedEmi * n,
    };
  }, [formData.amount, formData.interestRate, formData.tenure]);

  /* Live AI Credit Risk Assessment */
  const creditAssessment = useMemo(() => {
    const income = Math.max(1000, Number(formData.monthlyIncome) || 50000);
    const existingDebt = Math.max(0, Number(formData.existingMonthlyEmi) || 0);
    const totalObligation = existingDebt + emi;
    const dti = parseFloat(((totalObligation / income) * 100).toFixed(1));

    let score = 70;
    const flags = [];
    const positives = [];

    if (dti <= 25) {
      score += 20;
      positives.push("Extremely healthy debt-to-income ratio (<= 25%)");
    } else if (dti <= 40) {
      score += 10;
      positives.push("Manageable debt burden (<= 40%)");
    } else if (dti <= 55) {
      score -= 15;
      flags.push("High debt-to-income obligation (> 40%)");
    } else {
      score -= 35;
      flags.push("Critical DTI (> 55%) - High default probability");
    }

    switch (formData.creditScoreRange) {
      case "excellent":
        score += 15;
        positives.push("Prime credit bureau history (750+ score)");
        break;
      case "good":
        score += 8;
        positives.push("Good repayment record");
        break;
      case "fair":
        score -= 10;
        flags.push("Fair credit score with minor past delays");
        break;
      case "poor":
        score -= 25;
        flags.push("Subprime credit history");
        break;
      default:
        break;
    }

    if (formData.employmentType === "salaried") {
      score += 10;
      positives.push("Stable salaried employment");
    } else if (formData.employmentType === "business") {
      score += 5;
    } else if (formData.employmentType === "freelance") {
      score -= 8;
      flags.push("Variable freelance income stream");
    }

    const finalScore = Math.min(99, Math.max(10, Math.round(score)));
    let riskTier = "Tier B (Moderate Risk)";
    let badgeColor = "text-amber-400 bg-amber-950/40 border-amber-800/50";
    let recommendation = "Standard Approval Review";

    if (finalScore >= 80) {
      riskTier = "Tier A (Low Risk)";
      badgeColor = "text-emerald-400 bg-emerald-950/40 border-emerald-800/50";
      recommendation = "Instant Auto-Approval Eligible";
    } else if (finalScore >= 50) {
      riskTier = "Tier B (Moderate Risk)";
      badgeColor = "text-amber-400 bg-amber-950/40 border-amber-800/50";
      recommendation = "Standard Underwriting Review";
    } else {
      riskTier = "Tier C (High Risk)";
      badgeColor = "text-rose-400 bg-rose-950/40 border-rose-800/50";
      recommendation = "Manual Risk Review / Guarantor Advised";
    }

    return {
      score: finalScore,
      dti,
      riskTier,
      badgeColor,
      recommendation,
      flags,
      positives,
    };
  }, [formData, emi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await createLoan({
        amount: Number(formData.amount),
        interestRate: Number(formData.interestRate),
        tenure: Number(formData.tenure),
        monthlyIncome: Number(formData.monthlyIncome),
        existingMonthlyEmi: Number(formData.existingMonthlyEmi),
        employmentType: formData.employmentType,
        creditScoreRange: formData.creditScoreRange,
      });
      navigate("/loans");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create loan application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Apply for Loan & EMI Calculator
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Interactive loan structuring with automated AI credit risk scoring & amortization curves
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Form Inputs */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
              <h2 className="mb-4 text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <span>📝</span> Loan Parameters & Profile
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Loan Amount */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-[var(--color-text-muted)] mb-1">
                    <label>Loan Amount (₹)</label>
                    <span className="text-emerald-400 font-semibold">₹{Number(formData.amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    min="10000"
                    max="10000000"
                    step="5000"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>

                {/* Interest Rate & Tenure */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Interest Rate (% p.a.)
                    </label>
                    <input
                      type="number"
                      name="interestRate"
                      min="1"
                      max="25"
                      step="0.25"
                      required
                      value={formData.interestRate}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      name="tenure"
                      min="3"
                      max="120"
                      required
                      value={formData.tenure}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                </div>

                {/* Income & Existing Debts */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--color-border)]/50">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      name="monthlyIncome"
                      min="5000"
                      required
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Existing Debts/EMIs (₹)
                    </label>
                    <input
                      type="number"
                      name="existingMonthlyEmi"
                      min="0"
                      value={formData.existingMonthlyEmi}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                </div>

                {/* Employment Type & Credit Bureau Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Employment Type
                    </label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      <option value="salaried">Salaried Corporate</option>
                      <option value="business">Business / Enterprise</option>
                      <option value="self-employed">Self Employed</option>
                      <option value="freelance">Freelance / Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                      Credit Bureau Tier
                    </label>
                    <select
                      name="creditScoreRange"
                      value={formData.creditScoreRange}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      <option value="excellent">Excellent (750+)</option>
                      <option value="good">Good (650 - 749)</option>
                      <option value="fair">Fair (550 - 649)</option>
                      <option value="poor">Poor (&lt; 550)</option>
                    </select>
                  </div>
                </div>

                {/* Calculated EMI & Total Summary */}
                <div className="rounded-lg bg-[var(--color-primary)] p-4 border border-[var(--color-border)]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--color-text-muted)]">Calculated Monthly EMI:</span>
                    <span className="text-lg font-bold text-emerald-400">
                      ₹{emi.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1 text-[var(--color-text-muted)]">
                    <span>Total Amount Payable:</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      ₹{totalPayable.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-[var(--color-accent)] px-6 py-2.5 cursor-pointer text-sm font-semibold text-white shadow-xl hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {loading ? "Submitting Application..." : "Submit Loan Application"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/loans")}
                    className="rounded-md border border-[var(--color-border)] px-4 py-2.5 cursor-pointer text-sm text-[var(--color-text-muted)] hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* AI Credit Risk Assessment Card */}
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl/30">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 mb-3">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                  <span>🤖</span> AI Credit Risk Assessment
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${creditAssessment.badgeColor}`}>
                  {creditAssessment.riskTier}
                </span>
              </div>

              {/* Meter bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--color-text-muted)]">Credit Score Index</span>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {creditAssessment.score} / 100
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${creditAssessment.score}%` }}
                    className={`h-full transition-all duration-500 ${
                      creditAssessment.score >= 80
                        ? "bg-emerald-500"
                        : creditAssessment.score >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                  />
                </div>
              </div>

              {/* DTI & Recommendation */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="rounded bg-[var(--color-primary)] p-2.5 border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)] block text-[10px] uppercase">Debt-to-Income (DTI)</span>
                  <span className={`text-sm font-bold ${creditAssessment.dti > 45 ? "text-rose-400" : "text-emerald-400"}`}>
                    {creditAssessment.dti}%
                  </span>
                </div>
                <div className="rounded bg-[var(--color-primary)] p-2.5 border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)] block text-[10px] uppercase">Recommendation</span>
                  <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate block">
                    {creditAssessment.recommendation}
                  </span>
                </div>
              </div>

              {/* Positives and Risk Flags */}
              <div className="space-y-1 text-xs">
                {creditAssessment.positives.map((pos, i) => (
                  <p key={i} className="text-emerald-400 flex items-center gap-1.5">
                    <span>✓</span> {pos}
                  </p>
                ))}
                {creditAssessment.flags.map((flag, i) => (
                  <p key={i} className="text-rose-400 flex items-center gap-1.5">
                    <span>⚠</span> {flag}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Amortization Chart */}
          <div className="space-y-6 lg:col-span-6">
            <AmortizationChart
              amount={Number(formData.amount)}
              interestRate={Number(formData.interestRate)}
              tenure={Number(formData.tenure)}
              emi={emi}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateLoan;
