const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../email_debug.log');

const logToFile = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
};

let transporterInstance = null;

const createTransporter = () => {
  if (transporterInstance) return transporterInstance;

  try {
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const host = process.env.EMAIL_HOST || 'smtp.zoho.in';
    
    console.log(`[EmailService] Initializing transporter for ${host}:${port}`);
    
    transporterInstance = nodemailer.createTransport({
      host: host,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    return transporterInstance;
  } catch (err) {
    console.error('[EmailService] Failed to create transporter:', err);
    logToFile(`Failed to create transporter: ${err.message}`);
    throw err;
  }
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
            <h1>🔐 Authentiks Order System</h1>
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
            <p>© 2026 Authentiks - QR Authentication System</p>
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
          from: `"Authentiks System" <${process.env.EMAIL_USER}>`,
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

module.exports = { sendOrderStatusEmail, sendLeadConfirmation, sendCouponExpiryNotification, sendCreditExpiryNotification };

// ── Lead Confirmation Email ──
async function sendLeadConfirmation(leadData) {
  logToFile(`ENTRY: sendLeadConfirmation called for ${leadData.name}`);
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('[EmailService] Missing email credentials in env');
        return;
    }
    const transporter = createTransporter();

    console.log(`[EmailService] Processing lead confirmation for: ${leadData.name} (${leadData.email || 'no email'})`);
    logToFile(`Processing lead confirmation for: ${leadData.name} (${leadData.email || 'no email'})`);
    
    const emailPromises = [];

    // 1. Thank-you email to user
    if (leadData.email) {
      console.log(`[EmailService] Queueing thank-you email to ${leadData.email}...`);
      emailPromises.push(
        transporter.sendMail({
          from: `"Authentiks" <${process.env.EMAIL_USER}>`,
          to: leadData.email,
          subject: 'Thank you for your interest in Authentiks!',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:30px;text-align:center;border-radius:12px 12px 0 0;">
                <h1 style="margin:0;">🔐 Authentiks</h1>
                <p style="margin:8px 0 0;">World-Class Brand Protection</p>
              </div>
              <div style="background:#f9f9f9;padding:25px;border:1px solid #ddd;">
                <h2>Hi ${leadData.name},</h2>
                <p>Thank you for your interest in Authentiks! We've received your inquiry and our team will get back to you within 24 hours.</p>
                <div style="background:white;padding:15px;margin:15px 0;border-radius:8px;border-left:4px solid #667eea;">
                  ${leadData.requirements ? `<p><strong>Your Requirements:</strong> ${leadData.requirements}</p>` : '<p>We have received your general inquiry.</p>'}
                </div>
                <p>In the meantime, feel free to explore our features at <a href="https://authentiks.in">authentiks.in</a></p>
              </div>
              <div style="background:#333;color:#fff;padding:15px;text-align:center;border-radius:0 0 8px 8px;font-size:12px;">
                <p>© 2026 Authentiks - QR Authentication System</p>
              </div>
            </div>
          `
        }).then(info => {
            console.log(`[EmailService] Thank-you email sent successfully to ${leadData.email}. Response: ${info.response}`);
            logToFile(`Thank-you email sent successfully to ${leadData.email}. Response: ${info.response}`);
        }).catch(userEmailErr => {
            console.error(`[EmailService] Failed to send thank-you email to ${leadData.email}:`, userEmailErr);
            logToFile(`Failed to send thank-you email to ${leadData.email}: ${userEmailErr.message}`);
        })
      );
    }

    // 2. Lead notification email to admin
    const notificationEmails = [];
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (adminEmail) notificationEmails.push(adminEmail);
    
    const leadEmails = (process.env.LEAD_NOTIFICATION_EMAILS || '').split(',').map(e => e.trim()).filter(e => e && e.includes('@'));
    leadEmails.forEach(e => {
      if (!notificationEmails.includes(e)) notificationEmails.push(e);
    });

    if (notificationEmails.length > 0) {
      console.log(`[EmailService] Queueing lead notification to admin(s): ${notificationEmails.join(', ')}`);
      emailPromises.push(
        transporter.sendMail({
          from: `"Authentiks Leads" <${process.env.EMAIL_USER}>`,
          to: notificationEmails.join(','),
          subject: `🔔 New Lead: ${leadData.name} (${leadData.company || 'No Company'})`,
          html: `
            <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #f8fafc; color: #1e293b;">
              <div style="background-color: #ffffff; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                
                <div style="margin-bottom: 32px; border-bottom: 2px solid #3b82f6; padding-bottom: 16px;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em;">New Lead Captured</h1>
                  <p style="margin: 4px 0 0; color: #64748b; font-weight: 500;">A new brand authentication inquiry has been received.</p>
                </div>

                <div style="display: grid; gap: 20px;">
                  
                  <div style="background-color: #f1f5f9; padding: 20px; border-radius: 16px;">
                    <span style="display: block; font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;">Brand Expert</span>
                    <span style="display: block; font-size: 18px; font-weight: 700; color: #0f172a;">${leadData.name}</span>
                  </div>

                  <div style="margin-top: 20px;">
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
                      <tr>
                        <td style="padding: 12px; background-color: #f8fafc; border-radius: 12px 0 0 12px; width: 40%; font-weight: 700; color: #475569; font-size: 14px;">Email</td>
                        <td style="padding: 12px; background-color: #f8fafc; border-radius: 0 12px 12px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${leadData.email || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px 0 0 12px; width: 40%; font-weight: 700; color: #475569; font-size: 14px;">Phone</td>
                        <td style="padding: 12px; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 0 12px 12px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${leadData.phone || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px; background-color: #f8fafc; border-radius: 12px 0 0 12px; width: 40%; font-weight: 700; color: #475569; font-size: 14px;">Company</td>
                        <td style="padding: 12px; background-color: #f8fafc; border-radius: 0 12px 12px 0; color: #0f172a; font-size: 14px; font-weight: 600;">${leadData.company || 'Not provided'}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="margin-top: 24px; padding: 24px; background-color: #0f172a; border-radius: 20px; color: #f8fafc;">
                    <span style="display: block; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Requirements & Details</span>
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e2e8f0; font-style: italic;">
                      "${leadData.requirements || 'The user did not provide specific requirements.'}"
                    </p>
                  </div>

                </div>

                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                  <p style="font-size: 12px; color: #94a3b8; font-weight: 600; margin: 0;">This lead was captured from the Authentiks Public Website.</p>
                </div>
              </div>
            </div>
          `
        }).then(info => {
            console.log(`[EmailService] Lead notification sent. Response: ${info.response}`);
            logToFile(`Lead notification sent. Response: ${info.response}`);
        }).catch(adminEmailErr => {
            console.error('[EmailService] Failed to send admin notification:', adminEmailErr);
            logToFile(`Failed to send admin notification: ${adminEmailErr.message}`);
        })
      );
    }

    // Wait for all emails to complete in parallel
    await Promise.all(emailPromises);
    console.log('[EmailService] All lead confirmation emails processed.');
  } catch (err) {
    console.error('[EmailService] Lead email error (non-blocking):', err.stack || err.message);
    logToFile(`Lead email error (non-blocking): ${err.stack || err.message}`);
  }
}

// ── Coupon Expiry Notification ──
async function sendCouponExpiryNotification(email, couponData, daysLeft) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Authentiks" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `⏰ Your coupon ${couponData.code} expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);color:white;padding:25px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;">⏰ Coupon Expiring Soon!</h1>
          </div>
          <div style="background:#fff;padding:25px;border:1px solid #ddd;">
            <p>Your coupon <strong style="font-size:18px;color:#7c3aed;">${couponData.code}</strong> for <strong>${couponData.productName || 'product'}</strong> will expire in <strong style="color:#ef4444;">${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.</p>
            <p>Don't miss out! Use it before it's gone.</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    console.warn('Coupon expiry email error:', err.message);
  }
}

// ── Credit Expiry Notification ──
async function sendCreditExpiryNotification(emails, companyData) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
    const transporter = createTransporter();
    const recipients = emails.filter(e => e && e.includes('@'));
    if (recipients.length === 0) return;

    await transporter.sendMail({
      from: `"Authentiks" <${process.env.EMAIL_USER}>`,
      to: recipients.join(','),
      subject: `⚠️ ${companyData.companyName} — QR Credits expiring in ~30 days`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#ef4444,#f97316);color:white;padding:25px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;">⚠️ Credit Expiry Warning</h1>
          </div>
          <div style="background:#fff;padding:25px;border:1px solid #ddd;">
            <h2>${companyData.companyName}</h2>
            <p>Your QR credit plan is expiring soon. Please renew to avoid service interruption.</p>
            <div style="background:#fef2f2;padding:15px;border-radius:8px;border-left:4px solid #ef4444;margin:15px 0;">
              <p><strong>Credits Remaining:</strong> ${companyData.qrCredits || 0}</p>
              <p><strong>Expiry Date:</strong> ${companyData.creditExpiry ? new Date(companyData.creditExpiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Soon'}</p>
            </div>
            <p>Contact your account manager or visit your dashboard to renew.</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    console.warn('Credit expiry email error:', err.message);
  }
}
