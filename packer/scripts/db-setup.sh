#!/bin/bash
set -e


# Set up the database user and database
sudo -u postgres psql -c "CREATE USER amarnagargoje WITH PASSWORD 'user1234';"
sudo -u postgres psql -c "CREATE DATABASE healthcare OWNER amarnagargoje;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE healthcare TO amarnagargoje;"

echo "Database setup successfully."
