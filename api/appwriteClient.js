const { Client, Functions, ExecutionMethod } = require("node-appwrite");
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)

const functions = new Functions(client);

const callFunction = async (functionId, payload,  path) => {
    try {
        const response = await functions.createExecution(
            functionId, // functionId
            JSON.stringify(payload), // body (optional)
            false, // async (optional)
            path, // path (optional)
            ExecutionMethod.POST, // method (optional)
            {
                 duration: 60
            }, // headers (optional)

     );
        return response;
    } catch (error) {
        console.error("Appwrite Execution Error:", error.message);
        throw error;
    }
};

module.exports = { callFunction };
