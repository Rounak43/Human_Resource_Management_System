# Enterprise Human Resource Management System (HRMS)

This repository contains the production-ready code structure for a modular and scalable Human Resource Management System (HRMS) built using React.js (Vite) and Node.js (Express) with PostgreSQL.

## Tech Stack Overview

- **Frontend**: React.js (scaffolded via Vite) styled with pure, isolated CSS modules. No external UI styling libraries (Tailwind, Bootstrap) are allowed to ensure visual performance and full design control.
- **Backend**: Node.js + Express.js API server.
- **Database**: PostgreSQL (managed using raw parametrized SQL queries).
- **Security**: JWT Authentication, Role-based Authorization, Express-Validator sanitization, Helmet and CORS configuration.

---

## Directory Structure

```text
odoo project/
├── client/          # React.js SPA Frontend
└── server/          # Express.js HTTP API Backend
```
*For a complete, granular tree view of the files, refer to the [Implementation Plan](file:///C:/Users/Ro%20Code/.gemini/antigravity-ide/brain/53f68d96-6675-4052-91a4-3cd619dcaf16/implementation_plan.md).*

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Docker & Docker Compose (for PostgreSQL/pgAdmin local execution)

### 1. Database Setup
Spin up the pre-configured PostgreSQL server container:
```bash
docker-compose up -d
```
The database will be initialized at `localhost:5432` with username `hrms_user` and database `hrms_db`.
Access pgAdmin at `http://localhost:5050` with email `admin@hrms.com` / password `adminpassword`.

### 2. Backend Installation & Start
```bash
cd server
npm install
npm run dev
```

### 3. Frontend Installation & Start
```bash
cd client
npm install
npm run dev
```

---

## Development Workflow & Team Alignment

To maintain a zero-conflict workspace for the 4-member dev team, we adhere to the following principles:

### Feature Ownership Division
- **Developer A**: Authentication endpoints (JWT, login, register, forgot-pwd), React Router configuration, protected routes, and client-side context hooks.
- **Developer B**: Employee dashboard interface, Profile settings page, Attendance check-in module, Leave logs, and Payroll history dashboard.
- **Developer C**: Admin dashboard interface, Employee CRUD panels, Approve/Reject leaves board, Attendance audit tools, and Payroll adjustment controls.
- **Developer D**: Database schema schema migrations, seeds setup, Express middlewares configuration, error mapping helpers, validation checks, and base service structures.

### Git Branching & Merges
- Branch names must follow: `feature/dev-[name]-[module]` (e.g. `feature/dev-b-attendance-checkin`).
- Submit PRs targeting the `develop` branch.
- Standard commits must use conventional commit formats:
  - `feat: add leave request API endpoint`
  - `fix: correct token expiry date check`
  - `style: apply styling changes to sidebar component`
  - `refactor: clean up error response mapper`
