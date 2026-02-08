# 🚀 Quick Setup Guide - Authentik QR Order System

## Prerequisites
- Node.js (v14+)
- MongoDB running locally or remote
- Gmail account for email notifications

## Step 1: Email Configuration

### Setup Gmail App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to Security → 2-Step Verification (Enable if not already)
3. Scroll down to "App passwords"
4. Select app: Mail
5. Select device: Other (Custom name)
6. Copy the generated 16-character password

## Step 2: Backend Setup

```bash
cd backend

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/authentik
JWT_SECRET=authentik_super_secret_key_2026
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
FRONTEND_URL=http://localhost:5173
PORT=5000
EOF

# Install dependencies (already done, but run if needed)
npm install

# Start backend server
npm run dev
```

Backend should be running on http://localhost:5000

## Step 3: Frontend Setup

```bash
cd ../frontend

# Create or update .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000
EOF

# Start frontend (in development mode)
npm run dev
```

Frontend should be running on http://localhost:5173

## Step 4: Test the System

### Create Test Users (if needed)

Use your existing admin panel or create users with these roles:
- **superadmin**: Full system access
- **creator**: Can create QR orders
- **authorizer**: Can authorize orders and mark as received
- **company**: Company admin with full company access

### Test Workflow

1. **Login as Creator**
   - Go to Order Management
   - Click "Create New Order"
   - Fill in all details (Brand X, 3000 units, etc.)
   - Submit

2. **Check Email**
   - All stakeholders should receive email notification

3. **Login as Authorizer**
   - Go to Order Management (or "Created QRs" tab)
   - Find pending order
   - Click "✓ Authorize"
   - Check email notification

4. **Login as Super Admin**
   - See authorized order
   - Click "⚙️ Process & Generate QRs"
   - System generates 3000 QR codes (may take a moment)
   - Click "📦 Prepare Dispatch"
   - Click "🚚 Dispatch"
   - Enter courier details and submit
   - Check email notification

5. **Login as Authorizer Again**
   - See dispatched order
   - Click "✓ Mark Received"
   - Confirm the dialog
   - **QR CODES ARE NOW ACTIVE!** ✅
   - Check final email notification

6. **Verify QR Activation**
   - Check QR Management page
   - All QRs for that order should show as ACTIVE

## Step 5: Download QR Codes

Once QRs are generated (Step 3), any authorized user can:
- Click the "📄 PDF" button
- Download PDF with all QR codes

## 📧 Email Notification Example

You should receive emails at each status change with:
- ⏳ New QR order created
- ✅ Order authorized
- ⚙️ QR codes generated
- 📦 Preparing dispatch
- 🚚 Order dispatched (with tracking)
- 🎉 Order received - QRs ACTIVE

## Troubleshooting

### Emails Not Sending?
```bash
# Check backend logs
cd backend
npm run dev

# Look for email-related errors
# Verify EMAIL_USER and EMAIL_PASSWORD in .env
```

### QR Codes Not Generating?
```bash
# Check MongoDB connection
# Check backend console for errors during "Process" step
```

### Can't See Orders?
- Verify user role permissions
- Check company assignment for creators/authorizers
- Super admin sees ALL orders

## Important Notes

⚠️ **QR codes remain INACTIVE until authorizer marks order as "Received"**
⚠️ **Each status transition is ONE-TIME only**
⚠️ **Emails are sent to ALL relevant stakeholders automatically**
⚠️ **Order workflow is linear - cannot skip steps**

## Quick Database Check

```bash
# Connect to MongoDB
mongosh

use authentik

# Check orders
db.orders.find().pretty()

# Check QR codes
db.products.find({ orderId: ObjectId("YOUR_ORDER_ID") })

# Check active QR codes
db.products.find({ isActive: true }).count()
```

## Production Deployment

### Environment Variables to Update:
```env
# Production MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/authentik

# Production Frontend URL
FRONTEND_URL=https://your-domain.com

# Secure JWT Secret
JWT_SECRET=use_a_strong_random_secret_here

# Email (same Gmail or use SMTP service)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=production-email@gmail.com
EMAIL_PASSWORD=production-app-password
```

## API Testing with cURL

```bash
# Get orders (requires auth token)
curl -X GET http://localhost:5000/orders \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create order
curl -X POST http://localhost:5000/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Test Product",
    "brand": "Brand X",
    "quantity": 100,
    "batchNo": "BATCH001",
    "manufactureDate": "2026-02-01",
    "expiryDate": "2027-02-01"
  }'
```

## Success Indicators

✅ Backend running without errors
✅ Frontend accessible at localhost:5173
✅ Can create orders
✅ Emails being received
✅ Status transitions working
✅ QR codes generating
✅ QR codes activating on "Received" status
✅ PDF downloads working

---

**Ready to go!** 🎉

For detailed workflow information, see `QR_WORKFLOW_DOCUMENTATION.md`
