# Authentik QR Order Management System

## Complete Workflow Documentation

### System Overview
The Authentik QR Order Management System follows a comprehensive workflow where QR codes remain **INACTIVE** until the final authorization step is completed. This ensures maximum security and control over QR code activation.

---

## 📋 Complete Workflow

### Step 1: Creator Creates QR Order
**Role:** Creator
**Action:** Creates a new QR order request

- Creator fills in order details:
  - Product Name
  - Brand (e.g., Brand X)
  - Quantity (e.g., 3000 units)
  - Batch Number
  - Manufacturing Date
  - Expiry Date
  - Description

**Status:** `Pending Authorization` 🟡
**Email Notifications:** Sent to Creator, Authorizers, Super Admin, Company

---

### Step 2: Authorizer Approves
**Role:** Authorizer (at the brand/factory)
**Action:** Reviews and authorizes the order

- Authorizer sees the created order in "Created QRs" tab
- Reviews order details
- Clicks "Authorize" button

**Status:** `Authorized` 🟣
**Email Notifications:** Sent to all stakeholders
**Note:** QR codes are NOT yet generated

---

### Step 3: Super Admin Processes Order
**Role:** Super Admin
**Action:** Accepts order and generates QR codes

- Super Admin reviews authorized orders
- Clicks "Process & Generate QRs"
- System automatically generates the specified quantity of QR codes
- QR codes are stored in database with `isActive: false`

**Status:** `Order Processing` 🔵
**Email Notifications:** Sent confirming QR generation
**Important:** QR codes are generated but INACTIVE

---

### Step 4: Super Admin Prepares Dispatch
**Role:** Super Admin
**Action:** Marks order ready for dispatch

- Super Admin prepares QR codes for shipping
- Clicks "Prepare Dispatch"

**Status:** `Dispatching` 🟠
**Email Notifications:** Sent to notify dispatch preparation

---

### Step 5: Super Admin Dispatches Order
**Role:** Super Admin
**Action:** Dispatches QR codes to factory

- Super Admin enters dispatch details:
  - Courier Name (e.g., DHL, FedEx)
  - Tracking Number
  - Notes
- Clicks "Dispatch Order"

**Status:** `Dispatched` 🟡
**Email Notifications:** Sent with tracking information
**Note:** QR codes are still INACTIVE

---

### Step 6: Authorizer Marks as Received (FINAL STEP)
**Role:** Authorizer (at factory)
**Action:** Confirms receipt and ACTIVATES all QR codes

- Authorizer receives physical QR codes at factory
- Verifies the order
- Clicks "Mark Received"
- System automatically sets `isActive: true` for ALL QR codes in the order

**Status:** `Received` 🟢
**Email Notifications:** Sent confirming activation
**✅ QR CODES ARE NOW ACTIVE AND FUNCTIONAL**

---

## 🔄 Status Lifecycle

```
Pending Authorization (Creator creates)
         ↓
    Authorized (Authorizer approves)
         ↓
  Order Processing (Super Admin generates QRs - INACTIVE)
         ↓
    Dispatching (Super Admin prepares)
         ↓
    Dispatched (Super Admin ships with tracking)
         ↓
    Received (Authorizer confirms - QR CODES BECOME ACTIVE ✅)
```

---

## 👥 Role-Based Access

### Creator
- ✅ Create new QR orders
- ✅ View orders for their company
- ✅ See status updates via email
- ❌ Cannot authorize or activate

### Authorizer
- ✅ View created orders
- ✅ **Authorize** pending orders (Step 2)
- ✅ **Mark as Received** dispatched orders (Step 6 - ACTIVATES QRs)
- ✅ Download QR code PDFs
- ❌ Cannot process or dispatch

### Super Admin
- ✅ View ALL orders across all companies
- ✅ **Process** authorized orders (Step 3 - Generate QRs)
- ✅ **Prepare Dispatch** (Step 4)
- ✅ **Dispatch** orders (Step 5)
- ✅ Download QR code PDFs
- ✅ Access all system features

### Company
- ✅ Create orders
- ✅ Authorize orders
- ✅ Mark orders as received
- ✅ View company-specific orders

---

## 📊 Database Models

### Order Model
```javascript
{
  orderId: String (unique, e.g., "ORD-1707840123456-1"),
  productName: String,
  brand: String,
  batchNo: String,
  manufactureDate: String,
  expiryDate: String,
  quantity: Number,
  description: String,
  createdBy: ObjectId (ref: User),
  company: ObjectId (ref: User),
  status: Enum [
    'Pending Authorization',
    'Authorized',
    'Order Processing',
    'Dispatching',
    'Dispatched',
    'Received',
    'Rejected'
  ],
  qrCodesGenerated: Boolean,
  qrGeneratedCount: Number,
  dispatchDetails: {
    trackingNumber: String,
    courierName: String,
    dispatchedDate: Date,
    notes: String
  },
  history: [{
    status: String,
    changedBy: ObjectId,
    role: String,
    timestamp: Date,
    comment: String
  }]
}
```

### Product (QR Code) Model
```javascript
{
  qrCode: String (unique),
  productName: String,
  brand: String,
  batchNo: String,
  manufactureDate: String,
  expiryDate: String,
  quantity: Number,
  sequence: Number,
  orderId: ObjectId (ref: Order),
  isActive: Boolean, // FALSE until authorizer marks as received
  createdBy: ObjectId (ref: User)
}
```

---

## 📧 Email Notifications

### Email Triggers
Emails are sent to ALL relevant stakeholders at each status change:
- Creator
- All Authorizers for the company
- Company admin
- All Super Admins

### Email Content Includes:
- Order ID
- Product details
- Current status with visual badge
- Status-specific action messages
- Link to dashboard
- Beautiful HTML formatting

### Email Configuration (.env)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=http://localhost:5173
```

---

## 🎨 UI Features

### Order Management Page
- **Stats Dashboard**: Total orders, pending, in progress, completed
- **Status Filters**: Filter orders by current status
- **Color-Coded Status Badges**:
  - 🟡 Pending Authorization (Yellow)
  - 🟣 Authorized (Purple)
  - 🔵 Order Processing (Blue)
  - 🟠 Dispatching (Orange)
  - 🟡 Dispatched (Amber)
  - 🟢 Received (Green)
  - 🔴 Rejected (Red)

### Action Buttons
- Context-aware buttons based on role and status
- Visual feedback with hover effects
- Confirmation dialogs for critical actions
- Animated "Mark Received" button (activates QRs)

### QR Management Page
Lists all orders with:
- Brand name
- Manufacturing date
- Expiry date
- Batch number
- Quantity
- Current status
- Active/Inactive indicator

---

## 🔐 Security Features

1. **Inactive by Default**: All QR codes start as inactive
2. **Role-Based Access Control**: Each role has specific permissions
3. **Audit Trail**: Complete history of all status changes
4. **Email Notifications**: All stakeholders informed at every step
5. **One-Time Status Changes**: Each status transition happens only once
6. **Final Authorization**: Only authorizer can activate QRs by marking received

---

## 🚀 API Endpoints

### Order Endpoints
```
POST   /api/orders                      - Create new order
GET    /api/orders                      - Get all orders (role-filtered)
GET    /api/orders/:id                  - Get single order details
PUT    /api/orders/:id/authorize        - Authorize order (Step 2)
PUT    /api/orders/:id/process          - Process & generate QRs (Step 3)
PUT    /api/orders/:id/dispatching      - Mark as dispatching (Step 4)
PUT    /api/orders/:id/dispatch         - Dispatch order (Step 5)
PUT    /api/orders/:id/received         - Mark received & activate QRs (Step 6)
PUT    /api/orders/:id/reject           - Reject order
GET    /api/orders/:id/download         - Download QR codes PDF
GET    /api/orders/stats/summary        - Get order statistics
```

---

## 📥 Installation & Setup

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/authentik
JWT_SECRET=your_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Run server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📱 For Gmail Email Setup

1. Enable 2-Factor Authentication in your Google Account
2. Generate App-Specific Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in `.env` as `EMAIL_PASSWORD`

---

## 🎯 Key Features Summary

✅ Complete order lifecycle management
✅ QR codes inactive until final authorization
✅ Multi-role access control
✅ Real-time email notifications
✅ Comprehensive audit trail
✅ PDF generation for QR codes
✅ Beautiful, responsive UI
✅ Status-based action buttons
✅ Company-specific data isolation
✅ Bulk order statistics

---

## 🐛 Troubleshooting

### QR Codes Not Activating
- Ensure authorizer has marked the order as "Received"
- Check database: `db.products.find({ orderId: ORDER_ID, isActive: true })`

### Emails Not Sending
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Check Gmail app password setup
- Review console logs for email errors

### Wrong Status Transitions
- Each status can only be changed once
- Follow the exact workflow order
- Check user role permissions

---

## 📞 Support

For issues or questions:
- Check console logs (backend and frontend)
- Review email notifications
- Check order history in database
- Verify user roles and permissions

---

**Version:** 1.0.0
**Last Updated:** February 2026
**System:** Authentik QR Authentication Platform
