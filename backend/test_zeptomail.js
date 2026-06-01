const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const token = process.env.ZEPTOMAIL_TOKEN;
const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS || "noreply@dhantifoods.com";
const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Dhanti Masala";

const payload = {
  from: {
    address: fromAddress,
    name: fromName
  },
  to: [
    {
      email_address: {
        address: "abhinabajana900@gmail.com",
        name: "Abhinaba Jana"
      }
    }
  ],
  subject: "Dhanti Masala - ZeptoMail Test Connection",
  htmlbody: "<h3>Hello!</h3><p>If you are reading this email, your ZeptoMail configuration is working perfectly.</p>"
};

const url = "https://api.zeptomail.in/v1.1/email";
const headers = {
  "Content-Type": "application/json",
  Authorization: token
};

async function testMail() {
  console.log("Sending test email via ZeptoMail...");
  console.log("Token Prefix:", token ? token.substring(0, 15) + "..." : "undefined");
  console.log("From Address:", fromAddress);
  console.log("From Name:", fromName);
  
  if (!token) {
    console.error("Error: ZEPTOMAIL_TOKEN is not defined in backend/.env");
    process.exit(1);
  }

  try {
    const res = await axios.post(url, payload, { headers });
    console.log("\n--- SUCCESS! ---");
    console.log("Response data:", JSON.stringify(res.data, null, 2));
    process.exit(0);
  } catch (err) {
    console.log("\n--- FAILED! ---");
    if (err.response) {
      console.error("HTTP Status Code:", err.response.status);
      console.error("Response data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error Message:", err.message);
    }
    process.exit(1);
  }
}

testMail();
