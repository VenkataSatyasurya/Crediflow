import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { createLoan } from "../../services/loanService";

const CreateLoan = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "",
    interestRate: "",
    tenure: "",
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
    const emi =
      (P * r * Math.pow(1 + r, n)) /
      (Math.pow(1 + r, n) - 1);

    const roundedEmi = Math.round(emi);
    return {
      emi: roundedEmi,
      totalPayable: roundedEmi * n,
    };
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await createLoan({
        amount: Number(formData.amount),
        interestRate: Number(formData.interestRate),
        tenure: Number(formData.tenure),
      });
      navigate("/loans");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create loan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
          Apply for Loan
        </h1>

        <div className="rounded-lg bg-[var(--color-surface)] p-6 shadow-xl/30">
          {error && (
            <div className="mb-4 rounded bg-red-950/40 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Loan Amount */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Loan Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                min="1"
                max="100000000"
                required
                value={formData.amount}
                onChange={handleChange}
                placeholder="50000"
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Interest Rate (% per year)
              </label>
              <input
                type="number"
                name="interestRate"
                min="0"
                max="100"
                step="0.1"
                required
                value={formData.interestRate}
                onChange={handleChange}
                placeholder="10"
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Tenure (months)
              </label>
              <input
                type="number"
                name="tenure"
                min="1"
                max="240"
                required
                value={formData.tenure}
                onChange={handleChange}
                placeholder="12"
                className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            {/* EMI (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Monthly EMI (₹)
              </label>
              <input
                type="text"
                disabled
                value={emi ? `₹${emi}` : "—"}
                className="mt-1 w-full cursor-not-allowed rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-muted)]"
              />
            </div>

            {/* Total Payable (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)]">
                Total Payable Amount (₹)
              </label>
              <input
                type="text"
                disabled
                value={totalPayable ? `₹${totalPayable}` : "—"}
                className="mt-1 w-full cursor-not-allowed rounded-md border border-[var(--color-border)] bg-[var(--color-primary)] px-3 py-2 text-sm text-[var(--color-text-muted)]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-[var(--color-accent)] px-6 py-2 cursor-pointer text-sm font-medium text-white shadow-xl/20 hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Loan"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/loans")}
                className="rounded-md border border-[var(--color-border)] px-6 py-2 cursor-pointer text-sm text-[var(--color-text-muted)] hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateLoan;
