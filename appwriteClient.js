const { Client, Functions } = require("appwrite");
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const functions = new Functions(client);

const callFunction = async (functionId, payload) => {
    try {
        const response = await functions.createExecution(functionId, JSON.stringify(payload));
        return response;
    } catch (error) {
        console.error("Appwrite Execution Error:", error.message);
        throw error;
    }
};

module.exports = { callFunction };
