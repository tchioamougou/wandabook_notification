const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");
const { callFunction } = require("./appwriteClient");
const nodemailer = require("nodemailer");
require("dotenv").config();
const app = express();
app.use(express.json());

var transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: process.env.EMAIL_TOKEN, // Utilisez le token d'API pour l'authentification
  },
});

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
// Preflight handler for /send-email
app.options('/send-email', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});
// Route POST pour envoyer un e-mail
app.post("/send-email", async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // or specific origin
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  const { to, subject, text } = req.body;
  const from = process.env.EMAIL_ADDRESS; // Adresse e-mail de l'expéditeur
  // Vérifie que tous les champs sont présents
  if (!from || !to || !subject || !text) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  const sender = {
    address: "hello@wandabook.com",
    name: "Wandabook Support",
  };
  const mailOptions = {
    from: sender,
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
