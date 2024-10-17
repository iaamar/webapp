#!/bin/bash
set -e


# Set up the database user and database
sudo -u postgres psql -c "CREATE USER amarnagargoje WITH PASSWORD 'user1234';"
sudo -u postgres psql -c "CREATE DATABASE healthcare OWNER amarnagargoje;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE healthcare TO amarnagargoje;"

sudo -u postgres psql -c "DROP DATABASE IF EXISTS ${process.env.DB_DATABASE};"
sudo -u postgres psql -c "DROP ROLE IF EXISTS ${process.env.DB_USER};"
sudo -u postgres psql -c "CREATE ROLE ${process.env.DB_USER} WITH LOGIN PASSWORD '${process.env.DB_PASSWORD}';"
sudo -u postgres psql -c "CREATE DATABASE ${process.env.DB_DATABASE};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${process.env.DB_DATABASE} TO ${process.env.DB_USER};"
sudo -u postgres psql -c "ALTER ROLE ${process.env.DB_USER} WITH SUPERUSER;"

echo "Database setup successfully."
