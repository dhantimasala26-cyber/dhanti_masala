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
  const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || "noreply@dhantifoods.com";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Dhanti Masala";
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || "admin@dhantifoods.com";

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
              <a href="https://dhantifoods.com" class="btn" target="_blank">Visit Our Shop</a>
            </div>
          </div>
          <div class="footer">
            <p>Need support? Reply to this email or call us at <strong>+91 866-0881905</strong></p>
            <p>&copy; ${new Date().getFullYear()} <a href="https://dhantifoods.com">Dhanti Masala</a>. All Rights Reserved.</p>
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
            <a href="https://dhantifoods.com/admin/orders" class="btn" target="_blank">Manage Order in Admin Panel</a>
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

// Send shipping update email with tracking information to customer
async function sendShippingEmail(order, supabase) {
  const token = process.env.ZEPTOMAIL_TOKEN;
  const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || "noreply@dhantifoods.com";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Dhanti Masala";

  if (!token) {
    console.warn("WARNING: ZEPTOMAIL_TOKEN is not configured in backend/.env. Shipping email will not be sent.");
    return;
  }

  const invoiceNo = await getInvoiceNumber(order, supabase);

  const shippingHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Order Has Shipped - Dhanti Masala</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf6f0; color: #333333; margin: 0; padding: 0; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #ebd9c8; box-shadow: 0 4px 12px rgba(176, 74, 38, 0.05); }
        .header { background-color: #B04A26; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; font-weight: bold; }
        .header p { color: #fdf0e7; margin: 5px 0 0 0; font-size: 13px; font-style: italic; opacity: 0.9; }
        .content { padding: 30px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: bold; color: #B04A26; margin-top: 0; }
        .shipping-banner { background-color: #f7ede2; border: 1px dashed #B04A26; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 25px; }
        .shipping-banner h2 { margin: 0 0 10px 0; color: #B04A26; font-size: 20px; }
        .shipping-details { width: 100%; margin-bottom: 25px; border-collapse: collapse; }
        .shipping-details td { padding: 12px; border: 1px solid #f0e1d5; font-size: 14px; }
        .shipping-details .label { font-weight: bold; color: #5c3e35; background-color: #fcf8f5; width: 40%; }
        .order-meta { background-color: #fcf8f5; border: 1px solid #f2e3d5; border-radius: 6px; padding: 15px; margin-bottom: 25px; font-size: 14px; }
        .order-meta table { width: 100%; }
        .order-meta td { padding: 4px 0; }
        .order-meta .label-small { font-weight: bold; color: #666666; width: 35%; }
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
            <p>Great news! Your order has been freshly packed and dispatched from our Peenya facility in Bangalore. Our delivery partner has picked it up and it is on the way to your kitchen.</p>
            
            <div class="shipping-banner">
              <h2>🚚 Shipped & On The Way!</h2>
              <p style="margin: 0; font-size: 14px; color: #5c3e35;">Your package of authentic Karnataka flavors is in transit.</p>
            </div>

            <table class="shipping-details">
              <tr>
                <td class="label">Delivery Partner</td>
                <td><strong>${order.delivery_partner || "Standard Courier"}</strong></td>
              </tr>
              <tr>
                <td class="label">Tracking Code / AWB</td>
                <td><strong style="font-family: monospace; font-size: 15px; color: #B04A26;">${order.tracking_code || "N/A"}</strong></td>
              </tr>
            </table>

            <div class="order-meta">
              <table style="width: 100%;">
                <tr>
                  <td class="label-small">Invoice No:</td>
                  <td><strong>${invoiceNo}</strong></td>
                </tr>
                <tr>
                  <td class="label-small">Order ID:</td>
                  <td style="font-family: monospace;">${order.id.toUpperCase()}</td>
                </tr>
                <tr>
                  <td class="label-small">Order Date:</td>
                  <td>${new Date(order.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 15px; color: #B04A26; margin-bottom: 8px;">Shipping Destination</h3>
            <div class="address-box">
              <strong>${order.customer_name}</strong><br>
              ${order.shipping_address}<br>
              ${order.city}, ${order.state} - <strong>${order.pincode}</strong><br>
              Phone: ${order.customer_phone}
            </div>

            <p style="font-size: 13px; color: #666666;">
              Please note: It may take up to 24 hours for the tracking details to become active on the courier partner's portal.
            </p>

            <div class="btn-container">
              <a href="https://dhantifoods.com" class="btn" target="_blank">Visit Our Shop</a>
            </div>
          </div>
          <div class="footer">
            <p>Need support? Reply to this email or call us at <strong>+91 866-0881905</strong></p>
            <p>&copy; ${new Date().getFullYear()} <a href="https://dhantifoods.com">Dhanti Masala</a>. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const payload = {
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
    subject: `Your Dhanti Masala Order ${invoiceNo} Has Shipped! 🚚`,
    htmlbody: shippingHtml
  };

  try {
    const res = await axios.post(url, payload, { headers });
    console.log(`[ZeptoMail] Shipping notification email sent successfully for ${invoiceNo}. Message ID:`, res.data?.message_id || "N/A");
  } catch (err) {
    console.error(`[ZeptoMail] Error sending shipping notification email for ${invoiceNo}:`, err.response ? err.response.data : err.message);
  }
}

// Send order status update email (delivery or payment changes)
async function sendOrderStatusUpdateEmail(order, field, oldValue, newValue, supabase) {
  const token = process.env.ZEPTOMAIL_TOKEN;
  const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || "noreply@dhantifoods.com";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Dhanti Masala";

  if (!token) {
    console.warn("WARNING: ZEPTOMAIL_TOKEN is not configured in backend/.env. Status update email will not be sent.");
    return;
  }

  const invoiceNo = await getInvoiceNumber(order, supabase);

  let bannerText = "";
  let bannerEmoji = "📦";
  let explanation = "";
  let subjectLine = "";

  if (field === "delivery") {
    if (newValue === "processing") {
      bannerEmoji = "🍳";
      bannerText = "Preparing Spices!";
      explanation = "Great news! We have started preparing your order. Our team in Peenya, Bangalore is dry-roasting and traditionally grinding your spices fresh in small batches to preserve natural aromas and oils.";
      subjectLine = `Your Dhanti Masala Order is now Processing! ${bannerEmoji}`;
    } else if (newValue === "delivered") {
      bannerEmoji = "🎉";
      bannerText = "Order Delivered!";
      explanation = "Hooray! Your package of handcrafted, authentic Karnataka flavors has been delivered. We hope these fresh spices bring warm smiles and beautiful aromas to your dining table.";
      subjectLine = `Your Dhanti Masala Order has been Delivered! ${bannerEmoji}`;
    } else if (newValue === "cancelled") {
      bannerEmoji = "❌";
      bannerText = "Order Cancelled";
      explanation = "Your order has been cancelled. If you believe this is a mistake, or if you require any assistance regarding refunds or re-ordering, please reply directly to this email or call us at +91 866-0881905.";
      subjectLine = `Dhanti Masala Order Cancelled ${bannerEmoji}`;
    } else {
      bannerEmoji = "📦";
      bannerText = `Order Status: ${newValue.toUpperCase()}`;
      explanation = `Your order status has been updated to ${newValue}.`;
      subjectLine = `Dhanti Masala Order Update: ${newValue.toUpperCase()} ${bannerEmoji}`;
    }
  } else if (field === "payment") {
    if (newValue === "paid") {
      bannerEmoji = "✅";
      bannerText = "Payment Received!";
      explanation = `Thank you! We have successfully received and verified your payment of ${formatCurrency(order.total)}. Your order is safe in our hands, and we are preparing to roast and grind your spices fresh.`;
      subjectLine = `Payment Confirmed - Invoice ${invoiceNo} ${bannerEmoji}`;
    } else if (newValue === "failed") {
      bannerEmoji = "⚠️";
      bannerText = "Payment Failed";
      explanation = `We were unable to process your payment for order ${invoiceNo}. Please review your transaction details or try a different payment method. If your account was charged, please contact us for immediate assistance.`;
      subjectLine = `Payment Failed - Invoice ${invoiceNo} ${bannerEmoji}`;
    } else {
      bannerEmoji = "💳";
      bannerText = `Payment: ${newValue.toUpperCase()}`;
      explanation = `Your order's payment status has been updated to ${newValue.toUpperCase()}.`;
      subjectLine = `Dhanti Masala Payment Update: ${newValue.toUpperCase()} ${bannerEmoji}`;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${bannerText} - Dhanti Masala</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf6f0; color: #333333; margin: 0; padding: 0; }
        .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #ebd9c8; box-shadow: 0 4px 12px rgba(176, 74, 38, 0.05); }
        .header { background-color: #B04A26; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px; font-weight: bold; }
        .header p { color: #fdf0e7; margin: 5px 0 0 0; font-size: 13px; font-style: italic; opacity: 0.9; }
        .content { padding: 30px; line-height: 1.6; }
        .greeting { font-size: 18px; font-weight: bold; color: #B04A26; margin-top: 0; }
        .status-banner { background-color: #fcf8f5; border: 1px dashed #B04A26; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 25px; }
        .status-banner h2 { margin: 0 0 10px 0; color: #B04A26; font-size: 20px; }
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
            <p>We are writing to update you on your order status. Below are the details regarding your recent purchase.</p>
            
            <div class="status-banner">
              <h2>${bannerEmoji} ${bannerText}</h2>
              <p style="margin: 0; font-size: 14px; color: #5c3e35; line-height: 1.6;">${explanation}</p>
            </div>
            
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
                  <td class="label">Delivery Status:</td>
                  <td style="text-transform: uppercase; font-weight: bold; color: #B04A26;">${order.delivery_status}</td>
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
                  <th style="text-align: right; width: 100px;">Total</th>
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
                <tr class="total-row">
                  <td colspan="2" style="text-align: right; padding: 12px 10px;">Grand Total:</td>
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

            <div class="btn-container">
              <a href="https://dhantifoods.com" class="btn" target="_blank">Visit Dhanti Masala</a>
            </div>
          </div>
          <div class="footer">
            <p>Need support? Reply to this email or call us at <strong>+91 866-0881905</strong></p>
            <p>&copy; ${new Date().getFullYear()} <a href="https://dhantifoods.com">Dhanti Masala</a>. All Rights Reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const payload = {
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
    subject: subjectLine,
    htmlbody: html
  };

  const url = "https://api.zeptomail.in/v1.1/email";
  const headers = {
    "Content-Type": "application/json",
    Authorization: token
  };

  try {
    const res = await axios.post(url, payload, { headers });
    console.log(`[ZeptoMail] Status update email sent successfully for ${invoiceNo}. Message ID:`, res.data?.message_id || "N/A");
  } catch (err) {
    console.error(`[ZeptoMail] Error sending status update email for ${invoiceNo}:`, err.response ? err.response.data : err.message);
  }
}

// Send custom direct email from admin dashboard to customer
async function sendDirectAdminEmail({ email, subject, message, template_type }) {
  const token = process.env.ZEPTOMAIL_TOKEN;
  const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || "noreply@dhantifoods.com";
  const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Dhanti Masala";

  if (!token) {
    console.warn("WARNING: ZEPTOMAIL_TOKEN is not configured in backend/.env. Direct email will not be sent.");
    return;
  }

  // Format message lines into paragraphs
  const messageHtml = message
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p style="margin: 0 0 1rem 0; line-height: 1.6; font-size: 15px;">${line}</p>`)
    .join("");

  let html = "";
  if (template_type === "promo") {
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f6efe9; margin: 0; padding: 0; }
          .wrapper { width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e1cfbf; box-shadow: 0 6px 16px rgba(176, 74, 38, 0.08); }
          .promo-header { background: linear-gradient(135deg, #B04A26 0%, #d6643c 100%); padding: 40px 30px; text-align: center; color: #ffffff; }
          .promo-header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .promo-header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; font-style: italic; }
          .content { padding: 35px 30px; color: #443c39; }
          .btn-container { text-align: center; margin: 30px 0 10px 0; }
          .btn { display: inline-block; background-color: #B04A26; color: #ffffff !important; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(176, 74, 38, 0.25); }
          .footer { background-color: #f7ece2; padding: 25px; text-align: center; font-size: 12px; color: #88726b; border-top: 1px solid #ebd9c8; }
          .footer a { color: #B04A26; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="promo-header">
            <h1>${fromName}</h1>
            <p>Authentic South Indian Flavours Handcrafted For You</p>
          </div>
          <div class="content">
            ${messageHtml}
            <div class="btn-container">
              <a href="https://dhantifoods.com" class="btn" target="_blank">Explore Our Store</a>
            </div>
          </div>
          <div class="footer">
            <p>You received this promotional message from the team at Dhanti Masala.</p>
            <p>&copy; ${new Date().getFullYear()} <a href="https://dhantifoods.com">Dhanti Masala</a>. All Rights Reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  } else {
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf6f0; color: #333333; margin: 0; padding: 0; }
          .wrapper { width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #ebd9c8; box-shadow: 0 4px 12px rgba(176, 74, 38, 0.05); }
          .header { background-color: #B04A26; padding: 25px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px; }
          .content { padding: 30px; line-height: 1.6; color: #2d2624; }
          .sig-box { border-top: 1px solid #f0e1d5; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #5c3e35; }
          .footer { background-color: #f5ece4; padding: 20px; text-align: center; font-size: 11px; color: #88726b; border-top: 1px solid #e8dbd0; }
          .footer a { color: #B04A26; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>${fromName} Support</h1>
          </div>
          <div class="content">
            ${messageHtml}
            <div class="sig-box">
              <strong>Warm regards,</strong><br>
              The Dhanti Masala Team<br>
              <span style="font-size: 12px; color: #88726b;">NO 28, Peenya II Stage, Bangalore</span>
            </div>
          </div>
          <div class="footer">
            <p>This is a direct notification regarding your account or inquiries with <a href="https://dhantifoods.com">Dhanti Masala</a>.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  const payload = {
    from: {
      address: fromAddress,
      name: fromName
    },
    to: [
      {
        email_address: {
          address: email,
          name: "Valued Customer"
        }
      }
    ],
    subject: subject,
    htmlbody: html
  };

  const url = "https://api.zeptomail.in/v1.1/email";
  const headers = {
    "Content-Type": "application/json",
    Authorization: token
  };

  const res = await axios.post(url, payload, { headers });
  console.log(`[ZeptoMail] Direct email sent successfully to ${email}. Message ID:`, res.data?.message_id || "N/A");
  return res.data;
}

module.exports = {
  getInvoiceNumber,
  sendOrderEmails,
  sendShippingEmail,
  sendOrderStatusUpdateEmail,
  sendDirectAdminEmail
};

