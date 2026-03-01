const PDFDocument = require("pdfkit");

/**
 * Generate invoice PDF for a credit transaction
 * @param {Object} transaction - CreditTransaction with populated fields
 * @param {Object} payment - Payment document (optional)
 * @returns {Promise<Buffer>} - PDF as base64 string
 */
const generateInvoicePdf = async (transaction, payment = null) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#283890';
      const accentColor = '#4F46E5';
      const textColor = '#1F2937';
      const mutedColor = '#6B7280';
      const lightBg = '#F9FAFB';

      // Helper functions
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      };

      const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      // Document properties
      doc.info.Title = `Invoice - ${transaction._id}`;
      doc.info.Author = 'Authentiks';

      // ═══════════════════════════════════════════════
      // HEADER
      // ═══════════════════════════════════════════════
      doc.save();
      doc.rect(0, 0, 595.28, 100).fill(primaryColor);
      doc.restore();

      // Company Logo/Name
      doc.fillColor('#FFFFFF')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('Authentiks', 50, 30);

      doc.fillColor('#E0E7FF')
        .fontSize(10)
        .font('Helvetica')
        .text('Secure Product Authentication', 50, 65);

      // Invoice Title
      doc.fillColor('#FFFFFF')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('INVOICE', 400, 35, { align: 'right', width: 145 });

      doc.fillColor('#E0E7FF')
        .fontSize(10)
        .font('Helvetica')
        .text(`#${transaction._id.toString().slice(-8).toUpperCase()}`, 400, 65, { align: 'right', width: 145 });

      // ═══════════════════════════════════════════════
      // INVOICE INFO BOX
      // ═══════════════════════════════════════════════
      let yPos = 140;

      doc.save();
      doc.rect(50, yPos, 495, 90).fill(lightBg);
      doc.restore();

      // Left side - Company Details
      doc.fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('BILLED TO:', 65, yPos + 15);

      doc.fillColor(textColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(transaction.companyId?.companyName || 'N/A', 65, yPos + 30);

      doc.fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica')
        .text(transaction.companyId?.email || '', 65, yPos + 47);

      doc.fillColor(mutedColor)
        .fontSize(9)
        .text(transaction.companyId?.phoneNumber || transaction.companyId?.supportNumber || '', 65, yPos + 62);

      const location = [transaction.companyId?.city, transaction.companyId?.country].filter(Boolean).join(', ');
      if (location) {
        doc.fillColor(mutedColor)
          .fontSize(9)
          .text(location, 65, yPos + 77);
      }

      // Right side - Invoice Details
      doc.fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('INVOICE DATE:', 340, yPos + 15);

      doc.fillColor(textColor)
        .fontSize(10)
        .font('Helvetica')
        .text(formatDate(transaction.createdAt), 445, yPos + 15);

      doc.fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('TRANSACTION ID:', 340, yPos + 40);

      doc.fillColor(textColor)
        .fontSize(9)
        .font('Helvetica')
        .text(transaction._id.toString().slice(-12), 445, yPos + 40);

      // Payment Status
      if (payment) {
        doc.fillColor(mutedColor)
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('PAYMENT STATUS:', 340, yPos + 65);

        const statusColor = payment.status === 'completed' ? '#10B981' : payment.status === 'pending' ? '#F59E0B' : '#EF4444';
        doc.fillColor(statusColor)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(payment.status.toUpperCase(), 445, yPos + 65);
      }

      // ═══════════════════════════════════════════════
      // TRANSACTION DETAILS TABLE
      // ═══════════════════════════════════════════════
      yPos = 260;

      doc.fillColor(primaryColor)
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('Transaction Details', 50, yPos);

      yPos += 30;

      // Table Header
      doc.save();
      doc.rect(50, yPos, 495, 25).fill(lightBg);
      doc.restore();

      doc.fillColor(textColor)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', 60, yPos + 8)
        .text('QTY', 340, yPos + 8, { width: 60, align: 'center' })
        .text('UNIT PRICE', 400, yPos + 8, { width: 70, align: 'right' })
        .text('AMOUNT', 470, yPos + 8, { width: 65, align: 'right' });

      yPos += 25;

      // Line separator
      doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(50, yPos).lineTo(545, yPos).stroke();

      yPos += 15;

      // Transaction Item
      const description = transaction.planName 
        ? `${transaction.planName} - QR Credits Purchase`
        : transaction.type === 'purchase_topup' 
          ? 'Custom QR Credits Top-up'
          : transaction.type === 'spend'
            ? `QR Credits Used - Order ${transaction.orderId?.orderId || 'N/A'}`
            : transaction.type === 'admin_grant'
              ? 'Admin Credit Grant'
              : 'Credit Transaction';

      const quantity = Math.abs(transaction.amount);
      const unitPrice = transaction.unitPrice || 0;
      const itemTotal = quantity * unitPrice;

      doc.fillColor(textColor)
        .fontSize(10)
        .font('Helvetica')
        .text(description, 60, yPos, { width: 270 })
        .text(quantity.toLocaleString(), 340, yPos, { width: 60, align: 'center' })
        .text(formatCurrency(unitPrice), 400, yPos, { width: 70, align: 'right' })
        .text(formatCurrency(itemTotal), 470, yPos, { width: 65, align: 'right' });

      yPos += 30;

      // Line separator
      doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(50, yPos).lineTo(545, yPos).stroke();

      // ═══════════════════════════════════════════════
      // PAYMENT BREAKDOWN (if payment exists)
      // ═══════════════════════════════════════════════
      if (payment) {
        yPos += 20;

        // Base Amount
        doc.fillColor(mutedColor)
          .fontSize(10)
          .font('Helvetica')
          .text('Base Amount:', 360, yPos)
          .fillColor(textColor)
          .text(formatCurrency(payment.baseAmount), 470, yPos, { width: 65, align: 'right' });

        yPos += 20;

        // GST
        if (payment.gstAmount > 0) {
          doc.fillColor(mutedColor)
            .fontSize(10)
            .text(`GST (${payment.gstPercentage}%):`, 360, yPos)
            .fillColor(textColor)
            .text(formatCurrency(payment.gstAmount), 470, yPos, { width: 65, align: 'right' });

          yPos += 20;
        }

        // Additional Charges
        if (payment.additionalCharges && payment.additionalCharges.length > 0) {
          payment.additionalCharges.forEach(charge => {
            doc.fillColor(mutedColor)
              .fontSize(10)
              .text(`${charge.name}:`, 360, yPos)
              .fillColor(textColor)
              .text(formatCurrency(charge.amount), 470, yPos, { width: 65, align: 'right' });

            yPos += 20;
          });
        }

        // Coupon Discount
        if (payment.couponDiscount > 0) {
          doc.fillColor('#10B981')
            .fontSize(10)
            .text(`Discount (${payment.couponCode}):`, 360, yPos)
            .text(`-${formatCurrency(payment.couponDiscount)}`, 470, yPos, { width: 65, align: 'right' });

          yPos += 20;
        }

        // Divider
        doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(350, yPos).lineTo(545, yPos).stroke();
        yPos += 15;

        // Total Amount
        doc.save();
        doc.rect(350, yPos - 5, 195, 30).fill(lightBg);
        doc.restore();

        doc.fillColor(primaryColor)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('TOTAL AMOUNT:', 360, yPos + 5)
          .fontSize(14)
          .text(formatCurrency(payment.finalAmount), 470, yPos + 5, { width: 65, align: 'right' });

        yPos += 40;
      } else if (transaction.totalPaid) {
        // If no payment object but have totalPaid in transaction
        yPos += 20;

        doc.save();
        doc.rect(350, yPos - 5, 195, 30).fill(lightBg);
        doc.restore();

        doc.fillColor(primaryColor)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('TOTAL PAID:', 360, yPos + 5)
          .fontSize(14)
          .text(formatCurrency(transaction.totalPaid), 470, yPos + 5, { width: 65, align: 'right' });

        yPos += 40;
      }

      // ═══════════════════════════════════════════════
      // PAYMENT INFO
      // ═══════════════════════════════════════════════
      if (payment && payment.phonePeTransactionId) {
        yPos += 10;

        doc.fillColor(primaryColor)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Payment Information', 50, yPos);

        yPos += 25;

        doc.fillColor(mutedColor)
          .fontSize(9)
          .font('Helvetica')
          .text('Payment Gateway:', 60, yPos);

        doc.fillColor(textColor)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('PhonePe', 180, yPos);

        yPos += 18;

        doc.fillColor(mutedColor)
          .fontSize(9)
          .font('Helvetica')
          .text('Transaction ID:', 60, yPos);

        doc.fillColor(textColor)
          .fontSize(9)
          .font('Helvetica')
          .text(payment.phonePeTransactionId, 180, yPos);

        yPos += 18;

        doc.fillColor(mutedColor)
          .fontSize(9)
          .font('Helvetica')
          .text('Merchant Order ID:', 60, yPos);

        doc.fillColor(textColor)
          .fontSize(9)
          .font('Helvetica')
          .text(payment.merchantOrderId, 180, yPos);
      }

      // ═══════════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════════
      const footerY = 750;

      doc.strokeColor('#E5E7EB').lineWidth(0.5).moveTo(50, footerY).lineTo(545, footerY).stroke();

      doc.fillColor(mutedColor)
        .fontSize(8)
        .font('Helvetica')
        .text('Thank you for your business!', 50, footerY + 15, { align: 'center', width: 495 });

      doc.fillColor(mutedColor)
        .fontSize(8)
        .text('Authentiks - Secure Product Authentication', 50, footerY + 30, { align: 'center', width: 495 });

      doc.fillColor(mutedColor)
        .fontSize(8)
        .text('For support, contact us at support@authentiks.in', 50, footerY + 45, { align: 'center', width: 495 });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePdf };
