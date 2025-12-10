# Personal Finance Tracker 💸

A full-stack MERN application to track **income**, **expenses**, and **monthly balances** with charts, dark mode, and savings goals.

Built with:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (JSON Web Tokens)

---

## Features

### Authentication

- User **registration** and **login**
- Passwords hashed
- JWT-based auth with protected routes

### Transactions

- Add **income** and **expenses**
- Edit / delete existing transactions
- Fields: type, amount, category, date, description
- All transactions saved per user

### Dashboard

- View data **per month & year**
- Summary cards:
  - Total income
  - Total expenses
  - Monthly balance
- **Savings Goal**:
  - Set a goal for the selected month
  - Progress bar based on that month’s balance
  - Goal stored in `localStorage`

### Analytics

- Totals **by category**
- Optional **charts**:
  - Pie chart: spending / income by category
  - Bar chart: monthly income vs expenses
- Button to toggle: _“Show statistics by graphs”_

### UX

- Dark / light mode toggle (persists in `localStorage`)
- Clean, responsive layout
- Protected routes (dashboard only for logged-in users)

---

## Project Structure

```bash
personal-finance-tracker/
├── server/                # Node.js + Express + MongoDB backend
│   ├── package.json
│   ├── .env               # NOT committed (local only)
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── index.js / server.js
├── client/                # React + Vite frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── .env               # frontend env (VITE_*)
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── services/
│       │   ├── api.js
│       │   └── transactionService.js
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           └── Dashboard.jsx
└── README.md
```
