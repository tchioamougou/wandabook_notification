const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const { callFunction } = require("./appwriteClient");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
// ✅ Support application/json
app.use(express.json());
// Middleware

const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
  port: 465, // port SSL
  secure: true, // SSL direct
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res) => res.send("Express on Vercel"));

app.post("/notification", async (req, res) => {
  const { cpm_trans_id, cpm_site_id } = req.body;
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
  const { cpm_trans_id, cpm_site_id } = req.body;
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

// Transporter configuré pour Outlook

// Route POST pour envoyer un e-mail
app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;
  const from = process.env.EMAIL_ADDRESS; // Adresse e-mail de l'expéditeur
  // Vérifie que tous les champs sont présents
  if (!from || !to || !subject || !text) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  const mailOptions = {
    from,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email envoyé", info: info.response });
  } catch (error) {
    console.error("Erreur envoi email:", error);
    res.status(500).json({ error: "Échec de l'envoi" });
  }
});

// Export Express app as serverless function
module.exports = app;
module.exports.handler = serverless(app);
