#!/bin/bash
set -e

# Retrieve secret values from AWS Secrets Manager
DB_HOST=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-host" --region us-east-1 --query SecretString --output text | jq -r .DB_HOST)
DB_PORT=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-port" --region us-east-1 --query SecretString --output text | jq -r .DB_PORT)
PORT=$(aws secretsmanager get-secret-value --secret-id "alias/app-port" --region us-east-1 --query SecretString --output text | jq -r .PORT)
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-password" --region us-east-1 --query SecretString --output text | jq -r .DB_PASSWORD)
DB_USER=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-user" --region us-east-1 --query SecretString --output text | jq -r .DB_USER)
DB_DATABASE=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-database" --region us-east-1 --query SecretString --output text | jq -r .DB_DATABASE)

# Ensure that the secrets are not empty
if [[ -z "$DB_USER" || -z "$DB_PASSWORD" || -z "$DB_DATABASE" ]]; then
  echo "Error: One or more required secrets are missing."
  exit 1
fi

# Export environment variables for use in other scripts
export DB_HOST
export DB_PORT
export PORT
export DB_PASSWORD
export DB_USER
export DB_DATABASE

echo "Secrets retrieved and environment variables set successfully."