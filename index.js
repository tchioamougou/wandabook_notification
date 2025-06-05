const express = require("express");
const bodyParser = require("body-parser");
const { callFunction } = require("./appwriteClient");
require("dotenv").config();

const app = express();

// Utilisation de urlencoded pour les requêtes CinetPay
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware pour lire l'en-tête x-token
app.use((req, res, next) => {
    req.token = req.headers['x-token'] || null;
    next();
});

app.post("/notification", async (req, res) => {
    const {
        cpm_trans_id,
        cpm_site_id,
        cpm_trans_date,
        cpm_amount,
        cpm_currency,
        payment_method,
        cel_phone_num,
        cpm_phone_prefixe,
        cpm_language,
        cpm_version,
        cpm_payment_config,
        cpm_page_action,
        cpm_custom,
        cpm_designation,
        cpm_error_message,
        signature
    } = req.body;

    const token = req.token;

    // Construction de la charge utile pour Appwrite
    const payload = {
        token,
        cpm_trans_id,
        cpm_site_id,
        cpm_trans_date,
        cpm_amount,
        cpm_currency,
        payment_method,
        cel_phone_num,
        cpm_phone_prefixe,
        cpm_language,
        cpm_version,
        cpm_payment_config,
        cpm_page_action,
        cpm_custom,
        cpm_designation,
        cpm_error_message,
        signature
    };

    try {
        const response = await callFunction(process.env.APPWRITE_FUNCTION_NOTIFY_ID, payload);
        res.status(200).json({ success: true, appwriteResponse: response });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post("/cancel", async (req, res) => {
    const payload = { ...req.body, token: req.token };
    try {
        const response = await callFunction(process.env.APPWRITE_FUNCTION_CANCEL_ID, payload);
        res.status(200).json({ success: true, appwriteResponse: response });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
