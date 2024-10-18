#!/bin/bash



# Retrieve secret value from Secrets Manager
DB_HOST=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-host" --region us-east-1 --query SecretString)
DB_PORT=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-port" --region us-east-1 --query SecretString)
PORT=$(aws secretsmanager get-secret-value --secret-id "alias/app-port" --region us-east-1 --query SecretString)
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-password" --region us-east-1 --query SecretString)
DB_USER=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-user" --region us-east-1 --query SecretString)
DB_DATABASE=$(aws secretsmanager get-secret-value --secret-id "alias/my-db-database" --region us-east-1 --query SecretString)

echo $DB_HOST
echo $DB_PORT
echo $PORT
echo $DB_PASSWORD
echo $DB_USER
echo $DB_DATABASE

# Set environment variable
export DB_HOST=$DB_HOST
export DB_PORT=$DB_PORT
export PORT=$PORT
export DB_PASSWORD=$DB_PASSWORD
export DB_USER=$DB_USER
export DB_DATABASE=$DB_DATABASE

echo "Secrets retrieved successfully."