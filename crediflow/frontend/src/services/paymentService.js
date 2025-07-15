import api from "./api";

export const makePayment = (data) => api.post("/payments", data);
export const getPaymentsByLoan = (loanId) =>
  api.get(`/payments/${loanId}`);
