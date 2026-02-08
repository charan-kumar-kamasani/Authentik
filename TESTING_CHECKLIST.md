# ✅ Implementation Checklist

## Pre-Deployment Checklist

### Environment Setup
- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running
- [ ] Gmail account available for notifications
- [ ] Gmail 2-Factor Authentication enabled
- [ ] Gmail App Password generated

### Backend Setup
- [ ] Navigate to backend directory
- [ ] Run `npm install` (nodemailer installed)
- [ ] Create `.env` file from `.env.example`
- [ ] Update `MONGODB_URI` in `.env`
- [ ] Update `JWT_SECRET` in `.env`
- [ ] Update `EMAIL_USER` in `.env`
- [ ] Update `EMAIL_PASSWORD` in `.env`
- [ ] Update `FRONTEND_URL` in `.env`
- [ ] Test backend startup: `npm run dev`
- [ ] Verify no errors in console
- [ ] Verify MongoDB connection successful

### Frontend Setup
- [ ] Navigate to frontend directory
- [ ] Run `npm install` (if needed)
- [ ] Create/update `.env` file
- [ ] Update `VITE_API_BASE_URL` in `.env`
- [ ] Test frontend startup: `npm run dev`
- [ ] Verify no errors in console
- [ ] Verify frontend loads in browser

---

## Testing Checklist

### User Setup Testing
- [ ] Super Admin user exists
- [ ] Creator user exists
- [ ] Authorizer user exists
- [ ] Company user exists (optional)
- [ ] All users have email addresses
- [ ] All creators/authorizers linked to correct company

### Step 1: Create Order (Creator)
- [ ] Login as Creator
- [ ] Navigate to Order Management
- [ ] Click "Create New Order" button
- [ ] Fill all required fields:
  - [ ] Product Name
  - [ ] Brand
  - [ ] Quantity
  - [ ] Optional: Batch Number, Dates, Description
- [ ] Submit form
- [ ] Order appears in list
- [ ] Status shows "Pending Authorization" (Yellow)
- [ ] Email received by all stakeholders
- [ ] Email contains correct order details

### Step 2: Authorize (Authorizer)
- [ ] Login as Authorizer
- [ ] See pending order in Order Management
- [ ] Order shows "Pending Authorization" status
- [ ] "✓ Authorize" button visible
- [ ] Click "Authorize" button
- [ ] Status changes to "Authorized" (Purple)
- [ ] Email sent to all stakeholders
- [ ] Email confirms authorization

### Step 3: Process Order (Super Admin)
- [ ] Login as Super Admin
- [ ] See authorized order
- [ ] "⚙️ Process & Generate QRs" button visible
- [ ] Click process button
- [ ] System generates QR codes (may take time)
- [ ] Success message shows QR count
- [ ] Status changes to "Order Processing" (Blue)
- [ ] Email sent confirming QR generation
- [ ] Check database: QRs exist with `isActive: false`
- [ ] "📄 PDF" button now visible

### Step 4: Prepare Dispatch (Super Admin)
- [ ] "📦 Prepare Dispatch" button visible
- [ ] Click prepare dispatch button
- [ ] Status changes to "Dispatching" (Orange)
- [ ] Email sent to stakeholders

### Step 5: Dispatch (Super Admin)
- [ ] "🚚 Dispatch" button visible
- [ ] Click dispatch button
- [ ] Dispatch modal appears
- [ ] Fill in courier details:
  - [ ] Courier Name
  - [ ] Tracking Number
  - [ ] Notes
- [ ] Submit dispatch
- [ ] Status changes to "Dispatched" (Amber)
- [ ] Email sent with tracking information
- [ ] Dispatch details saved correctly

### Step 6: Mark Received (Authorizer)
- [ ] Login as Authorizer
- [ ] See dispatched order
- [ ] "✓ Mark Received" button visible (animated)
- [ ] Click "Mark Received" button
- [ ] Confirmation dialog appears
- [ ] Confirm the dialog
- [ ] Status changes to "Received" (Green)
- [ ] Success message confirms QR activation
- [ ] Email sent confirming completion
- [ ] **CRITICAL:** Check database - ALL QRs have `isActive: true`

### PDF Download Testing
- [ ] Login as any authorized user
- [ ] Find order with generated QRs
- [ ] "📄 PDF" button visible
- [ ] Click PDF button
- [ ] PDF downloads successfully
- [ ] PDF contains all QR codes
- [ ] QR codes are scannable

### Email Testing
- [ ] Emails received at Step 1 (Create)
- [ ] Emails received at Step 2 (Authorize)
- [ ] Emails received at Step 3 (Process)
- [ ] Emails received at Step 4 (Dispatching)
- [ ] Emails received at Step 5 (Dispatch)
- [ ] Emails received at Step 6 (Received)
- [ ] Email formatting looks good
- [ ] Email links work correctly
- [ ] Status badges show correct colors

---

## Role Permission Testing

### Creator Permissions
- [ ] ✅ Can create orders
- [ ] ✅ Can view own company orders
- [ ] ❌ Cannot authorize orders
- [ ] ❌ Cannot process orders
- [ ] ❌ Cannot dispatch orders
- [ ] ❌ Cannot mark as received
- [ ] ❌ Cannot see other companies' orders

### Authorizer Permissions
- [ ] ❌ Cannot create orders (if pure authorizer)
- [ ] ✅ Can view own company orders
- [ ] ✅ Can authorize pending orders
- [ ] ❌ Cannot process orders
- [ ] ❌ Cannot dispatch orders
- [ ] ✅ Can mark dispatched orders as received
- [ ] ✅ Can download PDFs
- [ ] ❌ Cannot see other companies' orders

### Super Admin Permissions
- [ ] ✅ Can view ALL orders
- [ ] ✅ Can process authorized orders
- [ ] ✅ Can prepare dispatch
- [ ] ✅ Can dispatch orders
- [ ] ✅ Can download any PDF
- [ ] ✅ Can see all companies' orders
- [ ] ❌ Cannot authorize orders (company role)
- [ ] ❌ Cannot mark as received (company role)

---

## Database Verification

### Orders Collection
- [ ] Orders created with correct status
- [ ] `qrCodesGenerated` updates correctly
- [ ] `qrGeneratedCount` matches quantity
- [ ] `dispatchDetails` saved correctly
- [ ] `history` array updated at each step
- [ ] All references populated correctly

### Products Collection
- [ ] QR codes generated with correct format
- [ ] `orderId` reference set correctly
- [ ] `isActive` starts as `false`
- [ ] `isActive` changes to `true` after "Received"
- [ ] All QR codes for order activated simultaneously
- [ ] Sequence numbers correct and unique

### Email Logs
- [ ] Check backend console for email send confirmations
- [ ] No email errors in logs
- [ ] All recipients received emails

---

## Error Handling Testing

### Frontend Errors
- [ ] Invalid form submission shows error
- [ ] Network errors handled gracefully
- [ ] Unauthorized access redirects correctly
- [ ] Loading states show correctly
- [ ] Error messages are user-friendly

### Backend Errors
- [ ] Invalid order status transitions rejected
- [ ] Unauthorized role access blocked
- [ ] Missing required fields caught
- [ ] Email failures logged (don't crash)
- [ ] Database errors handled

---

## UI/UX Testing

### Visual Design
- [ ] Status badges show correct colors
- [ ] Status icons display correctly
- [ ] Buttons styled correctly
- [ ] Modals appear centered
- [ ] Forms are responsive
- [ ] Mobile view works

### User Experience
- [ ] Action buttons appear only for correct roles
- [ ] Confirmation dialogs for critical actions
- [ ] Success/error messages display
- [ ] Loading indicators during processing
- [ ] Tooltips/help text where needed

---

## Performance Testing

### QR Generation
- [ ] Small orders (10 QRs) process quickly
- [ ] Medium orders (100 QRs) complete successfully
- [ ] Large orders (1000+ QRs) complete (may take time)
- [ ] Very large orders (3000+ QRs) complete without timeout

### Database Queries
- [ ] Order list loads quickly
- [ ] Filters work efficiently
- [ ] PDF generation doesn't timeout
- [ ] Bulk updates (QR activation) complete successfully

---

## Security Testing

### Authentication
- [ ] Protected routes require login
- [ ] Invalid tokens rejected
- [ ] Expired sessions handled
- [ ] Logout works correctly

### Authorization
- [ ] Role-based access enforced
- [ ] Can't access other company data
- [ ] Super admin sees all data
- [ ] Company isolation working

### Data Validation
- [ ] Server-side validation present
- [ ] SQL injection prevented (using Mongoose)
- [ ] XSS prevention in place
- [ ] Email injection prevented

---

## Documentation Review

- [ ] Read `QR_WORKFLOW_DOCUMENTATION.md`
- [ ] Read `QUICK_SETUP.md`
- [ ] Read `IMPLEMENTATION_SUMMARY.md`
- [ ] Read `VISUAL_FLOW.md`
- [ ] Understand complete workflow
- [ ] Know where to find troubleshooting info

---

## Production Readiness

### Environment Variables
- [ ] Production MongoDB URI set
- [ ] Strong JWT secret set
- [ ] Production email credentials set
- [ ] Correct frontend URL set
- [ ] All sensitive data in .env

### Deployment
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Environment variables configured in production
- [ ] Database accessible from production
- [ ] Email service working in production

### Monitoring
- [ ] Error logging in place
- [ ] Email delivery monitored
- [ ] Database performance monitored
- [ ] User feedback mechanism ready

---

## Final Sign-Off

- [ ] All tests passed
- [ ] All roles verified
- [ ] Email notifications working
- [ ] QR activation confirmed
- [ ] Documentation complete
- [ ] Team trained on workflow
- [ ] Support plan in place

---

## Common Issues & Solutions

### QR Codes Not Activating
**Problem:** QRs stay inactive after "Mark Received"
**Check:**
- [ ] Authorizer clicked "Mark Received"
- [ ] Database update ran successfully
- [ ] Check: `db.products.find({ orderId: ORDER_ID, isActive: true })`

### Emails Not Sending
**Problem:** No emails received
**Check:**
- [ ] EMAIL_USER and EMAIL_PASSWORD in .env
- [ ] Gmail app password correct (16 characters)
- [ ] Backend console for email errors
- [ ] Check spam folder

### Wrong Status Transitions
**Problem:** Status not changing correctly
**Check:**
- [ ] Following exact workflow order
- [ ] User has correct role
- [ ] Previous status is correct
- [ ] Backend console for errors

---

**Once all checkboxes are ticked, your system is ready! 🎉**

For any issues, refer to the documentation files or check backend/frontend console logs.
