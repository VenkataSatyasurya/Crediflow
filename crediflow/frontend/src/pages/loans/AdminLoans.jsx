import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getLoans, updateLoanStatus } from "../../services/loanService";

const AdminLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const data = await getLoans();
      // assuming getLoans returns data directly (as per your service refactor)
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
    fetchLoans();
  };

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
        Loan Approvals
      </h1>

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading loans...
        </p>
      ) : loans.length === 0 ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)] shadow-xl/30">
          No pending loans
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl/30">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">S.No</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Amount (₹)</th>
                <th className="px-4 py-3 text-left">EMI (₹)</th>
                <th className="px-4 py-3 text-left">Tenure</th>
                <th className="px-4 py-3 text-left">Actions</th>
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
                    {loan.customer?.name || "—"}
                  </td>

                  <td className="px-4 py-3 text-[var(--color-text-primary)]">
                    ₹{loan.amount}
                  </td>

                  <td className="px-4 py-3 text-[var(--color-text-primary)]">
                    ₹{loan.emi}
                  </td>

                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {loan.tenure} months
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleAction(loan._id, "approved")
                        }
                        className="cursor-pointer rounded bg-green-950/40 px-3 py-1 text-xs font-medium text-green-400 hover:bg-green-950/60"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() =>
                          handleAction(loan._id, "rejected")
                        }
                        className="cursor-pointer rounded bg-red-950/40 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-950/60"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminLoans;
