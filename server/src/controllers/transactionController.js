const Transaction = require("../models/Transaction");
const { validationResult } = require("express-validator");

// POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, category, date, description } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      date: date || new Date(),
      description,
    });

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      date: -1,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!transaction) {
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }

    res.json(transaction);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!transaction) {
      const error = new Error("Transaction not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    next(err);
  }
};

// GET /api/transactions/summary/monthly
const getMonthlySummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;

    const y = Number(year);
    const m = Number(month); // 1-12

    // Use UTC to avoid time zone shifting problems
    const startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const byCategory = {};

    transactions.forEach((t) => {
      if (t.type === "income") {
        totalIncome += t.amount;
      } else if (t.type === "expense") {
        totalExpenses += t.amount;
      }

      if (!byCategory[t.category]) {
        byCategory[t.category] = 0;
      }
      byCategory[t.category] += t.amount;
    });

    const balance = totalIncome - totalExpenses;

    const byCategoryArray = Object.entries(byCategory).map(
      ([category, total]) => ({
        category,
        total,
      })
    );

    res.json({
      year: y,
      month: m,
      totalIncome,
      totalExpenses,
      balance,
      byCategory: byCategoryArray,
    });
  } catch (err) {
    next(err);
  }
};
const getYearlySummary = async (req, res, next) => {
  try {
    const { year } = req.query;

    // Whole year range: Jan 1 → Dec 31, 23:59:59.999
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const byCategory = {};

    transactions.forEach((t) => {
      if (t.type === "income") {
        totalIncome += t.amount;
      } else if (t.type === "expense") {
        totalExpenses += t.amount;
      }

      if (!byCategory[t.category]) {
        byCategory[t.category] = 0;
      }
      byCategory[t.category] += t.amount;
    });

    const balance = totalIncome - totalExpenses;

    const byCategoryArray = Object.entries(byCategory).map(
      ([category, total]) => ({
        category,
        total,
      })
    );

    res.json({
      year: Number(year),
      totalIncome,
      totalExpenses,
      balance,
      byCategory: byCategoryArray,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getYearlySummary,
};
