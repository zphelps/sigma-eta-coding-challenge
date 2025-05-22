import { Transporter } from "nodemailer";

interface SendEmailParams {
    from: string;
    to: string;
    subject: string;
    message: string;
}

/**
 * This service is used to send emails. It is used to send alerts to the user when a clinician is out of their safety zone.
 * 
 * It uses `nodemailer` to send emails. NOTE: I wouldn't recommend using this service for production. However, it is useful for local development.
 * This service is designed to be easily extensible to support other email services such as Amazon SES, SendGrid, Mailgun, etc. 
 * 
 * I stuck with `nodemailer` for it's simplicity given the narrow scope of this assessment.
 * 
 * @param transport - The transport to use to send emails.
 * @returns An instance of the EmailService class.
 */
class EmailService {
    private transport: Transporter;

    constructor(transport: Transporter) {
        this.transport = transport;
    }

    async send(params: SendEmailParams) {
        console.log(`Sending email to ${params.to}: ${params.subject}`);
        await this.transport.sendMail({
            from: params.from,
            to: params.to,
            subject: params.subject,
            text: params.message,
        });
    }
}

export { EmailService };