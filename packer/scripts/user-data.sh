#!/bin/bash
set -e

# Retrieve secret values from AWS Secrets Manager
DB_HOST=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-host" --region us-east-1 --query SecretString --output text | jq -r .DB_HOST)
DB_PORT=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-port" --region us-east-1 --query SecretString --output text | jq -r .DB_PORT)
PORT=$(aws secretsmanager get-secret-value --secret-id "alias/app-port" --region us-east-1 --query SecretString --output text | jq -r .PORT)
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-password" --region us-east-1 --query SecretString --output text | jq -r .DB_PASSWORD)
DB_USER=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-user" --region us-east-1 --query SecretString --output text | jq -r .DB_USER)
DB_DATABASE=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-database" --region us-east-1 --query SecretString --output text | jq -r .DB_DATABASE)

# Export environment variables for use in other scripts
export process.env.DB_HOST
export process.env.DB_PORT
export process.env.PORT
export process.env.DB_PASSWORD
export process.env.DB_USER
export process.env.DB_DATABASE

echo "Secrets retrieved and environment variables set successfully."