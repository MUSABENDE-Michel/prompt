# Sales Record Management System (SRMS)

**SalesPro Ltd** - Huye District, Southern Province, Rwanda

A full-stack web application for managing sales records, customers, and products with automated report generation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (Slate + Indigo + Emerald palette) |
| Routing | react-router-dom |
| Icons | lucide-react |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| API | Axios (withCredentials) |
| Auth | Session-based with bcrypt |
| Exports | SheetJS (xlsx) + jsPDF |

## Project Structure

```
Musabende_Michel_National_practical_Exam_2026/
├── backend-project/          # Express.js REST API
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Auth, CRUD, Report controllers
│   ├── middleware/           # auth, errorHandler, validate
│   ├── models/              # User, Customer, Product, Sale
│   ├── routes/              # RESTful route definitions
│   ├── utils/                # PDF generation utility
│   ├── seed.js              # Database seeder
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   └── server.js            # Entry point
└── frontend-project/         # React 18 + Vite SPA
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── contexts/         # AuthContext, ToastContext
    │   ├── hooks/            # useDebounce, useAutoGenerate
    │   ├── pages/            # All route pages
    │   ├── services/         # Axios API service modules
    │   ├── App.jsx           # Router + providers
    │   └── main.jsx          # Entry point
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- npm

### Backend Setup

```bash
cd Musabende_Michel_National_practical_Exam_2026/backend-project

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and a strong SESSION_SECRET

# Seed the database (creates sample data + admin user)
npm run seed

# Start the server
npm start
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd Musabende_Michel_National_practical_Exam_2026/frontend-project

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

### Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | Admin@123 | admin |

All created users are assigned `role: "admin"` by default.

## Running Tests

```bash
# Start both backend and frontend, then run:
node test-sanity.js
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Check session
- `GET /api/auth/me` - Get current user
- `GET /api/auth/security-question/:username` - Get security question
- `POST /api/auth/recover-password` - Recover password
- `GET /api/auth/generate-code/:type` - Generate auto code

### CRUD (all require auth)
- `GET/POST /api/customers` - List/Create customers
- `GET/PUT/DELETE /api/customers/:id` - Get/Update/Delete customer
- `GET/POST /api/products` - List/Create products
- `GET/PUT/DELETE /api/products/:id` - Get/Update/Delete product
- `GET/POST /api/sales` - List/Create sales
- `GET/PUT/DELETE /api/sales/:id` - Get/Update/Delete sale

### Reports (require auth)
- `GET /api/reports/dashboard` - Dashboard stats
- `GET /api/reports/data?type=sales&startDate=&endDate=` - Report data
- `GET /api/reports/export?type=sales&format=csv` - Export data

## ERD

### Entities

**Customer** (customerNumber PK, firstName, lastName, telephone, address)
  - 1 ---< Sale (one customer can have many sales)

**Product** (productCode PK, productName, quantitySold, unitPrice)
  - 1 ---< SaleProducts (one product can appear in many sales)

**Sale** (invoiceNumber PK, salesDate, paymentMethod, totalAmountPaid)
  - >--- 1 Customer (FK: customer)
  - >--- * Product (via embedded products array)

## Key Design Decisions

1. **Default Admin Role**: User schema sets `role: { type: String, default: 'admin' }`. Every created user gets admin privileges.
2. **Session Auth**: Uses express-session with httpOnly cookies. Auth checked once on app load via `useRef` guard to prevent infinite loops.
3. **Auto-Generation**: Server generates customer numbers (CUST00001), product codes (PROD00001), and invoice numbers (INV-2026-00001).
4. **Color Palette**: Strictly 3 colors - Slate (layout), Indigo/primary (actions), Emerald (success metrics).
5. **Infinite Re-render Prevention**: AuthProvider checks session once using `checkedRef`. Axios 401 interceptor guards against redirect loops.
