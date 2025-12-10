const { body } = require("express-validator");

const createTransactionValidation = [
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be 'income' or 'expense'"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("category")
    .isString()
    .notEmpty()
    .withMessage("Category is required"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be a valid ISO date"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

module.exports = { createTransactionValidation };
