process.env.NODE_OPTIONS = '--no-experimental-fetch';
// server.js — Dhanti Masala Express API Backend
// Replaces FastAPI main.py with 1:1 endpoint parity

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { createClient } = require("@supabase/supabase-js");
const ws = require("ws");
const axios = require("axios");
const { sendOrderEmails } = require("./emailService");

// ─── Config ─────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dhantimasala.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const PORT = process.env.PORT || 8080;

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || "";
const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || "";
const BUNNY_STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || "storage.bunnycdn.com";
let BUNNY_PULL_ZONE_URL = process.env.BUNNY_PULL_ZONE_URL || "";
if (BUNNY_PULL_ZONE_URL && !BUNNY_PULL_ZONE_URL.startsWith("http://") && !BUNNY_PULL_ZONE_URL.startsWith("https://")) {
  BUNNY_PULL_ZONE_URL = `https://${BUNNY_PULL_ZONE_URL}`;
}

// Resolve UPLOAD_DIR relative to this file (mirrors config.py logic)
let UPLOAD_DIR = process.env.UPLOAD_DIR || "../public/uploads";
if (!path.isAbsolute(UPLOAD_DIR)) {
  UPLOAD_DIR = path.resolve(__dirname, UPLOAD_DIR);
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const origins =
  ALLOWED_ORIGINS.length > 0
    ? ALLOWED_ORIGINS
    : ["http://localhost:3000", "http://127.0.0.1:3000"];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_KEY must be set in backend/.env");
  process.exit(1);
}

// ─── Supabase Client ─────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  realtime: {
    transport: ws,
  },
});

// ─── App Setup ───────────────────────────────────────────────────────────────

const app = express();

app.use(
  cors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(express.json());

// Ensure upload directory exists and serve it statically
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

// ─── Multer (File Upload) ─────────────────────────────────────────────────────

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ─── Admin Auth Middleware ────────────────────────────────────────────────────

function requireAdmin(req, res, next) {
  if (req.cookies?.dhanti_admin_session !== "authenticated") {
    return res.status(401).json({ detail: "Unauthorized" });
  }
  next();
}

// Helper: shared cookie options (mirrors FastAPI cookie settings)
const isProd = process.env.NODE_ENV === "production";
const cookieOpts = {
  maxAge: 86400 * 1000, // 1 day in ms
  path: "/",
  httpOnly: true,
  sameSite: isProd ? "none" : "lax",
  secure: isProd,
};

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// POST /api/auth/login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    res.cookie("dhanti_admin_session", "authenticated", cookieOpts);
    return res.json({ success: true, message: "Logged in successfully" });
  }
  return res.status(401).json({ detail: "Invalid credentials" });
});

// POST /api/auth/logout
app.post("/api/auth/logout", (_req, res) => {
  res.cookie("dhanti_admin_session", "", { ...cookieOpts, maxAge: 0 });
  return res.json({ success: true, message: "Logged out successfully" });
});

// GET /api/auth/session
app.get("/api/auth/session", (req, res) => {
  const authenticated =
    req.cookies?.dhanti_admin_session === "authenticated";
  return res.json({ authenticated });
});

// ─── Categories Routes ────────────────────────────────────────────────────────

// GET /api/categories
app.get("/api/categories", async (_req, res) => {
  try {
    const catRes = await supabase.from("categories").select("*").order("name");
    const categories = catRes.data || [];

    const prodRes = await supabase.from("products").select("category_id");
    const products = prodRes.data || [];

    const countMap = {};
    for (const p of products) {
      if (p.category_id) {
        countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      }
    }

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat.id] || 0,
    }));

    return res.json({ success: true, categories: categoriesWithCount });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// POST /api/categories
app.post("/api/categories", requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, image_url } = req.body;
    const catData = { name, slug, description, image_url };
    const result = await supabase.from("categories").insert(catData).select();
    if (!result.data || result.data.length === 0) {
      return res.status(500).json({ detail: "Failed to create category" });
    }
    return res.json({ success: true, category: result.data[0] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// PUT /api/categories
app.put("/api/categories", requireAdmin, async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    // Remove undefined keys
    Object.keys(updates).forEach(
      (k) => updates[k] === undefined && delete updates[k]
    );
    const result = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select();
    if (!result.data || result.data.length === 0) {
      return res
        .status(404)
        .json({ detail: "Category not found or update failed" });
    }
    return res.json({ success: true, category: result.data[0] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// DELETE /api/categories?id=...
app.delete("/api/categories", requireAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    await supabase.from("categories").delete().eq("id", id);
    return res.json({ success: true, message: "Category deleted successfully" });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// ─── Products Routes ──────────────────────────────────────────────────────────

// GET /api/products  (optional query: ?slug=, ?id=, ?featured=true)
app.get("/api/products", async (req, res) => {
  try {
    const { slug, id, featured } = req.query;

    if (slug) {
      const result = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("slug", slug);
      if (!result.data || result.data.length === 0) {
        return res.status(404).json({ detail: "Product not found" });
      }
      return res.json({ success: true, product: result.data[0] });
    }

    if (id) {
      const result = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("id", id);
      if (!result.data || result.data.length === 0) {
        return res.status(404).json({ detail: "Product not found" });
      }
      return res.json({ success: true, product: result.data[0] });
    }

    let query = supabase
      .from("products")
      .select("*, categories(*)")
      .order("created_at", { ascending: false });

    if (featured === "true") {
      query = query.eq("featured", true);
    }

    const result = await query;
    return res.json({ success: true, products: result.data || [] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// POST /api/products
app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const prodData = req.body;
    const result = await supabase.from("products").insert(prodData).select();
    if (!result.data || result.data.length === 0) {
      return res.status(500).json({ detail: "Failed to create product" });
    }
    return res.json({ success: true, product: result.data[0] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// PUT /api/products
app.put("/api/products", requireAdmin, async (req, res) => {
  try {
    const { id, ...updates } = req.body;
    Object.keys(updates).forEach(
      (k) => updates[k] === undefined && delete updates[k]
    );
    const result = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select();
    if (!result.data || result.data.length === 0) {
      return res
        .status(404)
        .json({ detail: "Product not found or update failed" });
    }
    return res.json({ success: true, product: result.data[0] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// DELETE /api/products?id=...
app.delete("/api/products", requireAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    await supabase.from("products").delete().eq("id", id);
    return res.json({ success: true, message: "Product deleted successfully" });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// ─── CMS Routes ───────────────────────────────────────────────────────────────

// GET /api/cms  (optional ?key=)
app.get("/api/cms", async (req, res) => {
  try {
    const { key } = req.query;

    if (key) {
      const result = await supabase
        .from("cms_content")
        .select("*")
        .eq("key", key)
        .maybeSingle();
      const value = result.data ? result.data.value : null;
      return res.json({ success: true, key, value });
    }

    const result = await supabase.from("cms_content").select("*");
    const contentMap = {};
    for (const row of result.data || []) {
      contentMap[row.key] = row.value;
    }
    return res.json({ success: true, cms: contentMap });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// POST /api/cms
app.post("/api/cms", requireAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    const nowStr = new Date().toISOString();
    const result = await supabase
      .from("cms_content")
      .upsert({ key, value, updated_at: nowStr })
      .select();
    if (!result.data || result.data.length === 0) {
      return res.status(500).json({ detail: "Failed to update CMS content" });
    }
    return res.json({ success: true, cms: result.data[0] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// ─── Coupons Routes ───────────────────────────────────────────────────────────

// GET /api/coupons  (public with ?code=, admin list without code)
app.get("/api/coupons", async (req, res) => {
  try {
    const { code } = req.query;

    if (code) {
      const result = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .maybeSingle();
      const coupon = result.data;
      if (!coupon) {
        return res.status(404).json({ detail: "Invalid coupon code." });
      }

      // Check expiry
      if (coupon.expiry_date) {
        const expiry = new Date(coupon.expiry_date);
        if (expiry < new Date()) {
          return res.status(400).json({ detail: "Coupon code has expired." });
        }
      }

      // Check usage limit
      const limit = coupon.usage_limit;
      const count = coupon.usage_count || 0;
      if (limit !== null && limit !== undefined && count >= limit) {
        return res
          .status(400)
          .json({ detail: "Coupon code usage limit reached." });
      }

      return res.json({ success: true, coupon });
    }

    // Admin-only list
    if (req.cookies?.dhanti_admin_session !== "authenticated") {
      return res.status(401).json({ detail: "Unauthorized" });
    }

    const result = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    return res.json({ success: true, coupons: result.data || [] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// POST /api/coupons
app.post("/api/coupons", requireAdmin, async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      expiry_date,
      min_order_amount,
      usage_limit,
    } = req.body;

    const couponData = {
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      expiry_date: expiry_date || null,
      min_order_amount: min_order_amount || 0,
      usage_limit: usage_limit || null,
      usage_count: 0,
    };

    const result = await supabase.from("coupons").insert(couponData).select();
    if (!result.data || result.data.length === 0) {
      return res.status(500).json({ detail: "Failed to create coupon" });
    }
    return res.json({ success: true, coupon: result.data[0] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// DELETE /api/coupons?id=...
app.delete("/api/coupons", requireAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    await supabase.from("coupons").delete().eq("id", id);
    return res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// ─── Customers Routes ─────────────────────────────────────────────────────────

// GET /api/customers
app.get("/api/customers", requireAdmin, async (_req, res) => {
  try {
    const result = await supabase
      .from("customers")
      .select("*")
      .order("total_spent", { ascending: false });
    return res.json({ success: true, customers: result.data || [] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// ─── Queries Routes ───────────────────────────────────────────────────────────

// GET /api/queries (Admin only)
app.get("/api/queries", requireAdmin, async (_req, res) => {
  try {
    const result = await supabase
      .from("contact_queries")
      .select("*")
      .order("created_at", { ascending: false });
    return res.json({ success: true, queries: result.data || [] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// POST /api/queries (Public)
app.post("/api/queries", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    const { data, error } = await supabase
      .from("contact_queries")
      .insert({ name, email, phone: phone || null, message, status: "pending" })
      .select();
    
    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ success: false, message: `Database error: ${error.message}` });
    }
    
    if (!data || data.length === 0) {
      return res.status(500).json({ success: false, message: "Failed to submit query (no data returned)." });
    }
    return res.json({ success: true, query: data[0] });
  } catch (e) {
    console.error("Express insert catch error:", e);
    return res.status(500).json({ success: false, message: String(e.message || e) });
  }
});

// PUT /api/queries (Admin only - toggle resolved status)
app.put("/api/queries", requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ success: false, message: "Missing required parameters." });
    }
    const result = await supabase
      .from("contact_queries")
      .update({ status })
      .eq("id", id)
      .select();
    
    if (!result.data || result.data.length === 0) {
      return res.status(404).json({ success: false, message: "Query not found or update failed." });
    }
    return res.json({ success: true, query: result.data[0] });
  } catch (e) {
    return res.status(500).json({ success: false, message: String(e.message || e) });
  }
});

// DELETE /api/queries (Admin only - delete query)
app.delete("/api/queries", requireAdmin, async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing query ID." });
    }
    await supabase
      .from("contact_queries")
      .delete()
      .eq("id", id);
    return res.json({ success: true, message: "Query deleted successfully." });
  } catch (e) {
    return res.status(500).json({ success: false, message: String(e.message || e) });
  }
});

// ─── Orders Routes ────────────────────────────────────────────────────────────

// GET /api/orders
app.get("/api/orders", requireAdmin, async (_req, res) => {
  try {
    const result = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    return res.json({ success: true, orders: result.data || [] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// POST /api/orders  (public — place an order)
app.post("/api/orders", async (req, res) => {
  try {
    const order = req.body;

    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      pincode,
      city,
      state,
      items,
      subtotal,
      discount,
      total,
      payment_method,
      payment_status,
      transaction_id,
      coupon_code,
    } = order;

    if (
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !shipping_address ||
      !items ||
      !total
    ) {
      return res
        .status(400)
        .json({ detail: "Missing required checkout information." });
    }

    const orderData = {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      pincode,
      city,
      state,
      items,
      subtotal,
      discount: discount || 0,
      total,
      payment_method,
      payment_status: payment_status || "pending",
      delivery_status: "pending",
      transaction_id: transaction_id || null,
      coupon_code: coupon_code || null,
    };

    const orderRes = await supabase.from("orders").insert(orderData).select();
    if (!orderRes.data || orderRes.data.length === 0) {
      return res.status(500).json({ detail: "Order creation failed" });
    }
    const newOrder = orderRes.data[0];

    // Decrement stock quantities
    for (const item of items) {
      const prodRes = await supabase
        .from("products")
        .select("stock_quantities")
        .eq("id", item.productId);
      if (prodRes.data && prodRes.data.length > 0) {
        const product = prodRes.data[0];
        const stocks = product.stock_quantities || {};
        if (item.variant in stocks) {
          stocks[item.variant] = Math.max(0, stocks[item.variant] - item.qty);
          await supabase
            .from("products")
            .update({ stock_quantities: stocks })
            .eq("id", item.productId);
        }
      }
    }

    // Upsert customer record
    const nowIso = new Date().toISOString();
    const custRes = await supabase
      .from("customers")
      .select("*")
      .eq("email", customer_email)
      .maybeSingle();
    const existingCustomer = custRes.data;

    if (existingCustomer) {
      await supabase
        .from("customers")
        .update({
          name: customer_name,
          phone: customer_phone,
          total_orders: (existingCustomer.total_orders || 0) + 1,
          total_spent:
            parseFloat(existingCustomer.total_spent || 0) + parseFloat(total),
          last_order_date: nowIso,
        })
        .eq("id", existingCustomer.id);
    } else {
      await supabase.from("customers").insert({
        name: customer_name,
        email: customer_email,
        phone: customer_phone,
        total_orders: 1,
        total_spent: total,
        last_order_date: nowIso,
      });
    }

    // Increment coupon usage count
    if (coupon_code) {
      const couponRes = await supabase
        .from("coupons")
        .select("usage_count")
        .eq("code", coupon_code)
        .maybeSingle();
      const coupon = couponRes.data;
      if (coupon) {
        await supabase
          .from("coupons")
          .update({ usage_count: (coupon.usage_count || 0) + 1 })
          .eq("code", coupon_code);
      }
    }

    // Trigger order email notifications asynchronously
    sendOrderEmails(newOrder, supabase).catch((emailErr) => {
      console.error("Failed to send order emails asynchronously:", emailErr);
    });

    return res.json({ success: true, order: newOrder });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// PUT /api/orders
app.put("/api/orders", requireAdmin, async (req, res) => {
  try {
    const { id, payment_status, delivery_status, transaction_id } = req.body;
    const updates = {};
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (delivery_status !== undefined) updates.delivery_status = delivery_status;
    if (transaction_id !== undefined) updates.transaction_id = transaction_id;

    const result = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select();
    if (!result.data || result.data.length === 0) {
      return res
        .status(404)
        .json({ detail: "Order not found or update failed" });
    }
    return res.json({ success: true, order: result.data[0] });
  } catch (e) {
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// ─── Razorpay Routes ──────────────────────────────────────────────────────────

// POST /api/razorpay/create-order
app.post("/api/razorpay/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({ success: false, message: "Razorpay keys are not configured" });
    }

    const amountInPaise = Math.round(parseFloat(amount) * 100);
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    
    let rpRes;
    try {
      rpRes = await axios.post(
        "https://api.razorpay.com/v1/orders",
        { amount: amountInPaise, currency: "INR", receipt },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
        }
      );
    } catch (apiErr) {
      console.error("Razorpay order creation error:", apiErr.response?.data || apiErr.message);
      const desc = apiErr.response?.data?.error?.description || apiErr.message || "Failed to create Razorpay order";
      return res.status(apiErr.response?.status || 500).json({
        success: false,
        message: desc,
      });
    }

    const data = rpRes.data;
    return res.json({ success: true, orderId: data.id, amount: data.amount, currency: data.currency });
  } catch (e) {
    return res.status(500).json({ success: false, message: String(e.message || e) });
  }
});

// ─── File Upload Route ────────────────────────────────────────────────────────

// POST /api/upload
app.post("/api/upload", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No file selected" });
    }

    const ext = path.extname(req.file.originalname);
    const filename = `${uuidv4().replace(/-/g, "")}_${Date.now()}${ext}`;

    if (BUNNY_STORAGE_ZONE && BUNNY_STORAGE_API_KEY) {
      // Upload to Bunny Storage
      const uploadUrl = `https://${BUNNY_STORAGE_REGION}/${BUNNY_STORAGE_ZONE}/${filename}`;
      
      await axios.put(uploadUrl, req.file.buffer, {
        headers: {
          AccessKey: BUNNY_STORAGE_API_KEY,
          "Content-Type": req.file.mimetype || "application/octet-stream",
        },
      });

      const urlPath = `${BUNNY_PULL_ZONE_URL}/${filename}`;
      return res.json({ success: true, url: urlPath });
    } else {
      // Fallback: Write file to local disk
      const localPath = path.join(UPLOAD_DIR, filename);
      await fs.promises.writeFile(localPath, req.file.buffer);
      const urlPath = `/uploads/${filename}`;
      return res.json({ success: true, url: urlPath });
    }
  } catch (e) {
    console.error("Upload error:", e);
    return res.status(500).json({ detail: String(e.message || e) });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
