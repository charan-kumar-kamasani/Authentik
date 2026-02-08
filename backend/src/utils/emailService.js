const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send email notification
const sendOrderStatusEmail = async (recipients, orderDetails, statusChange) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email not configured' };
    }

    const transporter = createTransporter();
    
    const { orderId, productName, brand, quantity, status, changedBy } = orderDetails;
    
    // Create email content based on status
    const subject = `Order ${orderId} - Status Update: ${status}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .status-pending { background: #fbbf24; color: #000; }
          .status-authorized { background: #8b5cf6; color: #fff; }
          .status-processing { background: #3b82f6; color: #fff; }
          .status-dispatching { background: #f97316; color: #fff; }
          .status-dispatched { background: #f59e0b; color: #fff; }
          .status-received { background: #10b981; color: #fff; }
          .status-rejected { background: #ef4444; color: #fff; }
          .footer { background: #333; color: #fff; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Authentik Order System</h1>
            <p>Order Status Notification</p>
          </div>
          <div class="content">
            <h2>Order Status Update</h2>
            <p>Hello,</p>
            <p>The status of order <strong>${orderId}</strong> has been updated.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span class="detail-value">${orderId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Product Name:</span>
                <span class="detail-value">${productName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Brand:</span>
                <span class="detail-value">${brand}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">${quantity} units</span>
              </div>
            </div>

            <div style="text-align: center;">
              <p><strong>Current Status:</strong></p>
              <span class="status-badge ${getStatusClass(status)}">${status}</span>
            </div>

            ${statusChange ? `<p style="margin-top: 20px;"><em>${statusChange}</em></p>` : ''}
            
            <p style="margin-top: 20px;">Changed by: <strong>${changedBy}</strong></p>
            
            ${getStatusMessage(status)}
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin-dashboard" class="btn">View Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Authentik - QR Authentication System</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to multiple recipients but do not let SMTP failures block the main flow.
    // Use Promise.allSettled to attempt all deliveries and record failures, but continue.
    const emailPromises = recipients
      .filter(recipient => recipient && recipient.includes('@'))
      .map((recipient) => {
        return transporter.sendMail({
          from: `"Authentik System" <${process.env.EMAIL_USER}>`,
          to: recipient,
          subject: subject,
          html: htmlContent,
        })
          .then(() => ({ recipient, status: 'fulfilled' }))
          .catch((err) => ({ recipient, status: 'rejected', error: err }));
      });

    const results = await Promise.allSettled(emailPromises);

    // Flatten results (because we wrapped each promise to resolve to an object)
    const failures = [];
    for (const r of results) {
      if (r.status === 'fulfilled') {
        const value = r.value;
        if (value && value.status === 'rejected') {
          failures.push({ recipient: value.recipient, error: value.error });
        }
      } else if (r.status === 'rejected') {
        // This should not normally happen because inner promises resolve, but handle defensively
        failures.push({ recipient: 'unknown', error: r.reason });
      }
    }

    if (failures.length > 0) {
      // Log a concise summary, avoid printing full SMTP stack in production logs
      console.warn(`Email sending: ${failures.length} failures. First error: ${failures[0].error && failures[0].error.message ? failures[0].error.message : String(failures[0].error)}`);
      return { success: false, message: `${failures.length} emails failed to send` };
    }

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: error.message };
  }
};

// Helper function to get status class
const getStatusClass = (status) => {
  const statusMap = {
    'Pending Authorization': 'status-pending',
    'Authorized': 'status-authorized',
    'Order Processing': 'status-processing',
    'Dispatching': 'status-dispatching',
    'Dispatched': 'status-dispatched',
    'Received': 'status-received',
    'Rejected': 'status-rejected',
  };
  return statusMap[status] || 'status-pending';
};

// Helper function to get status-specific message
const getStatusMessage = (status) => {
  const messages = {
    'Pending Authorization': '<p><strong>Next Step:</strong> Waiting for authorizer approval.</p>',
    'Authorized': '<p><strong>Next Step:</strong> Super Admin will process this order and generate QR codes.</p>',
    'Order Processing': '<p><strong>Action:</strong> QR codes are being generated. This may take a few moments.</p>',
    'Dispatching': '<p><strong>Action:</strong> Order is being prepared for dispatch.</p>',
    'Dispatched': '<p><strong>Action:</strong> Order has been dispatched. Authorizer needs to mark as received to activate QR codes.</p>',
    'Received': '<p><strong>✓ Complete:</strong> Order received and QR codes are now ACTIVE!</p>',
    'Rejected': '<p><strong>⚠ Notice:</strong> This order has been rejected. Please contact support for details.</p>',
  };
  return messages[status] || '';
};

module.exports = { sendOrderStatusEmail };
