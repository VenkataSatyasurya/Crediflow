import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getLoans } from "../../services/loanService";
import { useAuth } from "../../hooks/useAuth";
import AmortizationChart from "../../components/charts/AmortizationChart";
import { downloadLoanStatement } from "../../services/pdfReceiptService";

const Loans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLoanId, setExpandedLoanId] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await getLoans();
        setLoans(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const statusStyles = {
    approved: "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40",
    pending: "bg-amber-950/40 text-amber-400 border border-amber-800/40",
    rejected: "bg-rose-950/40 text-rose-400 border border-rose-800/40",
    completed: "bg-blue-950/40 text-blue-400 border border-blue-800/40",
  };

  const toggleExpand = (loanId) => {
    setExpandedLoanId(expandedLoanId === loanId ? null : loanId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              Loan Portfolio & Statements
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              Manage your loan applications, review repayment schedules, and download statements
            </p>
          </div>

          {/* Customer only */}
          {user?.role === "customer" && (
            <Link
              to="/loans/create"
              className="cursor-pointer rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition"
            >
              + Apply for New Loan
            </Link>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            Loading loan portfolio...
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)] shadow-xl/30">
            <span className="text-3xl block mb-2">📋</span>
            No loans recorded yet. Click <strong>Apply for New Loan</strong> to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan, index) => {
              const isExpanded = expandedLoanId === loan._id;
              const assessment = loan.creditAssessment;

              return (
                <div
                  key={loan._id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl/30 overflow-hidden transition"
                >
                  {/* Card Main Row */}
                  <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)]">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[var(--color-text-primary)]">
                            ₹{Number(loan.amount).toLocaleString("en-IN")}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                              statusStyles[loan.status] || "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {loan.status}
                          </span>
                          {assessment && (
                            <span className="rounded-full bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              Score: {assessment.score}/100
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {loan.tenure} Months tenure @ {loan.interestRate}% interest rate
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-6 text-xs">
                      <div>
                        <span className="text-[var(--color-text-muted)] block text-[10px] uppercase">Monthly EMI</span>
                        <span className="font-bold text-sm text-emerald-400">
                          ₹{Number(loan.emi).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div>
                        <span className="text-[var(--color-text-muted)] block text-[10px] uppercase">Total Payable</span>
                        <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                          ₹{Number(loan.totalPayable).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div>
                        <span className="text-[var(--color-text-muted)] block text-[10px] uppercase">Balance Left</span>
                        <span className={`font-semibold text-sm ${loan.remainingAmount === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {loan.remainingAmount === 0 ? "Settled" : `₹${Number(loan.remainingAmount).toLocaleString("en-IN")}`}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(loan._id)}
                          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition cursor-pointer"
                        >
                          {isExpanded ? "Hide Curve ▴" : "Amortization Curve ▾"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            downloadLoanStatement({
                              loan,
                              customerName: user?.name,
                              customerEmail: user?.email,
                            })
                          }
                          className="rounded-lg bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition cursor-pointer"
                        >
                          📥 Statement (PDF)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Amortization Chart */}
                  {isExpanded && (
                    <div className="border-t border-[var(--color-border)] bg-[var(--color-primary)]/40 p-5">
                      <AmortizationChart
                        amount={loan.amount}
                        interestRate={loan.interestRate}
                        tenure={loan.tenure}
                        emi={loan.emi}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Loans;
