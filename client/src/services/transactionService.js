// client/src/services/transactionService.js
import api from "../api.js";

// GET /api/transactions
export const fetchTransactions = async () => {
  const res = await api.get("/transactions");
  return res.data;
};

// POST /api/transactions
export const createTransaction = async (data) => {
  const res = await api.post("/transactions", data);
  return res.data;
};

// DELETE /api/transactions/:id
export const deleteTransaction = async (id) => {
  const res = await api.delete(`/transactions/${id}`);
  return res.data;
};

// 👉 NEW: GET /api/transactions/summary/monthly
export const fetchMonthlySummary = async (year, month) => {
  const res = await api.get("/transactions/summary/monthly", {
    params: { year, month },
  });
  return res.data;
};

// (optional, for later charts) GET /summary/yearly
export const fetchYearlySummary = async (year) => {
  const res = await api.get("/transactions/summary/yearly", {
    params: { year },
  });
  return res.data;
};


export default {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  fetchMonthlySummary,
  fetchYearlySummary,
};
export const updateTransaction = async (id, transactionData) => {
  const res = await api.put(`/transactions/${id}`, transactionData);
  return res.data;
};