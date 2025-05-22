import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
    ALERT_SENDER_EMAIL: z.string().email('Invalid email format'),
    ALERT_SENDER_EMAIL_PASSWORD: z.string().min(1, 'Email password is required'),
    ALERT_RECIPIENT_EMAIL: z.string().email('Invalid email format'),
    BASE_URL: z.string().url('Invalid base URL format'),
    DB_ENDPOINT_URL: z.string().url('Invalid DynamoDB endpoint format'),
    POLLING_INTERVAL_SECONDS: z.string().transform(val => parseInt(val)).pipe(z.number().min(1, 'Polling interval must be greater than 0').default(5)),
});

const { data, error } = configSchema.safeParse(process.env);

if (error) {
    throw new Error(`Invalid environment variables: ${error.message}`);
}

export const config = data as NonNullable<typeof data>;