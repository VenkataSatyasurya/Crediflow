import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getLoans } from "../../services/loanService";
import { makePayment, getPaymentsByLoan } from "../../services/paymentService";
import { downloadPaymentReceipt, downloadLoanStatement } from "../../services/pdfReceiptService";
import { useAuth } from "../../hooks/useAuth";

const Payments = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchLoans = async () => {
      const data = await getLoans();
      const approved = (data || []).filter((l) => l.status === "approved" || l.status === "completed");
      setLoans(approved);
      if (approved.length > 0) {
        handleLoanSelect(approved[0]);
      }
    };
    fetchLoans();
  }, []);

  const handleLoanSelect = async (loan) => {
    setSelectedLoan(loan);
    setAmount(loan.emi);
    setError("");
    setSuccessMsg("");
    try {
      const data = await getPaymentsByLoan(loan._id);
      setPayments(data.data || data || []);
    } catch (err) {
      console.error(err);
      setPayments([]);
    }
  };

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) return;
    setError("");
    setSuccessMsg("");

    try {
      setLoading(true);
      const res = await makePayment({
        loanId: selectedLoan._id,
        amountPaid: Number(amount),
        paymentMode: "upi",
      });

      const updated = await getPaymentsByLoan(selectedLoan._id);
      const paymentList = updated.data || updated || [];
      setPayments(paymentList);

      // Auto-trigger PDF Receipt download for convenience
      const latestPayment = paymentList[paymentList.length - 1] || {
        _id: res.data?._id || "NEW",
        amountPaid: Number(amount),
        paymentMode: "UPI",
        createdAt: new Date().toISOString(),
      };

      setSuccessMsg("Payment processed successfully! Your official PDF receipt is ready.");

      downloadPaymentReceipt({
        payment: latestPayment,
        loan: selectedLoan,
        customerName: user?.name || "Valued Borrower",
        customerEmail: user?.email || "borrower@crediflow.com",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            EMI Payments & E-Receipts
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Pay monthly loan installments and instantly download authenticated PDF receipts
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Loans List */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl/30">
            <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
              Active Loans
            </h2>

            {loans.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                No active loans found
              </p>
            ) : (
              <ul className="space-y-2.5">
                {loans.map((loan) => (
                  <li
                    key={loan._id}
                    onClick={() => handleLoanSelect(loan)}
                    className={`cursor-pointer rounded-lg border p-3.5 text-sm transition ${
                      selectedLoan?._id === loan._id
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-text-primary)] shadow-md"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[var(--color-text-primary)]">
                        ₹{Number(loan.amount).toLocaleString("en-IN")}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        loan.status === "completed" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800" : "bg-blue-950/40 text-blue-400 border border-blue-800"
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1.5 text-[var(--color-text-muted)]">
                      <span>EMI: ₹{loan.emi} / mo</span>
                      <span>{loan.tenure} mos</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-6 lg:col-span-2">
            {selectedLoan ? (
              <>
                {/* Loan Header & Statements */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl/30">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                        Loan Account: LN-{selectedLoan._id.slice(-6).toUpperCase()}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Principal: ₹{Number(selectedLoan.amount).toLocaleString("en-IN")} • Balance Remaining: ₹{Number(selectedLoan.remainingAmount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        downloadLoanStatement({
                          loan: selectedLoan,
                          payments,
                          customerName: user?.name,
                          customerEmail: user?.email,
                        })
                      }
                      className="rounded-lg border border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>📄</span> Download Full Statement (PDF)
                    </button>
                  </div>

                  {/* Pay EMI Box */}
                  <h4 className="mb-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase">
                    Make Monthly Installment Payment
                  </h4>

                  {error && (
                    <div className="mb-3 rounded-lg bg-rose-950/40 border border-rose-800 px-4 py-2 text-xs text-rose-400">
                      {error}
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-3 rounded-lg bg-emerald-950/40 border border-emerald-800 px-4 py-2 text-xs text-emerald-400">
                      {successMsg}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-sm text-[var(--color-text-muted)]">₹</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter EMI amount"
                        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-primary)] pl-7 pr-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                      />
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={loading || selectedLoan.status === "completed"}
                      className="rounded-lg cursor-pointer bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-50 transition"
                    >
                      {loading ? "Processing Payment..." : selectedLoan.status === "completed" ? "Loan Fully Settled" : "Pay & Download Receipt"}
                    </button>
                  </div>
                </div>

                {/* Payment History & Download Receipts Table */}
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                      <span>🧾</span> Payment History & E-Receipts
                    </h3>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {payments.length} Settlements Recorded
                    </span>
                  </div>

                  {payments.length === 0 ? (
                    <div className="rounded-lg bg-[var(--color-primary)] p-6 text-center text-xs text-[var(--color-text-muted)]">
                      No payments made yet for this loan account.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
                      <table className="min-w-full text-xs">
                        <thead className="border-b border-[var(--color-border)] bg-[var(--color-primary)] text-[var(--color-text-muted)]">
                          <tr>
                            <th className="px-4 py-2.5 text-left">#</th>
                            <th className="px-4 py-2.5 text-left">Amount Paid</th>
                            <th className="px-4 py-2.5 text-left">Date & Time</th>
                            <th className="px-4 py-2.5 text-left">Mode</th>
                            <th className="px-4 py-2.5 text-right">E-Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p, idx) => (
                            <tr
                              key={p._id || idx}
                              className="border-t border-[var(--color-border)]/50 hover:bg-[var(--color-primary)]/30 transition"
                            >
                              <td className="px-4 py-2.5 text-[var(--color-text-muted)]">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-2.5 font-bold text-emerald-400">
                                ₹{Number(p.amountPaid || p.amount).toLocaleString("en-IN")}
                              </td>
                              <td className="px-4 py-2.5 text-[var(--color-text-muted)]">
                                {new Date(p.createdAt || Date.now()).toLocaleString("en-IN", {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </td>
                              <td className="px-4 py-2.5 text-[var(--color-text-muted)] uppercase font-semibold">
                                {p.paymentMode || "UPI"}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadPaymentReceipt({
                                      payment: p,
                                      loan: selectedLoan,
                                      customerName: user?.name,
                                      customerEmail: user?.email,
                                    })
                                  }
                                  className="rounded bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/40 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition cursor-pointer"
                                >
                                  📥 PDF Receipt
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)] shadow-xl/30">
                Select an active loan from the left to manage payments and download statements.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
