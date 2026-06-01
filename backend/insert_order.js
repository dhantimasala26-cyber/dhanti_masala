const { createClient } = require("@supabase/supabase-js");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in environment");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dummyOrder = {
  customer_name: "Abhinaba Jana (Test)",
  customer_email: "abhinabajana900@gmail.com",
  customer_phone: "9831206232",
  shipping_address: "NO 28, 1ST FLOOR, 8TH CROSS, GANAPATHY NAGAR, PEENYA",
  pincode: "560058",
  city: "Bangalore",
  state: "Karnataka",
  items: [
    {
      productId: "a1111111-1111-1111-1111-111111111111",
      name: "Traditional Rasam Powder",
      variant: "250g",
      qty: 1,
      price: 150,
      image: "/rasam_powder.jpg"
    }
  ],
  subtotal: 150.00,
  discount: 0.00,
  total: 150.00,
  payment_method: "cod",
  payment_status: "pending",
  delivery_status: "pending",
  transaction_id: null,
  coupon_code: null
};

async function insertDummyOrder() {
  console.log("Inserting dummy order into Supabase...");
  const { data, error } = await supabase
    .from("orders")
    .insert(dummyOrder)
    .select();

  if (error) {
    console.error("Error inserting order:", error.message);
    process.exit(1);
  }

  console.log("Success! Dummy order inserted:");
  console.log(JSON.stringify(data[0], null, 2));
  process.exit(0);
}

insertDummyOrder();
