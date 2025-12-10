const express = require("express");
const router = express.Router();

// GET /api/health
router.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Personal Finance Tracker API is running",
  });
});

module.exports = router;
