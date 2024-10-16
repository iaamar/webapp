#!/bin/bash


sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD $DB_PASSWORD
sudo -u postgres psql -c \"CREATE DATABASE $DB_DATABASE OWNER $DB_USER
sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE TO $DB_USER

echo "Database setup successfully."