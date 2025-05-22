# Clinician Safety Zone Monitoring Service

This service is used to monitor the safety zone of clinicians. It is used to send alerts when a clinician is out of their safety zone.

## Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root of the project and add the following variables:

```bash
BASE_URL= # Clinician Status API Endpoint Base URL
ALERT_SENDER_EMAIL= # Email from which to send alerts
ALERT_SENDER_EMAIL_PASSWORD= # Password for eamil from which to send alerts
ALERT_RECIPIENT_EMAIL= # Email to which to send alerts
DB_ENDPOINT_URL= # Endpoint URL for local DynamoDB instance
POLLING_INTERVAL_SECONDS= # Interval at which to poll clinicians' status (Default: 5 seconds)
```


### Run the service
The following command will begin running the service.

```bash
npm run dev
```

# DynamoDB

## Setup

### Install DynamoDB Local

Visit the [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) documentation to download the latest version of DynamoDB locally.

### Run DynamoDB Local
By default, DynamoDB Local will run on port 8000. This can be adjusted if 8000 is already in use for some reason.

```bash
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

## Useful Commands

### Create DynamoDB Table

```bash
aws dynamodb create-table \
  --table-name clinician_alerts \
  --attribute-definitions \
        AttributeName=clinicianId,AttributeType=N \
  --key-schema \
        AttributeName=clinicianId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000
```

### List Tables

```bash
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

### Erase Table

```bash
aws dynamodb delete-table --table-name clinician_alerts --endpoint-url http://localhost:8000
```

# Sending Emails
The email service uses `nodemailer` to send emails. You will need to provide the username and password for the email account from which to send alerts. If you are using Gmail, I recommend using an [App Password](https://support.google.com/accounts/answer/185833?hl=en).

