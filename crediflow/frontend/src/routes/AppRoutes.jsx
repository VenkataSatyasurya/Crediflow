import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Auth pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Dashboard pages
import Dashboard from "../pages/dashboard/Dashboard";
import Loans from "../pages/loans/Loans";
import CreateLoan from "../pages/loans/CreateLoan";
import Payments from "../pages/payments/Payments";
import AdminLoans from "../pages/loans/AdminLoans";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/loans"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <Loans />
          </ProtectedRoute>
        }
      />

      <Route
        path="/loans/create"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <CreateLoan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={["customer", "admin"]}>
            <Payments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/loans"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminLoans />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
