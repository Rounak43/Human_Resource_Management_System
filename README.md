# Enterprise Human Resource Management System (HRMS)

A robust, secure, and production-ready Human Resource Management System (HRMS) designed to streamline organizational operations. This application features a modular React.js frontend and a high-performance Express/PostgreSQL backend API, equipped with role-based access control, attendance tracking, leave processing, automated payroll management, and real-time dashboard analytics.

---

## 🚀 Key Features

### 👤 Employee Self-Service
- **Profile Management**: View corporate files, job designation, contact records, and current contract details.
- **Attendance Tracker**: Seamless daily check-in and check-out logs with automated calculations for working hours, overtime hours, and late check-in minutes.
- **Leave Operations**: Submit leave requests with custom categories, reasons, and duration, alongside a real-time status tracker (Pending/Approved/Rejected).
- **Payroll Center**: Download monthly payslip statements with itemized details (Basic Salary, Allowances, Tax Deductions, PF, and Net Paid sum).

### 🔑 Administrative Control (HR & Admin)
- **Employee Directory**: Complete CRUD operations for employee file creation, updating, and suspension.
- **Attendance Audit**: Access and adjust check-in/out logs for any employee.
- **Leave Approval Panel**: Audit and process pending leave request backlogs with optional comments.
- **Payroll Config & Declarations**: Define basic salaries, calculate allowances/deductions, and generate monthly ledger logs.
- **Analytical Reports**: Real-time charts showing department headcount distribution, monthly expenditures, and leave statistics.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite) utilizing isolated Vanilla CSS modules for pixel-perfect design control and visual performance.
- **Backend**: Node.js + Express.js API Server written in modular ES6 imports.
- **Database**: PostgreSQL with parameterized queries using `pg-pool` to prevent SQL injection.
- **Security**: 
  - JWT (JSON Web Tokens) for authentication.
  - Role-based Access Control (RBAC) middleware.
  - CORS, Helmet, and express-validator sanitization.
  - Password hashing via `bcrypt`.

---

## 📁 Project Structure

```text
├── client/                  # Frontend React SPA
│   ├── src/
│   │   ├── components/      # Reusable UI elements (Navbar, Sidebar, Card)
│   │   ├── context/         # Auth, Theme, and Notification contexts
│   │   ├── layouts/         # Page shell layouts (AuthLayout, AdminLayout)
│   │   ├── pages/           # Page components (Dashboard, Leave, Payroll, Reports)
│   │   ├── services/        # HTTP client wrappers (api.js, adminService.js)
│   │   └── utils/           # Validation helpers
└── server/                  # Backend Express Server
    ├── config/              # Database pool and JWT configuration
    ├── controllers/         # Request handling controllers
    ├── database/            # DDL schemas and mock seed data
    ├── middleware/          # JWT check & Role verification middlewares
    ├── models/              # Active Record database client models
    ├── routes/              # Express API routing layer
    └── services/            # Transactional business logic layer
```

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Docker & Docker Compose (for quick local PostgreSQL execution)

### 1. Database Setup
Spin up the pre-configured PostgreSQL server container:
```bash
docker-compose up -d
```
The database will be initialized at `localhost:5432` with username `hrms_user` and database name `hrms_db`.
*Access pgAdmin at `http://localhost:5050` with email `admin@hrms.com` and password `adminpassword`.*

### 2. Backend Server Execution
```bash
cd server
npm install
npm run dev
```
The backend server runs at `http://localhost:5000`.

### 3. Frontend Client Execution
```bash
cd client
npm install
npm run dev
```
The development server runs at `http://localhost:5173` (or configured Vite port).

---

## 🔒 API Endpoints Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| **POST** | `/api/auth/login` | Authenticate user and get JWT token | Public |
| **POST** | `/api/auth/register` | Register a new user | Admin |
| **GET** | `/api/employee/profile` | Retrieve active user profile | Authenticated |
| **GET** | `/api/admin/employees` | List all employee files | Admin/HR |
| **POST** | `/api/admin/employees` | Register a new employee & user account | Admin |
| **PATCH** | `/api/admin/leaves/:id/approve` | Approve a pending leave request | Admin/HR |
| **POST** | `/api/admin/payroll/:employeeId` | Generate payroll statement for employee | Admin |
| **GET** | `/api/admin/reports` | Get organizational breakdown analytics | Admin |

---

## 🛠️ Development Guidelines

### Git Branching Strategy
- Feature branches should follow standard naming conventions: `feature/module-name` (e.g. `feature/attendance-tracker`).
- Bug fixes should use `bugfix/issue-name` (e.g. `bugfix/registration-constraint`).
- All pull requests should target the main development branch.

### Commit Conventions
Commits must be descriptive and follow conventional patterns:
- `feat: add monthly payslip export option`
- `fix: resolve check-in button state loading lag`
- `refactor: clean up database transaction handling`
- `docs: update setup steps in README`
