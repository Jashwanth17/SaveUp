# SaveUp – Smart Personal Finance & Salary Management Platform

> **Tagline:** *"Know what you can spend today."*

SaveUp is a salary-based personal finance management application that calculates how much money users can safely spend every day based on their actual salary, fixed commitments, savings goals, day-to-day expenses, and upcoming scheduled payments.

---

## 🏛️ Professional Architecture & Project Structure

The codebase is structured following an enterprise **Domain-Driven / Feature-Sliced Architecture**:

```
e:\SaveUp\
├── src/
│   ├── components/                 # Shared Cross-Cutting Components
│   │   ├── common/                 # Common reusable icons & components (CategoryIcon, etc.)
│   │   ├── modals/                 # Global shared modals (AddTransactionModal, ReceiptModal)
│   │   ├── navigation/             # App navigation shell (Sidebar, Navbar)
│   │   └── ui/                     # Design System Primitives (Card, Badge, StatCard, ProgressBar)
│   ├── features/                   # Isolated Domain Features (Feature-Sliced Design)
│   │   ├── dashboard/              # Daily allowance hero, triple balance cards, recent transactions
│   │   ├── calendar/               # Monthly grid, weekly pacing, daily breakdown, scheduled bills
│   │   ├── expenses/               # Transaction management, multi-filters, split settlements
│   │   ├── salary-cycle/           # Dynamic formula breakdown, triple balances, sandbox sliders
│   │   ├── savings/                # Multiple savings goals, emergency fund runway, streak tracking
│   │   ├── simulator/              # Pre-purchase "What-If" ripple effect simulator
│   │   ├── subscriptions/          # Recurring subscriptions, burn rate & annual outflow
│   │   ├── analytics/              # Recharts visualizations (Area, Bar, Donut, Line)
│   │   ├── insights/               # Explainable Financial Health Score (0-100) & challenges
│   │   └── setup/                  # Financial Onboarding & salary cycle configuration wizard
│   ├── services/                   # Business Logic & Infrastructure Layer
│   │   ├── calculationEngine.ts    # Pure math engine for allowances, health score & simulations
│   │   ├── storageService.ts       # Typed LocalStorage persistence abstraction with versioning
│   │   └── exportService.ts        # CSV ledger and printable PDF reports exporter
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useFinance.ts           # Central financial state hook
│   │   └── useDebounce.ts          # Search input debouncing hook
│   ├── context/                    # State Management
│   │   └── FinanceContext.tsx      # React Context Provider managing application state
│   ├── types/                      # Domain Type Definitions
│   │   └── index.ts                # TypeScript interfaces, unions, and models
│   ├── data/                       # Seed & Mock Data
│   │   └── mockData.ts             # Comprehensive initial dataset
│   ├── utils/                      # Pure Utility Helpers
│   │   └── formatters.ts           # INR currency, number, and localized date formatters
│   ├── App.tsx                     # Main application layout and view router
│   ├── main.tsx                    # Vite React application entry point
│   └── index.css                   # Tailwind CSS, Google Fonts, and design tokens
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

---

## 🌟 Key Features

1. **Daily Spending Allowance Engine:**
   - Formula:
     $$\text{Daily Allowance} = \frac{\text{In-Hand Salary} + \text{Addl Income} - \text{Fixed Bills} - \text{Savings Target} - \text{Actual Cycle Spend}}{\text{Remaining Cycle Days}}$$
   - Triple Balance Architecture: **Actual Balance**, **Planned Safe Balance**, and **Projected Month-End Balance**.

2. **Smart Financial Calendar:**
   - Monthly and Weekly views highlighting salary credit days (`PAY`), daily expense totals, and upcoming bills.
   - Click any date to view its transactions, adherence to the daily allowance, or schedule future commitments.

3. **Expense Management & Friend Splits:**
   - Search, multi-filtering by category, payment method (UPI, cards, cash), and date range.
   - Built-in expense splitting among friends with settlement status (`Paid` vs `Pending`).
   - Receipt attachment viewer and CSV export.

4. **Pre-Purchase Simulator ("What-If" Analysis):**
   - Test purchases (e.g. iPhone, travel) to preview immediate impact on your future daily allowance, upcoming bills, and monthly savings.

5. **Goal-Based Savings & Emergency Runway:**
   - Emergency Fund Runway Calculator (months of essential living costs covered).
   - Custom savings goals with deposit/withdraw actions and confetti milestone celebrations.

6. **Subscriptions Burn Tracker:**
   - Active and paused recurring plans with monthly burn rate and annualized cost calculations.

7. **Financial Analytics & Health Score:**
   - Recharts-powered graphs: Daily spending velocity, 6-month historical income vs expense comparison, category donut, and wealth trajectory.
   - Explainable Financial Health Score (0–100) broken down into savings rate, fixed cost burden, daily discipline, and emergency runway.
