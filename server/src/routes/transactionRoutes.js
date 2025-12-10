const express = require("express");
const router = express.Router();

const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getYearlySummary,
} = require("../controllers/transactionController");

const { authenticate } = require("../middleware/authMiddleware");
const {
  createTransactionValidation,
} = require("../middleware/validators/transactionValidators");

// Create a transaction
router.post(
  "/",
  authenticate,
  createTransactionValidation,
  createTransaction
);

// Get all transactions for the logged-in user
router.get("/", authenticate, getTransactions);

// Update a transaction
router.put(
  "/:id",
  authenticate,
  createTransactionValidation,
  updateTransaction
);

// Delete a transaction
router.delete("/:id", authenticate, deleteTransaction);

// Monthly summary
router.get("/summary/monthly", authenticate, getMonthlySummary);
router.get("/summary/yearly", authenticate, getYearlySummary );

module.exports = router;
