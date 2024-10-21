#!/bin/bash
set -e

# Try to retrieve secret values from AWS Secrets Manager, and fall back to hardcoded values if they are not retrieved.
DB_HOST=$(aws secretsmanager get-secret-value --secret-id my-db-host --query 'SecretString' --output text || echo "localhost")
DB_PORT=$(aws secretsmanager get-secret-value --secret-id my-db-port --query 'SecretString' --output text || echo "5432")
PORT=$(aws secretsmanager get-secret-value --secret-id app-port --query 'SecretString' --output text || echo "9001")
DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id my-db-password --query 'SecretString' --output text || echo "user1234")
DB_USER=$(aws secretsmanager get-secret-value --secret-id my-db-user --query 'SecretString' --output text || echo "amarnagargoje")
DB_DATABASE=$(aws secretsmanager get-secret-value --secret-id my-db-database --query 'SecretString' --output text || echo "healthcare")

# Export environment variables for use in other scripts
export DB_HOST
export DB_PORT
export PORT
export DB_PASSWORD
export DB_USER
export DB_DATABASE

echo "Secrets retrieved and environment variables set successfully or hardcoded defaults are being used."

# Set up the database using the environment variables
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD $DB_PASSWORD;"
sudo -u postgres psql -c "CREATE DATABASE $DB_DATABASE OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE TO $DB_USER;"
sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"

echo "Database setup successfully."
