# 🐝 eBee - Smart Income & Expense Tracker

eBee is a modern, fast, and feature-rich web application that allows you to easily manage your personal or corporate financial transactions (income/expenses) from a centralized dashboard. It supports multiple workspaces for isolated financial tracking.

![eBee Dashboard](https://via.placeholder.com/800x450?text=eBee+Dashboard)

## 🌟 Key Features

- **Multi-Workspace System:** Track your personal expenses and company budget separately without mixing them up.
- **Planned Transactions:** Enter future payments or expected income as "Planned". View them on your dashboard without affecting your current net balance. Click the (✅) button when the date arrives to process the transaction.
- **Bulk Data Management:** Easily reset all transaction data for a specific month with a single click in the settings.
- **Dynamic Charts & Balance:** Interactive dashboard powered by Chart.js, showing your expense distribution by category and overall monthly trends.
- **Document & Invoice Attachments:** Upload receipts, invoices, or documents to your income/expense records to create a digital archive.
- **Real-Time Data Processing:** Powered by Node.js and Express.js backend, providing embedded and persistent data management via SQLite.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Vanilla JavaScript, Vanilla CSS (Modern CSS Variables, Flexbox, CSS Grid)
- **Backend:** Node.js, Express.js
- **Database:** SQLite (better-sqlite3)
- **Data Visualization:** Chart.js

## 🚀 Installation & Setup

Follow these steps to run the project locally on your machine:

### Prerequisites
- You must have [Node.js](https://nodejs.org/) installed on your computer.

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iboturkyilmaz/ebee.git
   cd ebee
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   node server.js
   ```

4. **Start tracking:**
   Open your browser and navigate to `http://localhost:3000`. Your data will be automatically and securely stored in an `ebee.db` file within the root directory of the application.

## 🤝 Contributing

This project is completely open-source and open to contributions. Feel free to submit a Pull Request to help the project grow.

## 📜 License

This project is licensed under the MIT License.
