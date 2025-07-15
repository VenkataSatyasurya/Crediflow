import api from "./api";

/**
 * Get dashboard statistics
 * Returns role-specific metrics:
 * - Admin: system-wide metrics (total loans, approval rate, disbursed amount, etc.)
 * - Customer: personal metrics (my loans, disbursed, paid, outstanding)
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
