const axios = require("axios");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Allow overriding the URL via command line (e.g., node test_deployed_email.js https://deployed-url.com)
const BASE_URL = process.argv[2] || "http://localhost:8000";
const loginUrl = `${BASE_URL}/api/auth/login`;
const emailUrl = `${BASE_URL}/api/admin/send-email`;

// Try different credential options
const credentialSets = [
  { email: "admin@dhantimasala.com", password: "yoOd3)^KUN6D?wOH" },
  { email: process.env.ADMIN_EMAIL || "admin@dhantimasala.com", password: process.env.ADMIN_PASSWORD || "admin123" },
  { email: "admin@dhantifoods.com", password: "admin123" }
];

const targetEmail = "abhinabajana900@gmail.com";

async function runTest() {
  console.log(`Using base URL: ${BASE_URL}`);

  let sessionCookie = null;
  let loggedInUser = null;

  for (const creds of credentialSets) {
    console.log(`Attempting to log in as ${creds.email}...`);
    try {
      const loginRes = await axios.post(loginUrl, {
        email: creds.email,
        password: creds.password
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("Login response:", loginRes.data);

      const setCookieHeaders = loginRes.headers["set-cookie"];
      if (setCookieHeaders && setCookieHeaders.length > 0) {
        sessionCookie = setCookieHeaders[0].split(";")[0];
        loggedInUser = creds.email;
        console.log(`Successfully authenticated as ${creds.email}!`);
        break;
      }
    } catch (err) {
      console.log(`Failed for ${creds.email}: ${err.response ? err.response.data.detail : err.message}`);
    }
  }

  if (!sessionCookie) {
    console.error("Could not authenticate with any credential set.");
    process.exit(1);
  }

  try {
    // 2. Send test email
    console.log(`Sending test email to ${targetEmail}...`);
    const emailRes = await axios.post(emailUrl, {
      email: targetEmail,
      subject: "Test Deployed Email Endpoint",
      message: "Hello! This is a test email sent from the deployed Node.js backend API server to verify that the email endpoint and ZeptoMail integration work correctly on Google Cloud Run.",
      template_type: "support"
    }, {
      headers: {
        "Content-Type": "application/json",
        "Cookie": sessionCookie
      }
    });

    console.log("\n--- SUCCESS! ---");
    console.log("Response status:", emailRes.status);
    console.log("Response data:", JSON.stringify(emailRes.data, null, 2));

  } catch (err) {
    console.log("\n--- FAILED! ---");
    if (err.response) {
      console.error("HTTP Status Code:", err.response.status);
      console.error("Response headers:", JSON.stringify(err.response.headers, null, 2));
      console.error("Response data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error Message:", err.message);
    }
    process.exit(1);
  }
}

runTest();
