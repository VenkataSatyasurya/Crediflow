import { useState, useMemo } from "react";

const AmortizationChart = ({
  amount = 100000,
  interestRate = 10.5,
  tenure = 12,
  emi = 0,
}) => {
  const [activeTab, setActiveTab] = useState("curve"); // "curve" | "monthly" | "table"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate monthly amortization breakdown
  const { schedule, totalInterest, totalPayable, principalRatio, interestRatio } = useMemo(() => {
    const P = Number(amount) || 0;
    const annualRate = Number(interestRate) || 0;
    const n = Number(tenure) || 12;

    if (P <= 0 || n <= 0) {
      return {
        schedule: [],
        totalInterest: 0,
        totalPayable: 0,
        principalRatio: 100,
        interestRatio: 0,
      };
    }

    const monthlyRate = annualRate / 12 / 100;
    let monthlyEmi = emi;
    if (!monthlyEmi || monthlyEmi <= 0) {
      if (monthlyRate === 0) {
        monthlyEmi = P / n;
      } else {
        const num = P * monthlyRate * Math.pow(1 + monthlyRate, n);
        const den = Math.pow(1 + monthlyRate, n) - 1;
        monthlyEmi = num / den;
      }
    }

    let remaining = P;
    let cumulativeInterest = 0;
    const sched = [];

    // Milestone 0 (Start)
    sched.push({
      month: 0,
      principalPaid: 0,
      interestPaid: 0,
      totalPaid: 0,
      remainingBalance: P,
      cumulativeInterest: 0,
    });

    for (let m = 1; m <= n; m++) {
      const interestForMonth = remaining * monthlyRate;
      const principalForMonth = Math.min(remaining, monthlyEmi - interestForMonth);
      remaining = Math.max(0, remaining - principalForMonth);
      cumulativeInterest += interestForMonth;

      sched.push({
        month: m,
        principalPaid: Math.round(principalForMonth),
        interestPaid: Math.round(interestForMonth),
        totalPaid: Math.round(monthlyEmi * m),
        remainingBalance: Math.round(remaining),
        cumulativeInterest: Math.round(cumulativeInterest),
      });
    }

    const totInterest = Math.round(cumulativeInterest);
    const totPayable = Math.round(P + totInterest);
    const pRatio = Math.round((P / totPayable) * 100) || 100;
    const iRatio = 100 - pRatio;

    return {
      schedule: sched,
      totalInterest: totInterest,
      totalPayable: totPayable,
      principalRatio: pRatio,
      interestRatio: iRatio,
    };
  }, [amount, interestRate, tenure, emi]);

  // SVG dimensions for chart
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 35, left: 55 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Max scale value for balance
  const maxBalance = Number(amount) || 100000;
  const maxMonths = schedule.length > 1 ? schedule.length - 1 : 12;

  // Coordinate mappers
  const getX = (month) => padding.left + (month / maxMonths) * graphWidth;
  const getY = (val) => padding.top + graphHeight - (val / maxBalance) * graphHeight;

  // Build SVG Path for Balance Reduction Curve
  const balancePath = useMemo(() => {
    if (schedule.length === 0) return "";
    return schedule.reduce((path, pt, idx) => {
      const x = getX(pt.month);
      const y = getY(pt.remainingBalance);
      return idx === 0 ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
    }, "");
  }, [schedule, maxBalance, maxMonths]);

  // Build Area fill path
  const areaPath = useMemo(() => {
    if (!balancePath || schedule.length === 0) return "";
    const firstX = getX(0);
    const lastX = getX(schedule[schedule.length - 1].month);
    const bottomY = padding.top + graphHeight;
    return `${balancePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [balancePath, schedule]);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl/30 transition-all">
      {/* Header & Tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <span>📊</span> EMI Amortization & Repayment Curve
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            Principal balance reduction & interest schedule over {tenure} months
          </p>
        </div>

        <div className="flex gap-1 rounded-lg bg-[var(--color-primary)] p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("curve")}
            className={`rounded-md px-3 py-1 font-medium transition cursor-pointer ${
              activeTab === "curve"
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Balance Curve
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("monthly")}
            className={`rounded-md px-3 py-1 font-medium transition cursor-pointer ${
              activeTab === "monthly"
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Monthly Split
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("table")}
            className={`rounded-md px-3 py-1 font-medium transition cursor-pointer ${
              activeTab === "table"
                ? "bg-[var(--color-accent)] text-white shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Schedule Table
          </button>
        </div>
      </div>

      {/* Breakdown Metrics */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-[var(--color-primary)] p-3 border border-[var(--color-border)]">
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Principal Borrowed
          </p>
          <p className="mt-1 text-base font-bold text-[var(--color-text-primary)]">
            ₹{Number(amount || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
            {principalRatio}% of total
          </p>
        </div>

        <div className="rounded-lg bg-[var(--color-primary)] p-3 border border-[var(--color-border)]">
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Interest
          </p>
          <p className="mt-1 text-base font-bold text-amber-400">
            ₹{totalInterest.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-amber-500 font-medium mt-0.5">
            {interestRatio}% of total
          </p>
        </div>

        <div className="rounded-lg bg-[var(--color-primary)] p-3 border border-[var(--color-border)]">
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Total Payable
          </p>
          <p className="mt-1 text-base font-bold text-cyan-400">
            ₹{totalPayable.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            ₹{Math.round(emi).toLocaleString("en-IN")} / mo
          </p>
        </div>
      </div>

      {/* Proportion Bar */}
      <div className="mb-4 space-y-1.5">
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>Principal: {principalRatio}%</span>
          <span>Interest: {interestRatio}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 flex">
          <div
            style={{ width: `${principalRatio}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
            title={`Principal: ${principalRatio}%`}
          />
          <div
            style={{ width: `${interestRatio}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Interest: ${interestRatio}%`}
          />
        </div>
      </div>

      {/* Tab Content 1: Interactive SVG Balance Curve */}
      {activeTab === "curve" && (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto select-none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
              const yVal = padding.top + graphHeight * frac;
              const labelVal = Math.round(maxBalance * (1 - frac));
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={yVal}
                    x2={width - padding.right}
                    y2={yVal}
                    stroke="var(--color-border)"
                    strokeDasharray="3 3"
                    strokeOpacity="0.5"
                  />
                  <text
                    x={padding.left - 8}
                    y={yVal + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="var(--color-text-muted)"
                  >
                    ₹{labelVal >= 1000 ? `${Math.round(labelVal / 1000)}k` : labelVal}
                  </text>
                </g>
              );
            })}

            {/* Month Axis Labels */}
            {[0, Math.round(maxMonths / 4), Math.round(maxMonths / 2), Math.round((3 * maxMonths) / 4), maxMonths].map(
              (m, idx) => {
                const xVal = getX(m);
                return (
                  <text
                    key={idx}
                    x={xVal}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--color-text-muted)"
                  >
                    M{m}
                  </text>
                );
              }
            )}

            {/* Area Fill */}
            <path d={areaPath} fill="url(#areaGradient)" />

            {/* Main Balance Line */}
            <path
              d={balancePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Interactive Data Points & Hover Detection */}
            {schedule.map((pt) => {
              const cx = getX(pt.month);
              const cy = getY(pt.remainingBalance);
              const isHovered = hoveredPoint?.month === pt.month;
              return (
                <g key={pt.month}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5.5 : 3}
                    fill={isHovered ? "#34d399" : "#10b981"}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <div className="absolute top-2 right-2 rounded-lg border border-[var(--color-border)] bg-slate-900/95 p-2.5 text-xs shadow-lg backdrop-blur-sm pointer-events-none">
              <p className="font-bold text-white mb-1">
                Month {hoveredPoint.month} of {tenure}
              </p>
              <div className="space-y-0.5 text-[11px]">
                <p className="text-emerald-400">
                  Remaining Balance: ₹{hoveredPoint.remainingBalance.toLocaleString("en-IN")}
                </p>
                <p className="text-slate-300">
                  Principal Paid: ₹{hoveredPoint.principalPaid.toLocaleString("en-IN")}
                </p>
                <p className="text-amber-400">
                  Interest Paid: ₹{hoveredPoint.interestPaid.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Monthly Breakdown Bar Chart */}
      {activeTab === "monthly" && (
        <div className="space-y-2 py-2">
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {schedule.slice(1).map((item) => (
              <div
                key={item.month}
                className="flex items-center gap-3 rounded bg-[var(--color-primary)] px-3 py-1.5 text-xs border border-[var(--color-border)]/50"
              >
                <span className="w-12 font-medium text-[var(--color-text-muted)]">
                  M{item.month}
                </span>
                <div className="flex-1 flex h-3 overflow-hidden rounded bg-slate-800">
                  <div
                    style={{
                      width: `${Math.round(
                        (item.principalPaid / (item.principalPaid + item.interestPaid || 1)) * 100
                      )}%`,
                    }}
                    className="bg-emerald-500 h-full"
                    title={`Principal: ₹${item.principalPaid}`}
                  />
                  <div
                    style={{
                      width: `${Math.round(
                        (item.interestPaid / (item.principalPaid + item.interestPaid || 1)) * 100
                      )}%`,
                    }}
                    className="bg-amber-500 h-full"
                    title={`Interest: ₹${item.interestPaid}`}
                  />
                </div>
                <span className="text-right text-[11px] text-[var(--color-text-muted)] w-28">
                  Bal: ₹{item.remainingBalance.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Schedule Table */}
      {activeTab === "table" && (
        <div className="max-h-56 overflow-y-auto overflow-x-auto rounded border border-[var(--color-border)]">
          <table className="min-w-full text-xs">
            <thead className="sticky top-0 bg-[var(--color-primary)] border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Principal (₹)</th>
                <th className="px-3 py-2 text-left">Interest (₹)</th>
                <th className="px-3 py-2 text-left">Total EMI (₹)</th>
                <th className="px-3 py-2 text-left">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {schedule.slice(1).map((item) => (
                <tr
                  key={item.month}
                  className="border-b border-[var(--color-border)]/40 hover:bg-[var(--color-primary)]/50"
                >
                  <td className="px-3 py-1.5 font-medium text-[var(--color-text-muted)]">
                    {item.month}
                  </td>
                  <td className="px-3 py-1.5 text-emerald-400">
                    ₹{item.principalPaid.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-1.5 text-amber-400">
                    ₹{item.interestPaid.toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-1.5 text-[var(--color-text-primary)]">
                    ₹{Math.round(item.principalPaid + item.interestPaid).toLocaleString("en-IN")}
                  </td>
                  <td className="px-3 py-1.5 text-[var(--color-text-muted)]">
                    ₹{item.remainingBalance.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AmortizationChart;
