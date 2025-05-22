import cron from "node-cron";
import { ClinicianService } from "../../services/clinicianService";
import { Alert, AlertService } from "../../services/alertService";
import { EmailService } from "../../services/emailService";
import { createTransport } from "nodemailer";
import { config } from "../../config";

const emailService = new EmailService(createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD,
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
            await emailService.send({
                from: config.EMAIL_USER,
                to: config.EMAIL_USER,
                subject: `Error fetching clinician status for clinician ${clinician.id}`,
                message: `The following error occurred while fetching the status for clinician #${clinician.id}: \n\n"${status.error}" \n\n We will continue to poll for updates.`
            });

            return;
        }

        switch (status.status) {
            case "out-of-zone":
                if (!existingAlert) {
                    console.log(`Clinician ${clinician.id} is out of zone`);
                    const alert: Alert = {
                        clinicianId: clinician.id,
                        type: "out-of-zone",
                        message: `Clinician #${clinician.id} is out of zone`,
                        createdAt: new Date()
                    }
                    await alertService.addAlert(alert);
                    await emailService.send({
                        from: config.EMAIL_USER,
                        to: config.EMAIL_USER,
                        subject: `Clinician #${clinician.id} is out of zone`,
                        message: `Clinician #${clinician.id} is currently out of the safety zone. Please check in on them. Another alert will be sent if/when they return to the safety zone.`
                    });
                }

                break;
            case "in-zone":
                if (existingAlert) {
                    console.log(`Clinician ${clinician.id} has returned to zone`);
                    await alertService.deleteAlert(clinician.id);
                    await emailService.send({
                        from: config.EMAIL_USER,
                        to: config.EMAIL_USER,
                        subject: `Clinician #${clinician.id} is in the safety zone`,
                        message: `A previous alert indicated that ${existingAlert.type === "out-of-zone" ? `Clinician #${clinician.id} was out of their safety zone` : `an error occured while trying to poll Clinician #${clinician.id}'s status`}. They are back in the safety zone.`
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