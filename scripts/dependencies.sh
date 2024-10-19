#!/bin/bash
set -e

# Add Node.js
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -

# Install Node.js and npm
sudo apt-get install -y nodejs

# Install Node.js dependencies
sudo npm install

# Run database migrations (with custom config if needed)
sudo npx sequelize-cli db:migrate --config src/database/connect.js

# Optionally, install pm2 process manager globally for production use
sudo npm install -g pm2

echo "Node.js, npm, and AWS CLI installed successfully."

# Install PostgreSQL and its additional modules
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service and enable it to run on boot
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify PostgreSQL installation
sudo psql --version

echo "PostgreSQL installed and service started successfully."
