const Transaction = require("../models/Transaction");

/**
 * Create a new transaction
 */
const createTransaction = async ({ userId, type, category, amount, date, description }) => {
  // ensure date is a Date object if provided
  const txDate = date ? new Date(date) : new Date();

  const transaction = await Transaction.create({
    user: userId,
    type,
    category,
    amount,
    date: txDate,
    description,
  });

  return transaction;
};

/**
 * Get all transactions for a user (optionally filtered later)
 */
const getTransactions = async (userId) => {
  const transactions = await Transaction.find({ user: userId })
    .sort({ date: -1, createdAt: -1 });

  return transactions;
};

/**
 * Get a single transaction by ID (ensuring it belongs to the user)
 */
const getTransactionById = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Update a transaction (only if it belongs to the user)
 */
const updateTransaction = async (userId, transactionId, updates) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, user: userId },
    { $set: updates },
    { new: true } // return updated document
  );

  if (!transaction) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Delete a transaction (only if it belongs to the user)
 */
const deleteTransaction = async (userId, transactionId) => {
  const deleted = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
  });

  if (!deleted) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }

  return deleted;
};

/**
 * Get monthly summary for analytics:
 * - totals for income & expenses
 * - balance
 * - spending by category
 */
const getMonthlySummary = async (userId, year, month) => {
  // month is 1–12; JS Date uses 0–11
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1); // first day of next month

  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lt: endDate },
  }).lean();

  let totalIncome = 0;
  let totalExpense = 0;
  const byCategory = {};

  transactions.forEach((tx) => {
    const isIncome = tx.type === "income";
    const amount = Number(tx.amount) || 0;

    if (isIncome) {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }

    const cat = tx.category || "Uncategorized";
    if (!byCategory[cat]) byCategory[cat] = 0;
    byCategory[cat] += amount;
  });

  const balance = totalIncome - totalExpense;

  return {
    year,
    month,
    totalIncome,
    totalExpense,
    balance,
    byCategory,
  };
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
};
