const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const { callFunction } = require("./appwriteClient");

require("dotenv").config();

const app = express();
// ✅ Support application/json
app.use(express.json());
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res) => res.send("Express on Vercel"));

app.post("/notification", async (req, res) => {
  const {
    cpm_trans_id,
    cpm_site_id, 
  } = req.body;
  const payload = { 
      cpm_trans_id,
      cpm_site_id,
  };

  try {
    const response = await callFunction(
      process.env.APPWRITE_FUNCTION_NOTIFY_ID,
      payload,
      "paymentnotification"
    );
    res.status(200).json({ success: true, appwriteResponse: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/paymentcancel", async (req, res) => {
   const {
    cpm_trans_id,
    cpm_site_id, 
  } = req.body;
  const payload = { 
      cpm_trans_id,
      cpm_site_id,
  };
  try {
    const response = await callFunction(
      process.env.APPWRITE_FUNCTION_CANCEL_ID,
      payload,
      "paymentcancel"
    );
    res.status(200).json({ success: true, appwriteResponse: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export Express app as serverless function
module.exports = app;
module.exports.handler = serverless(app);
