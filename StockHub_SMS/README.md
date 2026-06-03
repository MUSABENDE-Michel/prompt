# StockHub SMS - Stock Management System

**Exam:** National Practical Exam 2026
**Developer:** Musabende Michel
**Location:** Kigali City, Rwanda

## Project Overview

StockHub Ltd is a wholesale and retail product distribution company in Kigali City, Rwanda. This web-based Stock Management System (SMS) replaces the manual paper-based system with a digital solution for managing stock movement and inventory records.

### Features

- **Product Management** - CRUD operations with auto-generated product codes
- **Warehouse Management** - Track multiple warehouses and locations
- **Stock Transactions** - Record Stock In/Stock Out with automatic inventory updates
- **Dashboard** - Overview with stats, quick actions, and recent activity
- **Reports** - Daily, weekly, monthly reports with CSV/Excel/PDF export
- **Authentication** - Session-based auth with password recovery via security questions
- **Auto Generation** - Auto-generated IDs (product codes, warehouse codes, report IDs)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | react-router-dom |
| Icons | lucide-react |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| API | Axios |
| Auth | Session-based with bcrypt |
| Exports | SheetJS (xlsx) and jsPDF |
| Charts | Recharts (optional) |

## ERD (Entity Relationship Diagram)

### Entities and Attributes

**Product** (productCode PK, productName, category, quantityInStock, unitPrice, supplierName, dateReceived)
**Warehouse** (warehouseCode PK, warehouseName, warehouseLocation)
**StockTransaction** (_id PK, transactionDate, quantityMoved, transactionType, product FK, warehouse FK)

### Relationships

- **Product** 1---M **StockTransaction**: A product can have many stock transactions
- **Warehouse** 1---M **StockTransaction**: A warehouse can have many stock transactions

### Cardinalities
```
Product (1) ──────< (M) StockTransaction
Warehouse (1) ────< (M) StockTransaction
```

## Folder Structure

```
Musabende_Michel_National_practical_Exam_2026/
├── backend-project/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── warehouseController.js
│   │   ├── transactionController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Warehouse.js
│   │   └── StockTransaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── warehouseRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── reportRoutes.js
│   ├── utils/
│   │   └── exportUtils.js
│   ├── seed.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend-project/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Layout.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Toast.jsx
    │   │   ├── ConfirmDialog.jsx
    │   │   ├── AutoGenerateField.jsx
    │   │   └── DataTable.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   ├── useAutoGenerate.js
    │   │   └── useDebounce.js
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Recovery.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ProductList.jsx
    │   │   ├── WarehouseList.jsx
    │   │   ├── TransactionList.jsx
    │   │   └── Reports.jsx
    │   ├── services/
    │   │   ├── apiClient.js
    │   │   ├── authService.js
    │   │   ├── productService.js
    │   │   ├── warehouseService.js
    │   │   ├── transactionService.js
    │   │   └── reportService.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── App.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend-project

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed (defaults work for local MongoDB)
# MONGODB_URI=mongodb://localhost:27017/SMS

# Seed the database with sample data
npm run seed

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### Frontend Setup

```bash
cd frontend-project

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173
The backend API runs at http://localhost:5000

### Default Accounts (after seeding)

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | admin |
| michel | Michel@123 | admin |

## Test Script / Sanity Check

### Manual Test Sequence

1. Start backend: `cd backend-project && npm start`
2. Start frontend: `cd frontend-project && npm run dev`
3. Open http://localhost:5173
4. Click "Get Started" or navigate to Login
5. Login with: admin / Admin@123
6. Verify Dashboard shows stats
7. Navigate to Products → Add a new product
8. Navigate to Warehouses → Add a new warehouse
9. Navigate to Transactions → Create Stock In and Stock Out transactions
10. Navigate to Reports → Select report type → Generate → Export CSV/Excel/PDF
11. Click Logout from header or sidebar

### Automated Test (PowerShell)

```powershell
# From the project root, run:
cd backend-project
npm start  # in terminal 1

cd frontend-project
npm run dev  # in terminal 2

# Then use curl/Invoke-WebRequest to test:
Invoke-WebRequest -Uri "http://localhost:5000/api/health" | Select-Object -ExpandProperty Content
```

## Key Implementation Details

### Authentication Flow
- Session-based auth using express-session and MongoDB session store
- Passwords hashed with bcryptjs (12 rounds)
- Security questions stored hashed for password recovery
- AuthProvider checks session once on app load using useRef guard to prevent infinite loops
- Axios interceptor handles 401 responses with single redirect

### Default Admin Role
- User model has `role: { type: String, default: 'admin', enum: ['admin'] }`
- Every created user automatically gets `role: 'admin'`

### Auto Generation
- Product codes auto-generated with format: PRD-{timestamp}-{random}
- Warehouse codes auto-generated with format: WH-{timestamp}-{random}
- Report IDs auto-generated with format: RPT-{timestamp}-{random}

### Inventory Management
- Stock In transactions increase product quantity
- Stock Out transactions decrease product quantity
- System prevents Stock Out if insufficient stock
- Deleting a transaction reverses the quantity adjustment

### Export Features
- CSV: Using SheetJS (xlsx library)
- Excel (.xlsx): Using SheetJS
- PDF: Using jsPDF with autoTable plugin (includes company header, Report ID, Generated By)
- Print: Browser print dialog

## API Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login
- POST /api/auth/logout - Logout
- GET /api/auth/session - Check session
- GET /api/auth/security-question/:username - Get security question
- POST /api/auth/recover-password - Reset password

### Products (authenticated)
- GET /api/products - List (paginated, searchable)
- GET /api/products/:id - Get by ID
- POST /api/products - Create
- PUT /api/products/:id - Update
- DELETE /api/products/:id - Delete

### Warehouses (authenticated)
- GET /api/warehouses - List (paginated, searchable)
- GET /api/warehouses/:id - Get by ID
- POST /api/warehouses - Create
- PUT /api/warehouses/:id - Update
- DELETE /api/warehouses/:id - Delete

### Transactions (authenticated)
- GET /api/transactions - List (paginated, searchable)
- GET /api/transactions/:id - Get by ID
- POST /api/transactions - Create
- PUT /api/transactions/:id - Update
- DELETE /api/transactions/:id - Delete

### Reports (authenticated)
- GET /api/reports/dashboard - Dashboard stats
- GET /api/reports/stock - Stock report
- GET /api/reports/stock-in - Stock in report (with date filter)
- GET /api/reports/stock-out - Stock out report (with date filter)
- GET /api/reports/daily - Daily report
- GET /api/reports/weekly - Weekly report
- GET /api/reports/monthly - Monthly report
- GET /api/reports/export/pdf - Export stock report as PDF

## Security

- All passwords hashed with bcryptjs
- Security answers stored hashed
- Session-based authentication with HTTP-only cookies
- CORS configured for frontend origin only
- Input validation on both frontend and backend
- MongoDB session store for persistent sessions
- Unique constraints at database level

## License

Exam Project - Musabende Michel, 2026
