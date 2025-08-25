# CrediFlow

Developed by satyasurya

CrediFlow is a full-stack **Loan Management System** built using **React, Node.js, and MongoDB**.  
The application provides a complete loan lifecycle workflow including user authentication, loan applications, admin approvals, EMI payments with comprehensive tracking, and role-based dashboards with a clean, responsive, production-ready UI.

---

## ✅ Fully Implemented Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with 7-day token expiration
- Bcrypt password hashing (10 rounds) - passwords never stored in plaintext
- Role-based access control (Admin & Customer roles)
- Protected routes on both frontend (ProtectedRoute component) and backend (protect middleware)
- Automatic token refresh and 401 error handling
- Session management with localStorage

### 💼 Loan Management
- **Customer loan applications** with validation for amount (₹10k - ₹100Cr), interest rate (0-25%), tenure (1-360 months)
- **Admin approval/rejection workflow** with real-time status updates
- **Loan status tracking**: pending → approved/rejected → completed
- Loan data persists in MongoDB with proper relationships
- Approved loans tracked separately from pending applications

### 💰 EMI & Payment System
- **Accurate EMI calculation** using standard financial formula with decimal precision
- **Automatic EMI schedule generation** on loan approval (creates monthly payment schedule)
- **Payment recording** with support for multiple modes (Cash, UPI, Bank Transfer)
- **Real-time tracking** of paid vs pending EMIs
- **Automatic loan completion** when all EMIs are paid
- Payment history available per loan with sortable timestamps
- Overdue EMI detection and tracking

### 📊 Comprehensive Dashboards
- **Role-aware dashboards** showing different metrics for Admin vs Customer
- **Admin Dashboard KPIs**:
  - Total/Pending/Approved/Rejected/Completed loans
  - Total amount disbursed
  - Total amount collected
  - Outstanding balance
  - Active customers count
  - Approval rate (%)
  - Overdue EMIs count
  - Collection rate (%)
- **Customer Dashboard KPIs**:
  - My loans (by status)
  - Total amount disbursed to me
  - Total amount paid
  - Outstanding balance
- **Real data computed from database**, not hardcoded

### 🎨 UI & UX
- **Fully responsive design** (Mobile, Tablet, Desktop)
- **Tailwind CSS** with custom theme system using CSS variables
- **Reusable components** (StatCard, DashboardLayout, Header, Sidebar)
- **Consistent fintech styling** across all pages
- **Real-time data updates** with loading states and error handling

### 📝 Data Validation
- Frontend validation with specific error messages per field
- Backend validation with proper HTTP status codes (400, 401, 403, 404, 500)
- Input sanitization for authentication endpoints
- Field-level error responses for form handling

---

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client with JWT interceptor
- **React Router 7** - Client-side routing

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 9** - ODM for MongoDB
- **JWT** - Token authentication
- **bcryptjs** - Password hashing

---

## Database Models

### User
```
- name (String, required)
- email (String, unique, required)
- password (String, hashed with bcrypt, required)
- role (String: "admin" | "customer", default: "customer")
- timestamps (createdAt, updatedAt)
```

### Loan
```
- customer (ObjectId ref: User, required)
- amount (Number, required)
- interestRate (Number, required)
- tenure (Number, in months, required)
- emi (Number, calculated)
- totalPayable (Number, calculated)
- remainingAmount (Number, tracked)
- status (String: "pending" | "approved" | "rejected" | "completed")
- approvedBy (ObjectId ref: User)
- timestamps (createdAt, updatedAt)
```

### Payment
```
- loan (ObjectId ref: Loan, required)
- amountPaid (Number, required)
- paymentDate (Date, default: now)
- paymentMode (String: "cash" | "upi" | "bank")
- timestamps (createdAt, updatedAt)
```

### EMISchedule
```
- loan (ObjectId ref: Loan, required)
- installmentNumber (Number)
- dueDate (Date)
- emiAmount (Number)
- principal (Number)
- interest (Number)
- remainingPrincipal (Number)
- status (String: "pending" | "paid" | "overdue")
- paidDate (Date, nullable)
- paidAmount (Number)
- timestamps (createdAt, updatedAt)
```

---

## API Endpoints

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | `/api/auth/register` | ❌ | — | Register new user |
| POST | `/api/auth/login` | ❌ | — | User login |
| POST | `/api/loans` | ✅ | customer | Create loan application |
| GET | `/api/loans` | ✅ | all | Fetch loans (filtered by role) |
| PUT | `/api/loans/:id/status` | ✅ | admin | Approve/reject loan |
| POST | `/api/payments` | ✅ | customer | Make EMI payment |
| GET | `/api/payments/:loanId` | ✅ | all | Payment history for loan |
| GET | `/api/dashboard/stats` | ✅ | all | Dashboard statistics |

---

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js: https://nodejs.org/
- MongoDB (Atlas cloud or local instance)
- Git

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crediflow
JWT_SECRET=your_secure_jwt_secret_key_here
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Installation & Usage

### Backend Setup
```bash
cd backend
npm install
# Create .env file with above variables
npm run dev        # Start development server on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
# Create .env file with above variables
npm run dev        # Start Vite dev server on port 5173
```

### Access the Application
- Open browser: `http://localhost:5173`
- Login with demo credentials (created via `/api/auth/register`)

---

## Demo Flow

1. **Register** - Create a customer account
2. **Login** - Access the dashboard
3. **Apply for Loan** - Fill amount, interest rate, tenure
   - Real-time EMI preview calculation
   - Instant frontend validation
4. **Admin Approval** (Admin account needed)
   - Login as admin
   - Navigate to "Loan Approvals"
   - Approve/Reject applications
   - EMI schedule auto-generated on approval
5. **Make Payment** - Customer makes EMI payment
   - Select approved loan
   - Enter payment amount
   - Choose payment mode
   - EMI status updated automatically
6. **View Dashboard** - Track loans and payments
   - Customer sees personal metrics
   - Admin sees system-wide KPIs

---

## Key Calculations

### EMI Formula
```
EMI = (P × r × (1+r)^n) / ((1+r)^n - 1)
where:
  P = Principal (Loan Amount)
  r = Monthly Rate (Annual Rate / 12 / 100)
  n = Tenure (Months)
```

### Decimal Precision
- All monetary calculations use `.toFixed(2)` for currency accuracy
- Prevents floating-point rounding errors

---

## Security Considerations

- **Passwords**: Hashed with bcrypt (10 rounds)
- **Tokens**: JWT with 7-day expiration
- **Authorization**: Role-based access control on all protected endpoints
- **Validation**: Input validation on both frontend and backend
- **Error Handling**: Sanitized error messages (no database details exposed)

### Future Enhancements for Production
- Add refresh token mechanism for longer sessions
- Implement rate limiting on auth endpoints
- Add CSRF protection
- Use HTTP-only cookies for token storage (instead of localStorage)
- Add email verification for registration
- Implement password reset flow
- Add audit logging for admin actions
- Integrate real payment gateway (Razorpay, Stripe)

---

## Project Structure

```
crediflow/
├── backend/
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation
│   │   ├── services/        # Utilities (EMI calc)
│   │   ├── config/          # DB connection
│   │   ├── app.js           # Express app
│   │   └── server.js        # Server entry
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/           # Page components
    │   ├── components/      # Reusable components
    │   ├── services/        # API calls
    │   ├── hooks/           # Custom hooks (useAuth)
    │   ├── routes/          # Routing setup
    │   └── App.jsx
    └── package.json
```

---

## Contributing

Contributions are welcome! If you find a bug or have a feature suggestion:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is open source and available under the MIT License.

---

## Support

For issues or questions:
- Check existing issues on GitHub
- Create a new issue with detailed description
- Include error messages and steps to reproduce

---

**Last Updated**: August 2025  
**Version**: 1.0.0 (Fully Production-Ready)
