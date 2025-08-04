import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ message: "", field: "", type: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showForgotModal, setShowForgotModal] = useState(false);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email format (e.g. name@company.com).";
    }

    if (!formData.password) {
      errors.password = "Please enter your password.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time clearing of error states when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errorInfo.field === name || errorInfo.message) {
      setErrorInfo({ message: "", field: "", type: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorInfo({ message: "", field: "", type: "" });

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const data = await login(formData);
      loginUser(data);
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      const respData = err.response?.data;
      const serverMsg = respData?.message;
      const serverField = respData?.field || "";

      if (status === 404) {
        setErrorInfo({
          message: serverMsg || "We couldn't find an account matching that email address.",
          field: "email",
          type: "account_not_found",
        });
      } else if (status === 401) {
        setErrorInfo({
          message: serverMsg || "The password you entered is incorrect. Please check your credentials.",
          field: "password",
          type: "wrong_password",
        });
      } else if (status === 400) {
        setErrorInfo({
          message: serverMsg || "Please ensure all fields are filled correctly.",
          field: serverField,
          type: "validation",
        });
      } else if (!err.response || err.code === "ERR_NETWORK") {
        setErrorInfo({
          message: "Unable to connect to the CrediFlow service. Please check your internet connection or try again in a moment.",
          field: "general",
          type: "network",
        });
      } else {
        setErrorInfo({
          message: serverMsg || "We encountered an unexpected issue during sign-in. Please try again.",
          field: serverField || "general",
          type: "general",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") {
      setFormData({ email: "admin@crediflow.com", password: "adminpassword123" });
    } else {
      setFormData({ email: "customer@crediflow.com", password: "customerpassword123" });
    }
    setFieldErrors({});
    setErrorInfo({ message: "", field: "", type: "" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0d14] px-4 py-10 text-slate-100 selection:bg-[#00c7ab]/30 selection:text-[#00c7ab]">
      {/* Background Decorative Glow Effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[#00c7ab]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121620]/90 p-7 shadow-2xl backdrop-blur-xl sm:p-9">
          
          {/* Header Brand */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00c7ab]/20 to-teal-500/10 border border-[#00c7ab]/30 shadow-lg shadow-[#00c7ab]/10">
              <svg className="h-7 w-7 text-[#00c7ab]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Credi<span className="text-[#00c7ab]">Flow</span>
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Secure enterprise loan & repayment platform
            </p>
          </div>

          {/* Contextual Alert Banner */}
          {errorInfo.message && (
            <div className="mb-5 animate-in fade-in zoom-in-95 duration-200 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium leading-relaxed">{errorInfo.message}</p>
                  
                  {/* Action Link for Unregistered Accounts */}
                  {errorInfo.type === "account_not_found" && (
                    <Link
                      to="/register"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#00c7ab] transition hover:text-[#00c7ab]/80 hover:underline"
                    >
                      <span>Create an account now</span>
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  )}

                  {/* Database Connection Guidance */}
                  {errorInfo.message.toLowerCase().includes("database") && (
                    <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-950/40 p-2.5 text-xs text-amber-200">
                      💡 <strong>Quick Fix:</strong> Start your local MongoDB service (port 27017) or add a free cloud MongoDB Atlas connection URI to <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px] text-amber-300">backend/.env</code>.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={`w-full rounded-xl border bg-slate-900/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-100 transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                    fieldErrors.email || errorInfo.field === "email"
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-700/70 focus:border-[#00c7ab] focus:ring-[#00c7ab]/20"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-slate-400 transition hover:text-[#00c7ab]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className={`w-full rounded-xl border bg-slate-900/80 py-2.5 pl-10 pr-10 text-sm text-slate-100 transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                    fieldErrors.password || errorInfo.field === "password"
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-700/70 focus:border-[#00c7ab] focus:ring-[#00c7ab]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-200"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400 select-none hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-[#00c7ab] focus:ring-[#00c7ab]/30 focus:ring-offset-0"
                />
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00c7ab] to-teal-400 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-[#00c7ab]/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-slate-950" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="mt-6 border-t border-slate-800/80 pt-5">
            <p className="mb-2.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
              ⚡ Quick Fill Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemo("customer")}
                className="group flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-[#00c7ab]/50 hover:bg-slate-800/80 hover:text-white"
              >
                <span className="text-slate-400 group-hover:text-[#00c7ab]">👤</span>
                <span>Demo Customer</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                className="group flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-[#00c7ab]/50 hover:bg-slate-800/80 hover:text-white"
              >
                <span className="text-slate-400 group-hover:text-[#00c7ab]">🛡️</span>
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don’t have an account yet?{" "}
            <Link
              to="/register"
              className="font-semibold text-[#00c7ab] transition hover:text-teal-300 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Security & Compliance Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-center text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#00c7ab]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            256-Bit SSL Protection
          </span>
          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#00c7ab]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Real-time Loan Tracking
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#121620] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00c7ab]/10 text-[#00c7ab] border border-[#00c7ab]/20">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Password Recovery</h3>
                <p className="text-xs text-slate-400">CrediFlow Account Services</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-300">
              For security compliance in this demo environment, please use the predefined demo accounts or register a new customer account.
            </p>
            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/80 p-2.5 text-xs text-slate-400">
              💡 <span className="text-slate-200">Tip:</span> Use <strong className="text-[#00c7ab]">customer@crediflow.com</strong> / <strong className="text-[#00c7ab]">customerpassword123</strong>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="mt-5 w-full cursor-pointer rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
