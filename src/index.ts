import express from "express";
import { startClinicianPolling } from "./handlers/cron/clinicianStatus";

const app = express();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
    startClinicianPolling();
});