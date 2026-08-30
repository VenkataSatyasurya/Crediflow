import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getLoans, updateLoanStatus } from "../../services/loanService";

const AdminLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessmentLoan, setSelectedAssessmentLoan] = useState(null);

  const fetchLoans = async () => {
    try {
      const data = await getLoans();
      setLoans(data.filter((l) => l.status === "pending"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAction = async (id, status) => {
    await updateLoanStatus(id, status);
    setSelectedAssessmentLoan(null);
    fetchLoans();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Loan Approvals & AI Underwriting
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Evaluate borrower credit risk scoring, DTI ratios, and approve or reject applications
            </p>
          </div>
          <span className="rounded-full bg-[var(--color-accent)]/20 px-3 py-1 text-xs font-semibold text-[var(--color-accent)] border border-[var(--color-accent)]/30">
            {loans.length} Pending Review
          </span>
        </div>

        {loading ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            Loading loan applications...
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)] shadow-xl/30">
            <span className="text-2xl block mb-2">🎉</span>
            No pending loan applications requiring review.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl/30">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-primary)]">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Borrower</th>
                  <th className="px-4 py-3 text-left">Loan Amount</th>
                  <th className="px-4 py-3 text-left">EMI & Tenure</th>
                  <th className="px-4 py-3 text-left">AI Risk Score</th>
                  <th className="px-4 py-3 text-left">DTI Ratio</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loans.map((loan, index) => {
                  const assessment = loan.creditAssessment || {
                    score: 75,
                    riskTier: "Tier B (Moderate Risk)",
                    dtiRatio: 32,
                    recommendation: "Standard Underwriting Review",
                    positives: ["Standard profile"],
                    riskFactors: ["No major red flags"],
                  };

                  const isHigh = assessment.score < 50;
                  const isLow = assessment.score >= 80;

                  return (
                    <tr
                      key={loan._id}
                      className="border-t border-[var(--color-border)] hover:bg-[var(--color-primary)]/40 transition"
                    >
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--color-text-primary)]">
                          {loan.customer?.name || "Borrower"}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {loan.customer?.email || "borrower@crediflow.com"}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-semibold text-[var(--color-text-primary)]">
                        ₹{Number(loan.amount).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-emerald-400 font-medium">
                          ₹{Number(loan.emi).toLocaleString("en-IN")} / mo
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          {loan.tenure} months @ {loan.interestRate}%
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                              isLow
                                ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
                                : isHigh
                                ? "bg-rose-950/50 text-rose-400 border-rose-800"
                                : "bg-amber-950/50 text-amber-400 border-amber-800"
                            }`}
                          >
                            {assessment.score} / 100
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedAssessmentLoan(loan)}
                            className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
                          >
                            Insights
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold ${
                            assessment.dtiRatio > 45 ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {assessment.dtiRatio || 30}%
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(loan._id, "approved")}
                            className="cursor-pointer rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleAction(loan._id, "rejected")}
                            className="cursor-pointer rounded bg-rose-600/80 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* AI Underwriting Modal */}
        {selectedAssessmentLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <span>🤖</span> AI Credit Risk Underwriting Report
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedAssessmentLoan(null)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-white cursor-pointer px-2 py-1"
                >
                  ✕ Close
                </button>
              </div>

              {/* Borrower Overview */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded bg-[var(--color-primary)] p-3 border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)] block text-[10px] uppercase">Applicant</span>
                  <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                    {selectedAssessmentLoan.customer?.name || "Borrower"}
                  </span>
                  <span className="text-[var(--color-text-muted)] block mt-0.5">
                    {selectedAssessmentLoan.customer?.email}
                  </span>
                </div>
                <div className="rounded bg-[var(--color-primary)] p-3 border border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)] block text-[10px] uppercase">Loan Requested</span>
                  <span className="font-semibold text-sm text-emerald-400">
                    ₹{Number(selectedAssessmentLoan.amount).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[var(--color-text-muted)] block mt-0.5">
                    {selectedAssessmentLoan.tenure} mos @ {selectedAssessmentLoan.interestRate}% p.a.
                  </span>
                </div>
              </div>

              {/* Score & DTI metrics */}
              {(() => {
                const a = selectedAssessmentLoan.creditAssessment || {
                  score: 75,
                  riskTier: "Tier B (Moderate Risk)",
                  dtiRatio: 32,
                  monthlyIncome: 50000,
                  employmentType: "salaried",
                  creditScoreRange: "good",
                  recommendation: "Standard Underwriting Review Recommended",
                  positives: ["Stable cash flow"],
                  riskFactors: ["Standard obligation"],
                };

                return (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-[var(--color-primary)] p-3 border border-[var(--color-border)]">
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="text-[var(--color-text-muted)]">Credit Risk Index</span>
                        <span className="font-bold text-sm text-[var(--color-text-primary)]">
                          {a.score} / 100 ({a.riskTier})
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${a.score}%` }}
                          className={`h-full ${
                            a.score >= 80
                              ? "bg-emerald-500"
                              : a.score >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded bg-[var(--color-primary)] p-2 border border-[var(--color-border)]">
                        <span className="text-[10px] text-[var(--color-text-muted)] block">DTI RATIO</span>
                        <span className="font-bold text-emerald-400">{a.dtiRatio}%</span>
                      </div>
                      <div className="rounded bg-[var(--color-primary)] p-2 border border-[var(--color-border)]">
                        <span className="text-[10px] text-[var(--color-text-muted)] block">INCOME</span>
                        <span className="font-bold text-[var(--color-text-primary)]">
                          ₹{Number(a.monthlyIncome || 50000).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="rounded bg-[var(--color-primary)] p-2 border border-[var(--color-border)]">
                        <span className="text-[10px] text-[var(--color-text-muted)] block">EMPLOYMENT</span>
                        <span className="font-bold text-[var(--color-text-primary)] uppercase text-[11px]">
                          {a.employmentType || "Salaried"}
                        </span>
                      </div>
                    </div>

                    {/* Recommendation Box */}
                    <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-3 text-xs">
                      <span className="font-semibold text-emerald-400 block mb-1">
                        🎯 Automated Decision Recommendation:
                      </span>
                      <p className="text-[var(--color-text-primary)]">
                        {a.recommendation || "Standard Underwriting Review Recommended"}
                      </p>
                    </div>

                    {/* Risk & Positive Factors */}
                    <div className="space-y-1 text-xs">
                      {a.positives?.map((p, i) => (
                        <p key={i} className="text-emerald-400 flex items-center gap-1.5">
                          <span>✓</span> {p}
                        </p>
                      ))}
                      {a.riskFactors?.map((r, i) => (
                        <p key={i} className="text-amber-400 flex items-center gap-1.5">
                          <span>⚠</span> {r}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => handleAction(selectedAssessmentLoan._id, "approved")}
                  className="flex-1 rounded-md bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer shadow-md transition"
                >
                  Approve Application
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(selectedAssessmentLoan._id, "rejected")}
                  className="flex-1 rounded-md bg-rose-600/80 py-2 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer shadow-md transition"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminLoans;
