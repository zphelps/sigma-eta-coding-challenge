import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
    EMAIL_USER: z.string().email('Invalid email format'),
    EMAIL_PASSWORD: z.string().min(1, 'Email password is required'),
    BASE_URL: z.string().url('Invalid base URL format'),
    DB_ENDPOINT_URL: z.string().url('Invalid DynamoDB endpoint format'),
});

const { data, error } = configSchema.safeParse(process.env);

if (error) {
    throw new Error(`Invalid environment variables: ${error.message}`);
}

export const config = data as NonNullable<typeof data>;