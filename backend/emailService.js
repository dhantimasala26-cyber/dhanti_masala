const axios = require("axios");

// Helper to compute a sequential, fiscal-year-based invoice number from the database
async function getInvoiceNumber(order, supabase) {
  try {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .lte("created_at", order.created_at);

    if (error) {
      console.error("Error counting orders for invoice number:", error);
    }

    const seq = count || 1;
    const paddedSeq = String(seq).padStart(4, "0");

    const date = new Date(order.created_at);
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();
    let fiscalYear = "";
    if (month >= 3) { // April to December
      fiscalYear = `${year}-${String(year + 1).slice(-2)}`;
    } else { // January to March
      fiscalYear = `${year - 1}-${String(year).slice(-2)}`;
    }

    return `DM/${fiscalYear}/${paddedSeq}`;
  } catch (err) {
    console.error("Exception in getInvoiceNumber:", err);
    return `DM/UNKNOWN/${order.id.split("-")[0].toUpperCase()}`;
  }
}

// Format currency
function formatCurrency(num) {
  return "₹" + parseFloat(num).toFixed(2);
}

// Send both customer order confirmation and admin notification emails
async function sendOrderEmails(order, supabase) {
  const token = process.env.ZEPTOMAIL_TOKEN;
  const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || "noreply@dhantimasala.com";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Dhanti Masala";
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "admin@dhantimasala.com";

  if (!token) {
    console.warn("WARNING: ZEPTOMAIL_TOKEN is not configured in backend/.env. Order emails will not be sent.");
    return;
  }

  const invoiceNo = await getInvoiceNumber(order, supabase);

  // 1. Customer Email
  const customerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - Dhanti Masala</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf6f0; color: #333333; margin: 0; padding: 0; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #ebd9c8; box-shadow: 0 4px 12px rgba(176, 74, 38, 0.05); }
        .header { background-color: #B04A26; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; font-weight: bold; }
        .header p { color: #fdf0e7; margin: 5px 0 0 0; font-size: 13px; font-style: italic; opacity: 0.9; }
        .content { padding: 30px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: bold; color: #B04A26; margin-top: 0; }
        .order-meta { background-color: #fcf8f5; border: 1px solid #f2e3d5; border-radius: 6px; padding: 15px; margin-bottom: 25px; font-size: 14px; }
        .order-meta table { width: 100%; }
        .order-meta td { padding: 4px 0; }
        .order-meta .label { font-weight: bold; color: #666666; width: 35%; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .items-table th { background-color: #f7ede2; color: #5c3e35; font-weight: bold; text-align: left; padding: 10px; font-size: 13px; border-bottom: 2px solid #e8d0be; }
        .items-table td { padding: 12px 10px; border-bottom: 1px solid #f0e1d5; font-size: 14px; }
        .total-row { font-weight: bold; background-color: #fdf5ef; }
        .total-row td { border-top: 2px solid #B04A26; border-bottom: 2px solid #B04A26; color: #B04A26; font-size: 16px; }
        .address-box { background-color: #fdfaf7; border-left: 3px solid #B04A26; padding: 15px; border-radius: 0 6px 6px 0; font-size: 14px; margin-bottom: 25px; }
        .btn-container { text-align: center; margin: 30px 0 10px 0; }
        .btn { display: inline-block; background-color: #B04A26; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(176, 74, 38, 0.15); }
        .footer { background-color: #f5ece4; padding: 20px; text-align: center; font-size: 12px; color: #88726b; border-top: 1px solid #e8dbd0; }
        .footer a { color: #B04A26; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div style="padding: 20px 0; background-color: #faf6f0;">
        <div class="wrapper">
          <div class="header">
            <h1>${fromName}</h1>
            <p>Authentic Homemade Karnataka Spices & Mixes</p>
          </div>
          <div class="content">
            <p class="greeting">Namaskara ${order.customer_name},</p>
            <p>Thank you for shopping with Dhanti Masala! We have received your order and are preparing to roast and grind your spices fresh. Below is your tax invoice and order summary.</p>
            
            <div class="order-meta">
              <table>
                <tr>
                  <td class="label">Invoice No:</td>
                  <td><strong>${invoiceNo}</strong></td>
                </tr>
                <tr>
                  <td class="label">Order ID:</td>
                  <td style="font-family: monospace;">${order.id.toUpperCase()}</td>
                </tr>
                <tr>
                  <td class="label">Order Date:</td>
                  <td>${new Date(order.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                </tr>
                <tr>
                  <td class="label">Payment Method:</td>
                  <td style="text-transform: uppercase;">${order.payment_method}</td>
                </tr>
                <tr>
                  <td class="label">Payment Status:</td>
                  <td style="text-transform: uppercase; font-weight: bold;">${order.payment_status}</td>
                </tr>
              </table>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center; width: 60px;">Qty</th>
                  <th style="text-align: right; width: 80px;">Price</th>
                  <th style="text-align: right; width: 100px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.name} (${item.variant})</td>
                    <td style="text-align: center;">${item.qty}</td>
                    <td style="text-align: right;">${formatCurrency(item.price)}</td>
                    <td style="text-align: right; font-weight: 500;">${formatCurrency(item.price * item.qty)}</td>
                  </tr>
                `).join("")}
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: bold; border-bottom: none;">Subtotal:</td>
                  <td style="text-align: right; font-weight: bold; border-bottom: none;">${formatCurrency(order.subtotal)}</td>
                </tr>
                ${order.discount > 0 ? `
                  <tr>
                    <td colspan="3" style="text-align: right; font-weight: bold; color: #B04A26; border-bottom: none;">Discount (${order.coupon_code || "Coupon"}):</td>
                    <td style="text-align: right; font-weight: bold; color: #B04A26; border-bottom: none;">-${formatCurrency(order.discount)}</td>
                  </tr>
                ` : ""}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding: 12px 10px;">Grand Total:</td>
                  <td style="text-align: right; padding: 12px 10px;">${formatCurrency(order.total)}</td>
                </tr>
              </tbody>
            </table>

            <h3 style="font-size: 15px; color: #B04A26; margin-bottom: 8px;">Delivery Address</h3>
            <div class="address-box">
              <strong>${order.customer_name}</strong><br>
              ${order.shipping_address}<br>
              ${order.city}, ${order.state} - <strong>${order.pincode}</strong><br>
              Phone: ${order.customer_phone}
            </div>

            <p style="font-size: 13px; color: #666666;">
              Please note: Our spice blends are handcrafted weekly in Peenya, Bangalore, and shipped directly to lock in maximum freshness. You will receive another update when your package is dispatched.
            </p>

            <div class="btn-container">
              <a href="https://dhantimasala.com" class="btn" target="_blank">Visit Our Shop</a>
            </div>
          </div>
          <div class="footer">
            <p>Need support? Reply to this email or call us at <strong>+91 866-0881905</strong></p>
            <p>&copy; ${new Date().getFullYear()} <a href="https://dhantimasala.com">Dhanti Masala</a>. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // 2. Admin Email
  const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Alert - Dhanti Masala</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 0; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #d1d5db; margin-top: 20px; }
        .header { background-color: #111827; padding: 25px; text-align: center; }
        .header h1 { color: #34d399; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
        .header p { color: #9ca3af; margin: 5px 0 0 0; font-size: 12px; }
        .content { padding: 25px; }
        .summary-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 20px; }
        .summary-card table { width: 100%; }
        .summary-card td { padding: 4px 0; font-size: 14px; }
        .summary-card .label { font-weight: bold; color: #4b5563; width: 35%; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th { background-color: #f3f4f6; color: #374151; font-weight: bold; text-align: left; padding: 8px; font-size: 12px; border-bottom: 1px solid #d1d5db; }
        .items-table td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        .btn-container { text-align: center; margin: 25px 0 10px 0; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; padding: 10px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>🎉 New Order Placed!</h1>
          <p>Invoice generated: ${invoiceNo}</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; margin-top: 0;">A new order has been received on Dhanti Masala eCommerce.</p>
          
          <div class="summary-card">
            <table>
              <tr>
                <td class="label">Invoice Number:</td>
                <td><strong>${invoiceNo}</strong></td>
              </tr>
              <tr>
                <td class="label">Grand Total:</td>
                <td><strong style="color: #10b981; font-size: 16px;">${formatCurrency(order.total)}</strong></td>
              </tr>
              <tr>
                <td class="label">Customer Name:</td>
                <td>${order.customer_name}</td>
              </tr>
              <tr>
                <td class="label">Phone:</td>
                <td>${order.customer_phone}</td>
              </tr>
              <tr>
                <td class="label">Email:</td>
                <td>${order.customer_email}</td>
              </tr>
              <tr>
                <td class="label">Payment Method:</td>
                <td style="text-transform: uppercase;">${order.payment_method} (${order.payment_status})</td>
              </tr>
            </table>
          </div>

          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #4b5563; margin-bottom: 8px;">Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name} (${item.variant})</td>
                  <td style="text-align: center;">${item.qty}</td>
                  <td style="text-align: right; font-weight: 500;">${formatCurrency(item.price * item.qty)}</td>
                </tr>
              `).join("")}
              <tr style="font-weight: bold; background-color: #f9fafb;">
                <td colspan="2" style="text-align: right;">Grand Total:</td>
                <td style="text-align: right; color: #10b981;">${formatCurrency(order.total)}</td>
              </tr>
            </tbody>
          </table>

          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #4b5563; margin-bottom: 8px;">Shipping Address</h3>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; font-size: 13px; line-height: 1.5;">
            <strong>${order.customer_name}</strong><br>
            ${order.shipping_address}<br>
            ${order.city}, ${order.state} - ${order.pincode}
          </div>

          <div class="btn-container">
            <a href="https://dhantimasala.com/admin/orders" class="btn" target="_blank">Manage Order in Admin Panel</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // ZeptoMail API payloads
  const customerPayload = {
    from: {
      address: fromAddress,
      name: fromName
    },
    to: [
      {
        email_address: {
          address: order.customer_email,
          name: order.customer_name
        }
      }
    ],
    subject: `Order Confirmation - ${invoiceNo} | Dhanti Masala`,
    htmlbody: customerHtml
  };

  const adminPayload = {
    from: {
      address: fromAddress,
      name: fromName
    },
    to: [
      {
        email_address: {
          address: adminEmail,
          name: "Dhanti Masala Admin"
        }
      }
    ],
    subject: `🎉 New Order Received - ${invoiceNo} [${formatCurrency(order.total)}]`,
    htmlbody: adminHtml
  };

  const url = "https://api.zeptomail.in/v1.1/email";
  const headers = {
    "Content-Type": "application/json",
    Authorization: token
  };

  // Send Customer Email
  try {
    const custRes = await axios.post(url, customerPayload, { headers });
    console.log(`[ZeptoMail] Customer confirmation email sent successfully for ${invoiceNo}. Message ID:`, custRes.data?.message_id || "N/A");
  } catch (err) {
    console.error(`[ZeptoMail] Error sending customer email for ${invoiceNo}:`, err.response ? err.response.data : err.message);
  }

  // Send Admin Email
  try {
    const adminRes = await axios.post(url, adminPayload, { headers });
    console.log(`[ZeptoMail] Admin notification email sent successfully for ${invoiceNo}. Message ID:`, adminRes.data?.message_id || "N/A");
  } catch (err) {
    console.error(`[ZeptoMail] Error sending admin notification for ${invoiceNo}:`, err.response ? err.response.data : err.message);
  }
}

module.exports = {
  getInvoiceNumber,
  sendOrderEmails
};
