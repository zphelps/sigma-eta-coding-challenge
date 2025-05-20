import { Transporter } from "nodemailer";

interface SendEmailParams {
    from: string;
    to: string;
    subject: string;
    message: string;
}

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