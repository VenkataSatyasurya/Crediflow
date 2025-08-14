import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getLoans } from "../../services/loanService";
import { useAuth } from "../../hooks/useAuth";

const Loans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const data = await getLoans();
        setLoans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const statusStyles = {
    approved: "bg-green-950/40 text-green-400",
    pending: "bg-yellow-950/40 text-yellow-400",
    rejected: "bg-red-950/40 text-red-400",
    completed: "bg-blue-950/40 text-blue-400",
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Loans
        </h1>

        {/* Customer only */}
        {user?.role === "customer" && (
          <Link
            to="/loans/create"
            className="cursor-pointer rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white shadow-xl/30 hover:opacity-90"
          >
            + New Loan
          </Link>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading loans...
        </p>
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)] shadow-xl/30">
          No loans found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl/30 md:block">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th className="px-4 py-3 text-left">S.No</th>
                  <th className="px-4 py-3 text-left">Amount (₹)</th>
                  <th className="px-4 py-3 text-left">EMI (₹)</th>
                  <th className="px-4 py-3 text-left">Tenure</th>
                  <th className="px-4 py-3 text-left">Total Payable</th>
                  <th className="px-4 py-3 text-left">Remaining</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {loans.map((loan, index) => (
                  <tr
                    key={loan._id}
                    className="border-t border-[var(--color-border)]"
                  >
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text-primary)]">
                      ₹{loan.amount}
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      ₹{loan.emi}
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {loan.tenure} months
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      ₹{loan.totalPayable}
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {loan.remainingAmount === 0
                        ? "Paid"
                        : `₹${loan.remainingAmount}`}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          statusStyles[loan.status]
                        }`}
                      >
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {loans.map((loan, index) => (
              <div
                key={loan._id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xl/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-primary)]">
                    #{index + 1} • ₹{loan.amount}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      statusStyles[loan.status]
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                  EMI: ₹{loan.emi}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  Tenure: {loan.tenure} months
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  Total: ₹{loan.totalPayable}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  Remaining:{" "}
                  {loan.remainingAmount === 0
                    ? "Paid"
                    : `₹${loan.remainingAmount}`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Loans;
