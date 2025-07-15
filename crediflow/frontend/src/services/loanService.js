import api from "./api";

/**
 * Create a new loan (Customer)
 */
export const createLoan = async (payload) => {
  const { data } = await api.post("/loans", payload);
  return data;
};

/**
 * Get loans (Admin: all | Customer: own loans)
 */
export const getLoans = async () => {
  const { data } = await api.get("/loans");
  return data;
};

/**
 * Update loan status (Admin only)
 */
export const updateLoanStatus = async (loanId, status) => {
  const { data } = await api.put(`/loans/${loanId}/status`, { status });
  return data;
};
