import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ message: "", field: "", type: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  // Compute password strength
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: "", color: "" };

    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || /[A-Z]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-400" };
    if (score === 2 || score === 3) return { score: 2, label: "Medium", color: "bg-amber-400", text: "text-amber-400" };
    return { score: 3, label: "Strong", color: "bg-[#00c7ab]", text: "text-[#00c7ab]" };
  }, [formData.password]);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = "Please enter your full name.";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      errors.email = "Please enter your email address.";
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email format (e.g. name@company.com).";
    }

    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = "You must agree to the Terms of Service to create an account.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

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
      const data = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      loginUser(data);
      navigate("/");
    } catch (err) {
      const status = err.response?.status;
      const respData = err.response?.data;
      const serverMsg = respData?.message;
      const serverField = respData?.field || "";

      if (serverMsg?.includes("already exists") || status === 400 && serverField === "email") {
        setErrorInfo({
          message: serverMsg || "An account with this email already exists.",
          field: "email",
          type: "account_exists",
        });
      } else if (!err.response || err.code === "ERR_NETWORK") {
        setErrorInfo({
          message: "Unable to connect to the CrediFlow service. Please check your internet connection or try again in a moment.",
          field: "general",
          type: "network",
        });
      } else {
        setErrorInfo({
          message: serverMsg || "We encountered an issue creating your account. Please check your details and try again.",
          field: serverField || "general",
          type: "general",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0d14] px-4 py-10 text-slate-100 selection:bg-[#00c7ab]/30 selection:text-[#00c7ab]">
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-40 right-1/2 translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[#00c7ab]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#121620]/90 p-7 shadow-2xl backdrop-blur-xl sm:p-9">
          
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#00c7ab]/20 to-teal-500/10 border border-[#00c7ab]/30 shadow-lg shadow-[#00c7ab]/10">
              <svg className="h-7 w-7 text-[#00c7ab]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Create Your Account
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Join CrediFlow for streamlined loan approvals
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
                  
                  {/* Action Link when Account Already Exists */}
                  {errorInfo.type === "account_exists" && (
                    <Link
                      to="/login"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#00c7ab] transition hover:text-[#00c7ab]/80 hover:underline"
                    >
                      <span>Sign in to your existing account</span>
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alexander Mitchell"
                  autoComplete="name"
                  className={`w-full rounded-xl border bg-slate-900/80 py-2.5 pl-10 pr-3.5 text-sm text-slate-100 transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                    fieldErrors.name || errorInfo.field === "name"
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-700/70 focus:border-[#00c7ab] focus:ring-[#00c7ab]/20"
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Password
                </label>
                {formData.password && (
                  <span className={`text-xs font-medium ${passwordStrength.text}`}>
                    Strength: {passwordStrength.label}
                  </span>
                )}
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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

              {/* Password Strength Visual Bar */}
              {formData.password && (
                <div className="mt-2 flex gap-1.5">
                  <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-800"}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-800"}`} />
                  <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-800"}`} />
                </div>
              )}

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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                Confirm Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`w-full rounded-xl border bg-slate-900/80 py-2.5 pl-10 pr-10 text-sm text-slate-100 transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                    fieldErrors.confirmPassword
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "border-[#00c7ab]/60 focus:border-[#00c7ab] focus:ring-[#00c7ab]/20"
                      : "border-slate-700/70 focus:border-[#00c7ab] focus:ring-[#00c7ab]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-200"
                >
                  {showConfirmPassword ? (
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
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                  <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms of Service Checkbox */}
            <div className="pt-1">
              <label className="flex cursor-pointer items-start gap-2.5 text-xs text-slate-400 select-none">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-[#00c7ab] focus:ring-[#00c7ab]/30"
                />
                <span>
                  I agree to the{" "}
                  <span className="text-[#00c7ab] hover:underline">Terms of Service</span> and{" "}
                  <span className="text-[#00c7ab] hover:underline">Privacy Policy</span>
                </span>
              </label>
              {fieldErrors.agreeTerms && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.agreeTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00c7ab] to-teal-400 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-[#00c7ab]/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-slate-950" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#00c7ab] transition hover:text-teal-300 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Security Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-center text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#00c7ab]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            Bank-Grade Data Encryption
          </span>
          <span className="text-slate-700">•</span>
          <span className="inline-flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-[#00c7ab]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Instant Role Assignment
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
