'use client';

import React, { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import { Modal } from '@/components/UI/Modal';
import { useToast } from '@/context/ToastContext';
import { apiUrl } from '@/lib/api';

export default function AdminOrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState<any>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit states inside modal
  const [editPaymentStatus, setEditPaymentStatus] = useState<Order['payment_status']>('pending');
  const [editDeliveryStatus, setEditDeliveryStatus] = useState<Order['delivery_status']>('pending');
  const [editTransactionId, setEditTransactionId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/orders'));
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const fetchCompanySettings = async () => {
      try {
        const res = await fetch(apiUrl('/api/cms?key=company_settings'));
        const data = await res.json();
        if (data.success && data.value) {
          setCompanySettings(data.value);
        }
      } catch (err) {
        console.error('Error fetching company settings:', err);
      }
    };
    fetchCompanySettings();
  }, []);

  // Filter orders whenever filters or search terms change
  useEffect(() => {
    let result = [...orders];

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(term) ||
        o.customer_name.toLowerCase().includes(term) ||
        o.customer_email.toLowerCase().includes(term) ||
        o.customer_phone.includes(term) ||
        o.city.toLowerCase().includes(term) ||
        (o.coupon_code && o.coupon_code.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== '') {
      result = result.filter(o => o.delivery_status === statusFilter);
    }

    if (paymentFilter !== '') {
      result = result.filter(o => o.payment_status === paymentFilter);
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditPaymentStatus(order.payment_status);
    setEditDeliveryStatus(order.delivery_status);
    setEditTransactionId(order.transaction_id || '');
    setIsModalOpen(true);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/orders'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedOrder.id,
          payment_status: editPaymentStatus,
          delivery_status: editDeliveryStatus,
          transaction_id: editTransactionId || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        showToast('Order settings updated successfully', 'success');
        loadOrders(); // Refresh order list
      } else {
        showToast(data.message || 'Failed to update order', 'error');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      showToast('Error updating order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const printOrder = (order: Order) => {
    const companyName = companySettings?.company_name || 'Dhanti Masala';
    const logoUrl = companySettings?.logo_url || '';
    const tagline = companySettings?.footer_tagline || 'Authentic Homemade Karnataka Spices';
    const email = companySettings?.email || 'support@dhantimasala.com';
    const phone = companySettings?.phone || '+91 866-0881905';
    const address = companySettings?.address || 'Karnataka, India';
    const gstin = companySettings?.gstin || '';
    const fssai = companySettings?.fssai || '';

    // Create a hidden temporary iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      showToast('Printing failed to initialize.', 'error');
      document.body.removeChild(iframe);
      return;
    }

    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 10px; font-weight: 500;">${item.name} (${item.variant})</td>
        <td style="padding: 12px 10px; text-align: center;">${item.qty}</td>
        <td style="padding: 12px 10px; text-align: right;">₹${item.price}</td>
        <td style="padding: 12px 10px; text-align: right; font-weight: 600;">₹${item.price * item.qty}</td>
      </tr>
    `).join('');

    doc.write(`
      <html>
        <head>
          <title>Order Receipt - ${order.id.split('-')[0].toUpperCase()}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; background: white; margin: 0; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; background: white;">
            <!-- Header Table -->
            <table style="width: 100%; border-bottom: 3px solid #B04A26; padding-bottom: 20px; margin-bottom: 25px;">
              <tr>
                <td style="vertical-align: top;">
                  <table style="width: auto; border-collapse: collapse; border: 0; margin-bottom: 10px;">
                    <tr>
                      ${logoUrl === '/logo.svg' ? `
                      <td style="vertical-align: middle; padding: 0 25px 0 0; border: 0;">
                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 2C8.268 2 2 8.268 2 16c0 5.4 3.056 10.09 7.525 12.396.643.332 1.341-.225 1.228-.934l-.84-5.267a1 1 0 01.374-.93L13.8 18.5a1 1 0 000-1.556l-3.513-2.763a1 1 0 01-.374-.93l.84-5.267c.113-.71-.585-1.266-1.228-.934A13.945 13.945 0 0016 4c7.732 0 14 6.268 14 14s-6.268 14-14 14c-1.325 0-2.613-.184-3.834-.53a.75.75 0 01-.52-.924l.583-2.036a.75.75 0 01.933-.51c.915.28 1.879.43 2.838.43 6.627 0 12-5.373 12-12S22.627 6 16 6 4 11.373 4 18c0 3.328 1.353 6.34 3.543 8.52a.75.75 0 001.21-.194l1.182-3.153a.75.75 0 00-.142-.816A9.957 9.957 0 018 16c0-4.418 3.582-8 8-8s8 3.582 8 8c0 2.27-.946 4.32-2.473 5.787a.75.75 0 00-.113.987l2.25 3a.75.75 0 001.127.086C28.026 23.36 30 19.907 30 16c0-7.732-6.268-14-14-14z" fill="#C2593F" />
                          <circle cx="16" cy="16" r="4" fill="#D88D43" />
                        </svg>
                      </td>
                      ` : logoUrl ? `
                      <td style="vertical-align: middle; padding: 0 25px 0 0; border: 0;">
                        <img src="${logoUrl}" style="height: 60px; max-width: 120px; object-fit: contain;" />
                      </td>
                      ` : ''}
                      <td style="vertical-align: middle; border: 0;">
                        <div style="font-size: 28px; font-weight: bold; color: #B04A26; letter-spacing: 0.5px; line-height: 1.2;">${companyName}</div>
                        <div style="font-size: 13px; color: #666; font-style: italic; margin-top: 3px;">${tagline}</div>
                      </td>
                    </tr>
                  </table>
                  <div style="font-size: 12px; color: #444; margin-top: 10px; line-height: 1.4;">
                    ${address.replace(/\n/g, '<br>')}<br>
                    <strong>Phone:</strong> ${phone} | <strong>Email:</strong> ${email}
                    ${gstin ? `<br><strong>GSTIN:</strong> ${gstin}` : ''}
                    ${fssai ? ` | <strong>FSSAI:</strong> ${fssai}` : ''}
                  </div>
                </td>
                <td style="text-align: right; vertical-align: top;">
                  <div style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 1px; margin-bottom: 8px;">INVOICE</div>
                  <div style="font-size: 13px; color: #555;"><strong>Order ID:</strong> ${order.id.toUpperCase()}</div>
                  <div style="font-size: 13px; color: #555; margin-top: 3px;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleString('en-IN')}</div>
                </td>
              </tr>
            </table>
            
            <!-- Details Section -->
            <table style="width: 100%; margin-bottom: 30px; font-size: 14px; line-height: 1.6;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding-right: 25px;">
                  <strong style="font-size: 15px; color: #B04A26; display: block; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 8px;">Billing & Shipping To:</strong>
                  <span style="font-size: 15px; font-weight: 600; color: #111; display: block; margin-bottom: 3px;">${order.customer_name}</span>
                  ${order.shipping_address}<br>
                  ${order.city}, ${order.state} - ${order.pincode}<br>
                  <strong>Phone:</strong> ${order.customer_phone}<br>
                  <strong>Email:</strong> ${order.customer_email}
                </td>
                <td style="width: 50%; vertical-align: top; padding-left: 25px;">
                  <strong style="font-size: 15px; color: #B04A26; display: block; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 8px;">Payment & Delivery Details:</strong>
                  <strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}<br>
                  <strong>Payment Status:</strong> <span style="font-weight: 600;">${order.payment_status.toUpperCase()}</span><br>
                  <strong>Transaction ID:</strong> ${order.transaction_id || 'N/A'}<br>
                  <strong>Delivery Status:</strong> <span style="font-weight: 600;">${order.delivery_status.toUpperCase()}</span>
                </td>
              </tr>
            </table>

            <!-- Line Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
              <thead>
                <tr style="background: #F9FAFB; border-bottom: 2px solid #E5E7EB; border-top: 1px solid #E5E7EB;">
                  <th style="padding: 12px 10px; text-align: left; font-weight: bold; color: #4B5563;">Item Description</th>
                  <th style="padding: 12px 10px; text-align: center; width: 80px; font-weight: bold; color: #4B5563;">Qty</th>
                  <th style="padding: 12px 10px; text-align: right; width: 100px; font-weight: bold; color: #4B5563;">Price</th>
                  <th style="padding: 12px 10px; text-align: right; width: 120px; font-weight: bold; color: #4B5563;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Totals Section -->
            <table style="width: 100%; font-size: 14px; margin-top: 10px;">
              <tr>
                <td style="width: 55%; vertical-align: top;">
                  <div style="font-size: 13px; color: #666; max-width: 320px; line-height: 1.5;">
                    <strong>Important Notes:</strong><br>
                    - This is a system-generated invoice, no signature is required.<br>
                    - For any support or returns, please quote the Order ID shown above.
                  </div>
                </td>
                <td style="width: 45%; vertical-align: top;">
                  <table style="width: 100%; line-height: 2.0; text-align: right; border-collapse: collapse;">
                    <tr>
                      <td style="color: #666; text-align: left; padding: 2px 0;">Subtotal:</td>
                      <td style="font-weight: 600; padding: 2px 0; color: #111;">₹${order.subtotal}</td>
                    </tr>
                    ${order.discount > 0 ? `
                    <tr>
                      <td style="color: #B04A26; text-align: left; padding: 2px 0;">Discount (${order.coupon_code || 'Coupon'}):</td>
                      <td style="font-weight: 600; color: #B04A26; padding: 2px 0;">-₹${order.discount}</td>
                    </tr>
                    ` : ''}
                    <tr style="border-top: 2px solid #B04A26;">
                      <td style="font-size: 18px; font-weight: bold; color: #B04A26; text-align: left; padding: 10px 0 0 0;">Grand Total:</td>
                      <td style="font-size: 18px; font-weight: bold; color: #B04A26; padding: 10px 0 0 0;">₹${order.total}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <div style="margin-top: 80px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 12px; color: #9CA3AF;">
              Thank you for shopping with us! Visit <a href="https://dhantimasala.com" style="color: #B04A26; text-decoration: none; font-weight: 600;">dhantimasala.com</a> for more homemade flavors.
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Focus and print the iframe content, then clean up
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 300);
  };

  const fallbackTextDownload = (order: Order) => {
    const header = `==================================================\n` +
                   `                 DHANTI MASALA                    \n` +
                   `   Authentic Homemade Karnataka Spices & Mixes    \n` +
                   `==================================================\n\n` +
                   `INVOICE / ORDER SUMMARY\n` +
                   `--------------------------------------------------\n` +
                   `Order ID:      ${order.id.toUpperCase()}\n` +
                   `Order Date:    ${new Date(order.created_at).toLocaleString('en-IN')}\n` +
                   `Order Status:  ${order.delivery_status.toUpperCase()}\n` +
                   `--------------------------------------------------\n\n`;

    const customerInfo = `CUSTOMER DETAILS:\n` +
                         `Name:          ${order.customer_name}\n` +
                         `Phone:         ${order.customer_phone}\n` +
                         `Email:         ${order.customer_email}\n` +
                         `Address:       ${order.shipping_address}\n` +
                         `               ${order.city}, ${order.state} - ${order.pincode}\n\n`;

    const paymentInfo = `PAYMENT INFORMATION:\n` +
                        `Method:        ${order.payment_method.toUpperCase()}\n` +
                        `Status:        ${order.payment_status.toUpperCase()}\n` +
                        `Reference:     ${order.transaction_id || 'N/A'}\n\n`;

    let itemsInfo = `ORDER ITEMS:\n` +
                    `--------------------------------------------------\n` +
                    `Item Description`.padEnd(30) + ' ' + 'Qty'.padStart(5) + ' ' + 'Price'.padStart(10) + ' ' + 'Total'.padStart(10) + `\n` +
                    `--------------------------------------------------\n`;

    order.items.forEach(item => {
      const name = `${item.name} (${item.variant})`.substring(0, 30);
      const qty = item.qty.toString();
      const price = `₹${item.price}`;
      const total = `₹${item.price * item.qty}`;
      itemsInfo += `${name.padEnd(30)} ${qty.padStart(5)} ${price.padStart(10)} ${total.padStart(10)}\n`;
    });
    itemsInfo += `--------------------------------------------------\n\n`;

    const totalsInfo = `SUMMARY:\n` +
                       `Subtotal:      ₹${order.subtotal}\n` +
                       (order.discount > 0 ? `Discount:      -₹${order.discount} (${order.coupon_code || 'Coupon'})\n` : '') +
                       `Grand Total:   ₹${order.total}\n` +
                       `==================================================\n` +
                       `Thank you for shopping with Dhanti Masala!\n`;

    const fileContent = header + customerInfo + paymentInfo + itemsInfo + totalsInfo;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_${order.id.split('-')[0].toUpperCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadOrder = async (order: Order) => {
    const companyName = companySettings?.company_name || 'Dhanti Masala';
    const logoUrl = companySettings?.logo_url || '';
    const tagline = companySettings?.footer_tagline || 'Authentic Homemade Karnataka Spices & Mixes';
    const email = companySettings?.email || 'support@dhantimasala.com';
    const phone = companySettings?.phone || '+91 866-0881905';
    const address = companySettings?.address || 'Karnataka, India';
    const gstin = companySettings?.gstin || '';
    const fssai = companySettings?.fssai || '';

    showToast('Preparing PDF download...', 'info');
    try {
      const html2pdf = (await import('html2pdf.js' as any)).default;
      
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '0';
      container.style.height = '0';
      container.style.overflow = 'hidden';
      container.style.zIndex = '-9999';
      container.style.pointerEvents = 'none';

      const element = document.createElement('div');
      element.style.width = '700px'; // Fit within A4 margins to avoid cropping
      element.style.backgroundColor = 'white';
      
      const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 10px; font-weight: 500;">${item.name} (${item.variant})</td>
          <td style="padding: 12px 10px; text-align: center;">${item.qty}</td>
          <td style="padding: 12px 10px; text-align: right;">₹${item.price}</td>
          <td style="padding: 12px 10px; text-align: right; font-weight: 600;">₹${item.price * item.qty}</td>
        </tr>
      `).join('');

      element.innerHTML = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; background: white;">
          <!-- Header Table -->
          <table style="width: 100%; border-bottom: 3px solid #B04A26; padding-bottom: 20px; margin-bottom: 25px;">
            <tr>
              <td style="vertical-align: top;">
                <table style="width: auto; border-collapse: collapse; border: 0; margin-bottom: 10px;">
                  <tr>
                    ${logoUrl === '/logo.svg' ? `
                    <td style="vertical-align: middle; padding: 0 25px 0 0; border: 0;">
                      <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2C8.268 2 2 8.268 2 16c0 5.4 3.056 10.09 7.525 12.396.643.332 1.341-.225 1.228-.934l-.84-5.267a1 1 0 01.374-.93L13.8 18.5a1 1 0 000-1.556l-3.513-2.763a1 1 0 01-.374-.93l.84-5.267c.113-.71-.585-1.266-1.228-.934A13.945 13.945 0 0016 4c7.732 0 14 6.268 14 14s-6.268 14-14 14c-1.325 0-2.613-.184-3.834-.53a.75.75 0 01-.52-.924l.583-2.036a.75.75 0 01.933-.51c.915.28 1.879.43 2.838.43 6.627 0 12-5.373 12-12S22.627 6 16 6 4 11.373 4 18c0 3.328 1.353 6.34 3.543 8.52a.75.75 0 001.21-.194l1.182-3.153a.75.75 0 00-.142-.816A9.957 9.957 0 018 16c0-4.418 3.582-8 8-8s8 3.582 8 8c0 2.27-.946 4.32-2.473 5.787a.75.75 0 00-.113.987l2.25 3a.75.75 0 001.127.086C28.026 23.36 30 19.907 30 16c0-7.732-6.268-14-14-14z" fill="#C2593F" />
                        <circle cx="16" cy="16" r="4" fill="#D88D43" />
                      </svg>
                    </td>
                    ` : logoUrl ? `
                    <td style="vertical-align: middle; padding: 0 25px 0 0; border: 0;">
                      <img src="${logoUrl}" style="height: 60px; max-width: 120px; object-fit: contain;" />
                    </td>
                    ` : ''}
                    <td style="vertical-align: middle; border: 0; padding: 0;">
                      <div style="font-size: 28px; font-weight: bold; color: #B04A26; letter-spacing: 0.5px; line-height: 1.2;">${companyName}</div>
                      <div style="font-size: 13px; color: #666; font-style: italic; margin-top: 3px;">${tagline}</div>
                    </td>
                  </tr>
                </table>
                <div style="font-size: 12px; color: #444; margin-top: 10px; line-height: 1.4;">
                  ${address.replace(/\n/g, '<br>')}<br>
                  <strong>Phone:</strong> ${phone} | <strong>Email:</strong> ${email}
                  ${gstin ? `<br><strong>GSTIN:</strong> ${gstin}` : ''}
                  ${fssai ? ` | <strong>FSSAI:</strong> ${fssai}` : ''}
                </div>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <div style="font-size: 24px; font-weight: bold; color: #333; letter-spacing: 1px; margin-bottom: 8px;">INVOICE</div>
                <div style="font-size: 13px; color: #555;"><strong>Order ID:</strong> ${order.id.toUpperCase()}</div>
                <div style="font-size: 13px; color: #555; margin-top: 3px;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleString('en-IN')}</div>
              </td>
            </tr>
          </table>
          
          <!-- Details Section -->
          <table style="width: 100%; margin-bottom: 30px; font-size: 14px; line-height: 1.6;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 25px;">
                <strong style="font-size: 15px; color: #B04A26; display: block; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 8px;">Billing & Shipping To:</strong>
                <span style="font-size: 15px; font-weight: 600; color: #111; display: block; margin-bottom: 3px;">${order.customer_name}</span>
                ${order.shipping_address}<br>
                ${order.city}, ${order.state} - ${order.pincode}<br>
                <strong>Phone:</strong> ${order.customer_phone}<br>
                <strong>Email:</strong> ${order.customer_email}
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 25px;">
                <strong style="font-size: 15px; color: #B04A26; display: block; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 8px;">Payment & Delivery Details:</strong>
                <strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}<br>
                <strong>Payment Status:</strong> <span style="font-weight: 600;">${order.payment_status.toUpperCase()}</span><br>
                <strong>Transaction ID:</strong> ${order.transaction_id || 'N/A'}<br>
                <strong>Delivery Status:</strong> <span style="font-weight: 600;">${order.delivery_status.toUpperCase()}</span>
              </td>
            </tr>
          </table>

          <!-- Line Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
            <thead>
              <tr style="background: #F9FAFB; border-bottom: 2px solid #E5E7EB; border-top: 1px solid #E5E7EB;">
                <th style="padding: 12px 10px; text-align: left; font-weight: bold; color: #4B5563;">Item Description</th>
                <th style="padding: 12px 10px; text-align: center; width: 80px; font-weight: bold; color: #4B5563;">Qty</th>
                <th style="padding: 12px 10px; text-align: right; width: 100px; font-weight: bold; color: #4B5563;">Price</th>
                <th style="padding: 12px 10px; text-align: right; width: 120px; font-weight: bold; color: #4B5563;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals Section -->
          <table style="width: 100%; font-size: 14px; margin-top: 10px;">
            <tr>
              <td style="width: 55%; vertical-align: top;">
                <div style="font-size: 13px; color: #666; max-width: 320px; line-height: 1.5;">
                  <strong>Important Notes:</strong><br>
                  - This is a system-generated invoice, no signature is required.<br>
                  - For any support or returns, please quote the Order ID shown above.
                </div>
              </td>
              <td style="width: 45%; vertical-align: top;">
                <table style="width: 100%; line-height: 2.0; text-align: right; border-collapse: collapse;">
                  <tr>
                    <td style="color: #666; text-align: left; padding: 2px 0;">Subtotal:</td>
                    <td style="font-weight: 600; padding: 2px 0; color: #111;">₹${order.subtotal}</td>
                  </tr>
                  ${order.discount > 0 ? `
                  <tr>
                    <td style="color: #B04A26; text-align: left; padding: 2px 0;">Discount (${order.coupon_code || 'Coupon'}):</td>
                    <td style="font-weight: 600; color: #B04A26; padding: 2px 0;">-₹${order.discount}</td>
                  </tr>
                  ` : ''}
                  <tr style="border-top: 2px solid #B04A26;">
                    <td style="font-size: 18px; font-weight: bold; color: #B04A26; text-align: left; padding: 10px 0 0 0;">Grand Total:</td>
                    <td style="font-size: 18px; font-weight: bold; color: #B04A26; padding: 10px 0 0 0;">₹${order.total}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <div style="margin-top: 80px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 12px; color: #9CA3AF;">
            Thank you for shopping with us! Visit <a href="https://dhantimasala.com" style="color: #B04A26; text-decoration: none; font-weight: 600;">dhantimasala.com</a> for more homemade flavors.
          </div>
        </div>
      `;

      container.appendChild(element);
      document.body.appendChild(container);

      const opt = {
        margin:       10,
        filename:     `invoice_${order.id.split('-')[0].toUpperCase()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2.5, useCORS: true, logging: false, letterRendering: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate and save the PDF
      await html2pdf().set(opt).from(element).save();
      
      // Cleanup
      document.body.removeChild(container);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Failed to download PDF. Falling back to plain text...', 'error');
      fallbackTextDownload(order);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'var(--color-success)';
      case 'shipped':
      case 'processing':
        return 'var(--color-secondary)';
      case 'pending':
        return 'var(--color-text-muted)';
      case 'failed':
      case 'cancelled':
        return 'var(--color-error)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'rgba(46, 90, 68, 0.1)';
      case 'shipped':
      case 'processing':
        return 'rgba(216, 141, 67, 0.1)';
      case 'pending':
        return '#F0ECE9';
      case 'failed':
      case 'cancelled':
        return 'rgba(194, 68, 68, 0.1)';
      default:
        return '#F0ECE9';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Orders Tracker</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Track payment processing, update shipping logistics, and verify invoices.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap'
      }}>
        <div style={{ flexGrow: 1, minWidth: '240px' }}>
          <input 
            type="text" 
            placeholder="Search by ID, name, email, city, coupon..." 
            className="form-control"
            style={{ width: '100%', padding: '0.6rem 1rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ minWidth: '160px' }}>
          <select 
            className="form-control" 
            style={{ width: '100%', padding: '0.6rem 1rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Delivery Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div style={{ minWidth: '160px' }}>
          <select 
            className="form-control" 
            style={{ width: '100%', padding: '0.6rem 1rem' }}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Loading orders database...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: 'var(--radius-sm)', 
          border: '1px solid var(--color-border)', 
          padding: '4rem 2rem', 
          textAlign: 'center',
          color: 'var(--color-text-muted)'
        }}>
          No orders found matching the filter criteria.
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA', borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th>Date</th>
                <th>Customer Details</th>
                <th>Total Bill</th>
                <th>Payment Method</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th style={{ textAlign: 'right', paddingRight: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                    {order.id.split('-')[0].toUpperCase()}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{order.customer_phone} | {order.city}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{order.total}</td>
                  <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}>{order.payment_method}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: getStatusBg(order.payment_status),
                      color: getStatusColor(order.payment_status)
                    }}>
                      {order.payment_status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: getStatusBg(order.delivery_status),
                      color: getStatusColor(order.delivery_status)
                    }}>
                      {order.delivery_status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleOpenDetails(order)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                        Manage
                      </button>
                      <button 
                        onClick={() => printOrder(order)} 
                        className="btn btn-secondary" 
                        style={{ 
                          padding: '0.3rem 0.6rem', 
                          fontSize: '0.75rem', 
                          backgroundColor: '#e2e8f0', 
                          color: '#4a5568',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }} 
                        title="Print Invoice"
                      >
                        🖨️ Print
                      </button>
                      <button 
                        onClick={() => downloadOrder(order)} 
                        className="btn btn-secondary" 
                        style={{ 
                          padding: '0.3rem 0.6rem', 
                          fontSize: '0.75rem', 
                          backgroundColor: '#e2e8f0', 
                          color: '#4a5568',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }} 
                        title="Download Invoice"
                      >
                        📥 Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details & Management Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Manage Order #${selectedOrder.id.split('-')[0].toUpperCase()}`}
          size="large"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', padding: '1rem 0' }}>
            
            {/* Left Column: Items and Customer Info */}
            <div>
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Line Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--color-bg-light)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <img 
                      src={item.image || '/rasam_powder.jpg'} 
                      alt={item.name} 
                      style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Pack: {item.variant} | Qty: {item.qty}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>₹{item.price * item.qty}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Delivery Address</h3>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--color-text-dark)' }}>
                <p><strong>{selectedOrder.customer_name}</strong></p>
                <p>{selectedOrder.shipping_address}</p>
                <p>{selectedOrder.city}, {selectedOrder.state} - <strong>{selectedOrder.pincode}</strong></p>
                <p style={{ marginTop: '0.5rem' }}>📞 {selectedOrder.customer_phone} | ✉️ {selectedOrder.customer_email}</p>
              </div>
            </div>

            {/* Right Column: Order status form */}
            <div style={{ backgroundColor: 'var(--color-bg-light)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Order Status</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-primary)' }}>
                    <span>Coupon Discount {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}:</span>
                    <span style={{ fontWeight: 600 }}>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <hr style={{ border: 'none', borderBottom: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ fontWeight: 700 }}>Total:</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>₹{selectedOrder.total}</span>
                </div>
              </div>

              <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select 
                    className="form-control"
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as Order['payment_status'])}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Status</label>
                  <select 
                    className="form-control"
                    value={editDeliveryStatus}
                    onChange={(e) => setEditDeliveryStatus(e.target.value as Order['delivery_status'])}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Gateway Reference</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="Razorpay Payment ID / Transaction Ref"
                    value={editTransactionId}
                    onChange={(e) => setEditTransactionId(e.target.value)}
                  />
                  <small style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Payment method used: <strong>{selectedOrder.payment_method.toUpperCase()}</strong>
                  </small>
                </div>

                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn btn-primary"
                  style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}
                >
                  {saving ? 'Saving changes...' : 'Save Order Settings'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => printOrder(selectedOrder)} 
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1, 
                      height: '40px', 
                      backgroundColor: '#e2e8f0', 
                      color: '#4a5568',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0 0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    🖨️ Print
                  </button>
                  <button 
                    type="button" 
                    onClick={() => downloadOrder(selectedOrder)} 
                    className="btn btn-secondary"
                    style={{ 
                      flex: 1, 
                      height: '40px', 
                      backgroundColor: '#e2e8f0', 
                      color: '#4a5568',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0 0.5rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    📥 Download
                  </button>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn btn-secondary"
                  style={{ width: '100%', height: '40px' }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
