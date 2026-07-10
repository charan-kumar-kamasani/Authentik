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

module.exports = { sendOrderStatusEmail, sendLeadConfirmation, sendCouponExpiryNotification, sendCreditExpiryNotification, sendWarrantyClaimEmail };

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
            <div style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 40px 0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;">
                      <tr>
                        <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 1px;">AUTHENTIKS</h1>
                          <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">Next-Generation Brand Protection</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <p style="margin: 0 0 20px; font-size: 16px; color: #334155;">Dear ${leadData.name},</p>
                          <p style="margin: 0 0 24px; font-size: 16px; color: #475569; line-height: 1.6;">
                            Thank you for reaching out to Authentiks. We have successfully received your inquiry and our team is currently reviewing your details. A brand protection specialist will be in touch with you shortly.
                          </p>
                          
                          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 24px; margin-bottom: 32px;">
                            <h3 style="margin: 0 0 16px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Your Inquiry Details</h3>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b; width: 120px;">Name:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${leadData.name}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Phone:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${leadData.phone || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #64748b;">Company:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${leadData.company || 'N/A'}</td>
                              </tr>
                              ${leadData.requirements ? \`
                              <tr>
                                <td style="padding: 16px 0 8px; font-size: 14px; color: #64748b;" colspan="2">Requirements:</td>
                              </tr>
                              <tr>
                                <td style="padding: 0 0 8px; font-size: 14px; color: #0f172a; font-weight: 500; line-height: 1.5;" colspan="2">
                                  \${leadData.requirements}
                                </td>
                              </tr>
                              \` : ''}
                            </table>
                          </div>

                          <p style="margin: 0; font-size: 16px; color: #475569;">
                            Best regards,<br>
                            <strong style="color: #0f172a;">The Authentiks Team</strong>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} Authentiks. All rights reserved.</p>
                          <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;"><a href="https://authentiks.in" style="color: #2563eb; text-decoration: none;">www.authentiks.in</a></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
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

    // Ensure hello@authentiks.in is always included for leads
    if (!notificationEmails.includes('hello@authentiks.in')) {
      notificationEmails.push('hello@authentiks.in');
    }

    if (notificationEmails.length > 0) {
      console.log(`[EmailService] Queueing lead notification to admin(s): ${notificationEmails.join(', ')}`);
      emailPromises.push(
        transporter.sendMail({
          from: `"Authentiks Leads" <${process.env.EMAIL_USER}>`,
          to: notificationEmails.join(','),
          subject: `🔔 New Lead: ${leadData.name} (${leadData.company || 'No Company'})`,
          html: `
            <div style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 40px 0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;">
                      <tr>
                        <td style="background-color: #2563eb; padding: 32px 40px;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">New Lead Generated</h1>
                                <p style="margin: 4px 0 0; color: #bfdbfe; font-size: 14px;">Action Required</p>
                              </td>
                              <td align="right">
                                <span style="background-color: #ffffff; color: #2563eb; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Authentiks Lead</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 24px; font-size: 18px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Contact Information</h2>
                          
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; width: 140px;">
                                <span style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase;">Full Name</span>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                <span style="font-size: 15px; color: #0f172a; font-weight: 500;">${leadData.name}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                <span style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase;">Email Address</span>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                <a href="mailto:${leadData.email}" style="font-size: 15px; color: #2563eb; text-decoration: none; font-weight: 500;">${leadData.email || 'Not provided'}</a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                <span style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase;">Phone Number</span>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                <span style="font-size: 15px; color: #0f172a; font-weight: 500;">${leadData.phone || 'Not provided'}</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                <span style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase;">Company</span>
                              </td>
                              <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
                                <span style="font-size: 15px; color: #0f172a; font-weight: 500;">${leadData.company || 'Not provided'}</span>
                              </td>
                            </tr>
                          </table>

                          <h2 style="margin: 0 0 16px; font-size: 18px; color: #0f172a;">Requirements & Details</h2>
                          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; border-radius: 0 6px 6px 0;">
                            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${leadData.requirements || 'No specific requirements provided.'}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #0f172a; padding: 24px 40px; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #94a3b8;">This is an automated notification from the Authentiks platform.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
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

// ── Warranty Claim Email ──
async function sendWarrantyClaimEmail(supportEmail, claimDetails) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
    const transporter = createTransporter();
    const recipient = supportEmail || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!recipient) return;

    await transporter.sendMail({
      from: `"Authentiks Warranty" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `🛡️ New Warranty Claim Registered - ${claimDetails.productName}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:25px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="margin:0;">🛡️ New Warranty Claim</h1>
          </div>
          <div style="background:#fff;padding:25px;border:1px solid #ddd;border-top:none;border-radius:0 0 12px 12px;">
            <p>A new warranty claim has been registered.</p>
            <div style="background:#f0fdf4;padding:15px;border-radius:8px;border-left:4px solid #10b981;margin:15px 0;">
              <p><strong>Product:</strong> ${claimDetails.productName}</p>
              <p><strong>QR Code:</strong> ${claimDetails.qrCode || 'N/A'}</p>
              <p><strong>Date of Purchase:</strong> ${claimDetails.purchaseDate ? new Date(claimDetails.purchaseDate).toLocaleDateString() : 'N/A'}</p>
            </div>
            <p>Please log in to the admin dashboard to review the claim and take necessary actions.</p>
            <div style="text-align:center;margin-top:20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/warranty-claims" style="display:inline-block;padding:10px 20px;background:#10b981;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">View Claims Dashboard</a>
            </div>
          </div>
        </div>
      `
    });
    console.log(`[EmailService] Warranty claim email sent to ${recipient}`);
  } catch (err) {
    console.warn('Warranty claim email error:', err.message);
  }
}
