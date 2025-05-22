import cron from "node-cron";
import { ClinicianService } from "../../services/clinicianService";
import { Alert, AlertService } from "../../services/alertService";
import { EmailService } from "../../services/emailService";
import { createTransport } from "nodemailer";
import { config } from "../../config";

const emailService = new EmailService(createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: config.ALERT_SENDER_EMAIL,
        pass: config.ALERT_SENDER_EMAIL_PASSWORD,
    },
}));

const clinicianService = new ClinicianService();
const alertService = new AlertService();

const pollClinicians = async () => {
    console.log("Polling clinicians...");
    const clinicians = await clinicianService.getClinicians();

    await Promise.all(clinicians.map(async (clinician) => {
        const status = await clinicianService.getClinicianStatus(clinician.id);
        const existingAlert = await alertService.getAlertForClinician(clinician.id);

        if (status.error) {
            console.error(`Error fetching clinician status for clinician ${clinician.id}: ${status.error}`);

            const alert: Alert = {
                clinicianId: clinician.id,
                type: "api-error",
                message: status.error,
                createdAt: new Date()
            }

            await alertService.addAlert(alert);

            if (existingAlert && existingAlert.type === "api-error") {
                console.log(`Skipping email for clinician ${clinician.id} because an API error alert email has already been sent. We will continue to poll for updates.`);
                return;
            }

            await emailService.send({
                from: config.ALERT_SENDER_EMAIL,
                to: config.ALERT_RECIPIENT_EMAIL,
                subject: `Error fetching clinician status for clinician ${clinician.id}`,
                message: `The following error occurred while fetching the status for clinician #${clinician.id}: \n\n"${status.error}" \n\n We will continue to poll for updates.`
            });

            return;
        }

        switch (status.status) {
            case "out-of-zone":
                const alert: Alert = {
                    clinicianId: clinician.id,
                    type: "out-of-zone",
                    message: `Clinician #${clinician.id} is out of zone`,
                    createdAt: new Date()
                }
                await alertService.addAlert(alert);

                if (existingAlert && existingAlert.type === "out-of-zone") {
                    console.log(`Skipping email for clinician ${clinician.id} because an out of zone alert email has already been sent. We will continue to poll for updates.`);
                    return;
                }
                else if (existingAlert && existingAlert.type === "api-error") {
                    console.log(`We now have an update on clinician ${clinician.id}, and they are out of zone.`);
                    await emailService.send({
                        from: config.ALERT_SENDER_EMAIL,
                        to: config.ALERT_RECIPIENT_EMAIL,
                        subject: `Clinician #${clinician.id} is out of zone`,
                        message: `A previous alert indicated that an error occured while trying to poll Clinician #${clinician.id}'s status, but we now have an update on their status. They are out of their safety zone. Please check in on them. Another alert will be sent if/when they return to their safety zone.`
                    });
                    return;
                } else if (!existingAlert) {
                    console.log(`URGENT: Clinician ${clinician.id} is out of their safety zone.`);
                    await emailService.send({
                        from: config.ALERT_SENDER_EMAIL,
                        to: config.ALERT_RECIPIENT_EMAIL,
                        subject: `Clinician #${clinician.id} is out of zone`,
                        message: `Clinician #${clinician.id} is currently out of the safety zone. Please check in on them. Another alert will be sent if/when they return to their safety zone.`
                    });
                }

                break;
            case "in-zone":
                if (existingAlert && existingAlert.type === "out-of-zone") {
                    console.log(`Clinician ${clinician.id} is back in their safety zone.`);
                    await alertService.deleteAlert(clinician.id);
                    await emailService.send({
                        from: config.ALERT_SENDER_EMAIL,
                        to: config.ALERT_RECIPIENT_EMAIL,
                        subject: `Good news! Clinician #${clinician.id} is back in their safety zone.`,
                        message: `A previous alert indicated that Clinician #${clinician.id} was out of their safety zone, but they are now back in their safety zone.`
                    });
                } else if (existingAlert && existingAlert.type === "api-error") {
                    console.log(`We now have an update on clinician ${clinician.id}, and they are in the safety zone.`);
                    await alertService.deleteAlert(clinician.id);
                    await emailService.send({
                        from: config.ALERT_SENDER_EMAIL,
                        to: config.ALERT_RECIPIENT_EMAIL,
                        subject: `Good news! Clinician #${clinician.id} is back in their safety zone.`,
                        message: `A previous alert indicated that an error occured while trying to poll Clinician #${clinician.id}'s status, but we now have an update on their status. They are in their safety zone.`
                    });
                }

                break;
        }

    }));
}

const startClinicianPolling = async (interval_seconds: number = 5) => {
    console.log(`Starting clinician polling with interval of ${interval_seconds} seconds`);
    cron.schedule(`*/${interval_seconds} * * * * *`, pollClinicians);
}

export { startClinicianPolling };