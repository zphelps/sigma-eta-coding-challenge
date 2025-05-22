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