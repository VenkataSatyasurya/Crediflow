import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getLoans } from "../../services/loanService";
import {
  makePayment,
  getPaymentsByLoan,
} from "../../services/paymentService";

const Payments = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoans = async () => {
      const data = await getLoans();
      setLoans(data.filter((l) => l.status === "approved"));
    };
    fetchLoans();
  }, []);

  const handleLoanSelect = async (loan) => {
    setSelectedLoan(loan);
    setAmount(loan.emi);
    const data = await getPaymentsByLoan(loan._id);
    setPayments(data.data || data);
  };

  const handlePayment = async () => {
    if (!amount) return;
    setError("");

    try {
      setLoading(true);
      await makePayment({
        loanId: selectedLoan._id,
        amountPaid: Number(amount),
        paymentMode: "upi",
      });

      const updated = await getPaymentsByLoan(selectedLoan._id);
      setPayments(updated.data || updated);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
        Payments
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Loans List */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl/30">
          <h2 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">
            Approved Loans
          </h2>

          {loans.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No approved loans
            </p>
          ) : (
            <ul className="space-y-2">
              {loans.map((loan) => (
                <li
                  key={loan._id}
                  onClick={() => handleLoanSelect(loan)}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition ${
                    selectedLoan?._id === loan._id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-text-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]"
                  }`}
                >
                  ₹{loan.amount} • EMI ₹{loan.emi}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6 lg:col-span-2">
          {selectedLoan ? (
            <>
              {/* Pay EMI */}
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
                <h2 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
                  Pay EMI
                </h2>

                {error && (
                  <div className="mb-4 rounded bg-red-950/40 px-4 py-2 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="rounded-md cursor-pointer bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white shadow-xl/20 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Pay"}
                  </button>
                </div>
              </div>

              {/* Payment History */}
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
                <h2 className="mb-4 text-sm font-medium text-[var(--color-text-muted)]">
                  Payment History
                </h2>

                {payments.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    No payments yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                        <tr>
                          <th className="px-4 py-2 text-left">Amount</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr
                            key={p._id}
                            className="border-t border-[var(--color-border)]"
                          >
                            <td className="px-4 py-2 text-[var(--color-text-primary)]">
                              ₹{p.amountPaid}
                            </td>
                            <td className="px-4 py-2 text-[var(--color-text-muted)]">
                              {new Date(p.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-[var(--color-text-muted)] uppercase">
                              {p.paymentMode}
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
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)] shadow-xl/30">
              Select a loan to make payment
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
