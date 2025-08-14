import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { getDashboardStats } from "../../services/dashboardService";
import { useAuth } from "../../hooks/useAuth";

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    loans: {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      completed: 0,
      active: 0,
      closed: 0,
    },
    financial: {
      totalDisbursed: 0,
      totalPaid: 0,
      totalCollected: 0,
      outstandingBalance: 0,
    },
    kpis: {
      approvalRate: 0,
      overdueEMIs: 0,
      activeCustomers: 0,
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data.metrics);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <DashboardLayout>
        <div className="rounded-lg bg-red-950/40 border border-red-700/50 p-4 text-red-400">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        Dashboard
      </h1>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-[var(--color-text-muted)]">
          Loading statistics...
        </div>
      )}

      {!loading && (
        <>
          {/* Loan Metrics */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
              Loan Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Loans"
                value={stats.loans.total}
                color="blue"
              />

              {user.role === "admin" ? (
                <>
                  <StatCard
                    title="Pending Approvals"
                    value={stats.loans.pending}
                    color="yellow"
                  />
                  <StatCard
                    title="Active Loans"
                    value={stats.loans.active}
                    color="green"
                  />
                  <StatCard
                    title="Closed Loans"
                    value={stats.loans.closed}
                    color="purple"
                  />
                </>
              ) : (
                <>
                  <StatCard
                    title="Approved"
                    value={stats.loans.approved}
                    color="green"
                  />
                  <StatCard
                    title="Pending"
                    value={stats.loans.pending}
                    color="yellow"
                  />
                  <StatCard
                    title="Completed"
                    value={stats.loans.completed}
                    color="blue"
                  />
                </>
              )}
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
              Financial Metrics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Disbursed"
                value={`₹${(stats.financial.totalDisbursed / 100000).toFixed(1)}L`}
                color="blue"
              />

              {user.role === "admin" ? (
                <>
                  <StatCard
                    title="Total Collected"
                    value={`₹${(stats.financial.totalCollected / 100000).toFixed(
                      1
                    )}L`}
                    color="green"
                  />
                  <StatCard
                    title="Outstanding"
                    value={`₹${(
                      stats.financial.outstandingBalance / 100000
                    ).toFixed(1)}L`}
                    color="red"
                  />
                  <StatCard
                    title="Active Customers"
                    value={stats.kpis.activeCustomers}
                    color="purple"
                  />
                </>
              ) : (
                <>
                  <StatCard
                    title="Amount Paid"
                    value={`₹${(stats.financial.totalPaid / 100000).toFixed(1)}L`}
                    color="green"
                  />
                  <StatCard
                    title="Outstanding"
                    value={`₹${(
                      stats.financial.outstandingBalance / 100000
                    ).toFixed(1)}L`}
                    color="red"
                  />
                  <StatCard
                    title="Rejected Loans"
                    value={stats.loans.rejected}
                    color="orange"
                  />
                </>
              )}
            </div>
          </div>

          {/* KPI Section (Admin Only) */}
          {user.role === "admin" && (
            <div>
              <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
                Key Performance Indicators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
                  <div className="text-sm text-[var(--color-text-muted)] mb-2">
                    Approval Rate
                  </div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">
                    {stats.kpis.approvalRate}%
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
                  <div className="text-sm text-[var(--color-text-muted)] mb-2">
                    Overdue EMIs
                  </div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">
                    {stats.kpis.overdueEMIs}
                  </div>
                </div>

                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xl/30">
                  <div className="text-sm text-[var(--color-text-muted)] mb-2">
                    Collection Rate
                  </div>
                  <div className="text-2xl font-semibold text-[var(--color-text-primary)]">
                    {stats.financial.totalDisbursed > 0
                      ? (
                          (stats.financial.totalCollected /
                            stats.financial.totalDisbursed) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
