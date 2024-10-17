#!/bin/bash
set -e

# Ensure that the required environment variables are set
if [[ -z "$DB_USER" || -z "$DB_PASSWORD" || -z "$DB_DATABASE" ]]; then
  echo "Error: One or more required environment variables are missing."
  exit 1
fi

# Set up the database user and database
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $DB_DATABASE OWNER $DB_USER;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE TO $DB_USER;"

echo "Database setup successfully."
