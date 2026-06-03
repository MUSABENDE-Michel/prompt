# DAB Enterprise Ltd - Business Web Solution (BWS)

A full-stack business management system built with React, Node.js, Express, MongoDB, and Tailwind CSS.

## Architecture

```
Musabende_Michel_National_practical_Exam_2026/
├── backend-project/          # Node.js + Express + MongoDB API
│   ├── config/db.js          # Database connection
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth, validation, error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # RESTful API routes
│   ├── utils/                # Export utilities (PDF, CSV)
│   ├── seed.js               # Sample data seeder
│   ├── server.js             # Entry point
│   └── .env.example          # Environment variables
└── frontend-project/         # React 18 + Vite + Tailwind CSS
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── contexts/         # Auth context (session-based)
    │   ├── hooks/            # Custom hooks
    │   ├── pages/            # Page components
    │   └── services/         # Axios API clients
    ├── index.html
    ├── tailwind.config.js
    └── vite.config.js
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

## Setup & Run

### Backend

```bash
cd backend-project
npm install
cp .env.example .env   # Edit .env with your MongoDB URI
npm run seed           # Creates admin user and sample data
npm start              # Runs on http://localhost:5000
```

### Frontend

```bash
cd frontend-project
npm install
npm run dev            # Runs on http://localhost:5173
```

## Default Credentials (after seeding)

| Username | Password   | Role  |
|----------|-----------|-------|
| admin    | Admin@123 | admin |

## ERD

```
 ┌───────────────┐       ┌───────────────┐
 │    Product     │       │     Sale      │
 ├───────────────┤       ├───────────────┤
 │ PK ProductID  │       │ PK SaleID     │
 │ ProductName   │◄──────│ FK ProductID  │
 │ Category      │  1  * │ SoldQuantity  │
 │ Quantity      │       │ SoldUnitPrice │
 │ UnitPrice     │       │ SoldTotalPrice│
 │ TotalPrice    │       │ SalesDate     │
 └───────────────┘       └───────────────┘
        │ 1
        │
        │
        │ 1
 ┌───────────────┐
 │  StockStatus  │
 ├───────────────┤
 │ PK StockID    │
 │ FK ProductID  │
 │ Avail Qty     │
 │ Sold Qty      │
 │ Remaining Qty │
 └───────────────┘

Relationships:
- Product (1) ---< (M) Sale  (One product can have many sales)
- Product (1) --- (1) StockStatus (One product has one stock record)
```

## Key Features

- **Session-based authentication** with bcrypt password encryption
- **Default admin role** assigned to all created users
- **CRUD operations** for Products, Sales, and Stock Status
- **Auto-generated IDs** for products and sales
- **Search** with debounced input
- **Responsive design** with collapsible sidebar
- **Reports** with date range filtering, summary cards
- **Export**: CSV, Excel (XLSX), PDF with company header and metadata
- **Print** support for reports
- **Toast notifications** for all operations
- **Confirm dialogs** for destructive actions

## API Endpoints

| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | /api/auth/register        | Register new user    |
| POST   | /api/auth/login           | Login                |
| POST   | /api/auth/logout          | Logout               |
| GET    | /api/auth/session         | Check session        |
| GET    | /api/products             | List products        |
| POST   | /api/products             | Create product       |
| PUT    | /api/products/:id         | Update product       |
| DELETE | /api/products/:id         | Delete product       |
| GET    | /api/sales                | List sales           |
| POST   | /api/sales                | Record sale          |
| PUT    | /api/sales/:id            | Update sale          |
| DELETE | /api/sales/:id            | Delete sale          |
| GET    | /api/stock-status         | List stock statuses  |
| GET    | /api/reports/daily-sales  | Daily sales report   |
| GET    | /api/reports/daily-stock  | Daily stock report   |
| GET    | /api/reports/export       | Export (CSV/PDF)     |

## Test Script

```bash
# 1. Start backend
cd backend-project && npm start

# 2. Start frontend (separate terminal)
cd frontend-project && npm run dev

# 3. Manual test sequence:
#    - Open http://localhost:5173
#    - Login with admin / Admin@123
#    - Create a product
#    - Record a sale
#    - View stock status
#    - Generate daily sales report
#    - Export as CSV, Excel, PDF
#    - Logout
```

## License

MIT
