import { DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { config } from "../config";

type AlertType = "out-of-zone" | "api-error";

interface Alert {
    clinicianId: number;
    type: AlertType;
    message: string;
    createdAt: Date;
}

/**
 * This service is used to store and retrieve alerts about clinicians.
 * 
 * Importantly, there can only be one alert per clinician. If an alert already exists for a clinician, it will be updated.
 * 
 * @returns An instance of the AlertService class.
 */
class AlertService {
    private dynamodb: DynamoDBClient;

    constructor() {
        this.dynamodb = new DynamoDBClient({
            endpoint: config.DB_ENDPOINT_URL,
        });
    }

    async addAlert(alert: Alert) {
        const command = new PutItemCommand({
            TableName: "clinician_alerts",
            Item: {
                clinicianId: { N: alert.clinicianId.toString() },
                type: { S: alert.type },
            },
        });
        await this.dynamodb.send(command);
    }

    async deleteAlert(clinicianId: number) {
        const command = new DeleteItemCommand({
            TableName: "clinician_alerts",
            Key: {
                clinicianId: { N: clinicianId.toString() },
            },
        });
        await this.dynamodb.send(command);
    }

    async getAlertForClinician(clinicianId: number) {
        const command = new GetItemCommand({
            TableName: "clinician_alerts",
            Key: {
                clinicianId: { N: clinicianId.toString() },
            },
        });
        const response = await this.dynamodb.send(command);

        if (!response.Item) {
            return null;
        }

        return {
            clinicianId: Number(response.Item?.clinicianId?.N),
            type: response.Item?.type?.S as AlertType,
            message: response.Item?.message?.S,
            createdAt: new Date(Number(response.Item?.createdAt?.N)),
        };
    }

}

export { AlertService, Alert };