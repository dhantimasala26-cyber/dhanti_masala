# Dhanti Masala eCommerce

An elegant, modern Next.js eCommerce application powered by a Python FastAPI backend and Supabase database.

## Architecture

- **Frontend (Next.js)**: Runs on port `3000`. Serves the customer-facing store and admin management dashboards.
- **Backend (FastAPI)**: Runs on port `8000`. Handles API services (Authentication, Categories, Products, Checkout, CMS, Coupons, Customers, and Orders).
- **Database (Supabase)**: Holds structured data tables under Row-Level Security (RLS).
- **Asset Storage (Local)**: Uploaded images are stored securely in `public/uploads` and served dynamically.

---

## Getting Started

### 1. Database Setup & RLS Policies
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run the full database schema setup located in [schema.sql](file:///d:/thardeye_projects/Dhanti%20Masala/schema.sql).
   - This sets up the tables (`categories`, `products`, `orders`, `customers`, `coupons`, `cms_content`).
   - It automatically enables Row-Level Security (RLS) and sets public `SELECT` policies to allow storefront reading.

### 2. Environment Configuration

#### Frontend (`.env.local`)
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
SUPABASE_URL=https://your-supabase-project.supabase.co
# CRITICAL: You MUST use the "service_role" secret key here so the backend
# can bypass RLS policies and successfully insert/update records.
SUPABASE_KEY=your-secret-service-role-key
ADMIN_EMAIL=admin@dhantifoods.com
ADMIN_PASSWORD=admin123
UPLOAD_DIR=../public/uploads
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Running Locally
Simply double-click or run the concurrent launcher script in your terminal from the root folder:
```bash
start.bat
```
This launcher will:
1. Ensure the `public/uploads/` directory exists.
2. Spin up the FastAPI backend on `http://127.0.0.1:8000` via `python -m uvicorn`.
3. Spin up the Next.js dev server on `http://localhost:3000`.
4. Keep logs fully visible in both windows for easy debugging.

---

## Row-Level Security (RLS) Troubleshooting

If you see the error:
`new row violates row-level security policy for table "categories"` (or any other table name)

It means:
1. **Wrong Key in Backend**: Your `backend/.env` is configured with the `anon` (publishable) key instead of the `service_role` key. Replace `SUPABASE_KEY` with the `service_role` key from your Supabase Dashboard -> Settings -> API -> `service_role` (secret).
2. **Missing SELECT Policies**: If your storefront cannot load products or categories, execute the RLS policies section at the bottom of [schema.sql](file:///d:/thardeye_projects/Dhanti%20Masala/schema.sql) in your Supabase SQL Editor.
