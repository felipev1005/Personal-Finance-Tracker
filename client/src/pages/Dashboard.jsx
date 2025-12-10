import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  fetchMonthlySummary,
  updateTransaction,
} from "../services/transactionService.js";

// Charts (chart.js + react-chartjs-2)
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Base style for summary cards (light theme version)
const baseSummaryCardStyle = {
  flex: 1,
  border: "1px solid #ccc",
  borderRadius: "6px",
  padding: "1rem",
  backgroundColor: "#ffffff",
  textAlign: "center",
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Summary card style that adapts to theme
  const getSummaryCardStyle = () => ({
    ...baseSummaryCardStyle,
    backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
    color: theme === "dark" ? "#f5f5f5" : "#333",
  });

  // Form state
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // Editing
  const [editingId, setEditingId] = useState(null);

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Monthly summary
  const [summary, setSummary] = useState(null);

  // Month/year selection
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12

  // Charts toggle
  const [showCharts, setShowCharts] = useState(false);

  // Savings goal (localStorage)
  const [savingsGoal, setSavingsGoal] = useState("");

  // Load summary for selected month/year
  const loadSummary = async (year = selectedYear, month = selectedMonth) => {
    try {
      const data = await fetchMonthlySummary(year, month);
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load transactions + summary on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchTransactions();
        setTransactions(data);

        await loadSummary(selectedYear, selectedMonth);
      } catch (err) {
        console.error(err);
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Load saved savingsGoal from localStorage
  useEffect(() => {
    const storedGoal = localStorage.getItem("savingsGoal");
    if (storedGoal) {
      setSavingsGoal(storedGoal);
    }
  }, []);

  const handleYearChange = async (e) => {
    const newYear = Number(e.target.value) || selectedYear;
    setSelectedYear(newYear);
    await loadSummary(newYear, selectedMonth);
  };

  const handleMonthChange = async (e) => {
    const newMonth = Number(e.target.value) || selectedMonth;
    setSelectedMonth(newMonth);
    await loadSummary(selectedYear, newMonth);
  };

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setCategory("");
    setDate("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category) {
      setError("Amount and category are required.");
      return;
    }

    try {
      setError("");

      const payload = {
        type,
        amount: Number(amount),
        category,
        date: date || new Date().toISOString(),
        description,
      };

      if (editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await createTransaction(payload);
      }

      const data = await fetchTransactions();
      setTransactions(data);

      await loadSummary(selectedYear, selectedMonth);

      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to save transaction.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;

    try {
      setError("");
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));

      await loadSummary(selectedYear, selectedMonth);
    } catch (err) {
      console.error(err);
      setError("Failed to delete transaction.");
    }
  };

  const handleEditClick = (transaction) => {
    setEditingId(transaction._id);
    setType(transaction.type);
    setAmount(transaction.amount);
    setCategory(transaction.category || "");
    setDescription(transaction.description || "");

    if (transaction.date) {
      const d = new Date(transaction.date);
      const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
      setDate(iso);
    } else {
      setDate("");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveGoal = () => {
    if (!savingsGoal) {
      localStorage.removeItem("savingsGoal");
    } else {
      localStorage.setItem("savingsGoal", savingsGoal);
    }
  };

  // Filtered transactions for selected month/year
  const filteredTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const d = new Date(t.date);

    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;

    return y === selectedYear && m === selectedMonth;
  });

  // Chart data
  let categoryPieData = null;
  let incomeExpenseBarData = null;
  let barOptions = null;

  if (summary && summary.byCategory && summary.byCategory.length > 0) {
    const colorPalette = [
      "#4885ed",
      "#db3236",
      "#f4c20d",
      "#3cba54",
      "#ff6d01",
      "#9c27b0",
    ];

    categoryPieData = {
      labels: summary.byCategory.map((c) => c.category),
      datasets: [
        {
          data: summary.byCategory.map((c) => c.total),
          backgroundColor: summary.byCategory.map(
            (_, idx) => colorPalette[idx % colorPalette.length]
          ),
          borderWidth: 1,
        },
      ],
    };

    incomeExpenseBarData = {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          label: "Amount",
          data: [summary.totalIncome, summary.totalExpenses],
          backgroundColor: "#4c6fff",
          barThickness: 40,
          maxBarThickness: 40,
        },
      ],
    };

    barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        title: { display: true, text: "Income vs Expenses" },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
  }

  // savings goal progress calculation
  const goalNumber = parseFloat(savingsGoal) || 0;
  let progressPercent = 0;

  if (goalNumber > 0 && summary) {
    const raw = (summary.balance / goalNumber) * 100;
    if (raw < 0) progressPercent = 0;
    else if (raw > 100) progressPercent = 100;
    else progressPercent = raw;
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "1rem" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1>Personal Finance Tracker</h1>
        <div>
          {user && (
            <span style={{ marginRight: "1rem" }}>
              Hi, {user.name || user.email}
            </span>
          )}

          {/* Dark/Light toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{ marginRight: "0.5rem" }}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Month / Year selector */}
      <section style={{ marginBottom: "1.5rem" }}>
        <h2>View Month</h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div>
            <label>
              Year:&nbsp;
              <input
                type="number"
                value={selectedYear}
                onChange={handleYearChange}
                style={{ width: "6rem" }}
              />
            </label>
          </div>
          <div>
            <label>
              Month:&nbsp;
              <select value={selectedMonth} onChange={handleMonthChange}>
                <option value={1}>01</option>
                <option value={2}>02</option>
                <option value={3}>03</option>
                <option value={4}>04</option>
                <option value={5}>05</option>
                <option value={6}>06</option>
                <option value={7}>07</option>
                <option value={8}>08</option>
                <option value={9}>09</option>
                <option value={10}>10</option>
                <option value={11}>11</option>
                <option value={12}>12</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Monthly summary + savings goal row */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {/* Summary cards */}
        {summary && (
          <>
            <div
              style={{
                ...getSummaryCardStyle(),
                borderColor: "#3cba54",
                minWidth: "180px",
              }}
            >
              <h3>Total Income</h3>
              <p>${summary.totalIncome.toFixed(2)}</p>
            </div>

            <div
              style={{
                ...getSummaryCardStyle(),
                borderColor: "#db3236",
                minWidth: "180px",
              }}
            >
              <h3>Total Expenses</h3>
              <p>${summary.totalExpenses.toFixed(2)}</p>
            </div>

            <div
              style={{
                ...getSummaryCardStyle(),
                borderColor: "#4885ed",
                minWidth: "180px",
              }}
            >
              <h3>Balance</h3>
              <p
                style={{
                  color:
                    summary.balance > 0
                      ? "green"
                      : summary.balance < 0
                      ? "crimson"
                      : "inherit",
                }}
              >
                ${summary.balance.toFixed(2)}
              </p>
            </div>
          </>
        )}

        {/* Savings Goal card */}
        <div
          style={{
            ...getSummaryCardStyle(),
            borderColor: "#ff9800",
            minWidth: "220px",
          }}
        >
          <h3>Savings Goal</h3>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            This goal is compared against the{" "}
            <strong>balance for the selected month</strong>.
          </p>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Goal amount:&nbsp;
              <input
                type="number"
                min="0"
                step="0.01"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                style={{ width: "7rem" }}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleSaveGoal}
            style={{ marginBottom: "0.5rem" }}
          >
            Save goal
          </button>

          <div style={{ marginTop: "0.5rem" }}>
            <p style={{ marginBottom: "0.25rem" }}>
              Progress:{" "}
              {goalNumber > 0 && summary
                ? `${progressPercent.toFixed(1)}%`
                : "—"}
            </p>
            <div
              style={{
                width: "100%",
                height: "10px",
                borderRadius: "999px",
                backgroundColor: "#eee",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width:
                    goalNumber > 0 && summary
                      ? `${progressPercent}%`
                      : "0%",
                  height: "100%",
                  backgroundColor: "#ff9800",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}

      {/* By Category + toggle charts */}
      {summary && summary.byCategory && summary.byCategory.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>By Category</h2>

          <ul>
            {summary.byCategory.map((c) => (
              <li key={c.category}>
                <strong>{c.category}:</strong> ${c.total.toFixed(2)}
              </li>
            ))}
          </ul>

          <button
            style={{ marginTop: "0.75rem" }}
            onClick={() => setShowCharts((prev) => !prev)}
          >
            {showCharts ? "Hide statistics" : "Show statistics by graphs"}
          </button>

          {showCharts && categoryPieData && incomeExpenseBarData && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                marginTop: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 300, height: 300 }}>
                  <Pie data={categoryPieData} />
                </div>
              </div>

              <div style={{ width: "100%", height: 250 }}>
                <Bar data={incomeExpenseBarData} options={barOptions} />
              </div>
            </div>
          )}
        </section>
      )}

      {/* New / Edit transaction form */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Type:&nbsp;
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Amount:&nbsp;
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Category:&nbsp;
              <input
                type="text"
                placeholder="Food, Salary, Transport..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Date:&nbsp;
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>
              Description:&nbsp;
              <input
                type="text"
                placeholder="Optional note"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="submit">
              {editingId ? "Update transaction" : "Save transaction"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Transactions list */}
      <section>
        <h2>
          Transactions for {String(selectedMonth).padStart(2, "0")}/
          {selectedYear}
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : filteredTransactions.length === 0 ? (
          <p>No transactions for this month.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    textAlign: "left",
                  }}
                >
                  Date
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    textAlign: "left",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    textAlign: "left",
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    textAlign: "right",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                    textAlign: "left",
                  }}
                >
                  Description
                </th>
                <th
                  style={{
                    borderBottom: "1px solid #ccc",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t._id}>
                  <td>
                    {t.date
                      ? new Date(t.date).toLocaleDateString("en-CA", {
                          timeZone: "UTC",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })
                      : ""}
                  </td>
                  <td>{t.type}</td>
                  <td>{t.category}</td>
                  <td style={{ textAlign: "right" }}>
                    {t.amount.toFixed ? t.amount.toFixed(2) : t.amount}
                  </td>
                  <td>{t.description}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleEditClick(t)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(t._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
