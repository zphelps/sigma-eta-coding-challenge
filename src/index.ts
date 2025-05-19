import cron from "node-cron";
import express from "express";

const app = express();

const checkStatus = async () => {
    console.log("Checking status");
}

// Cron job which runs on every 10 seconds
cron.schedule("*/10 * * * * *", function () {
    checkStatus();
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});