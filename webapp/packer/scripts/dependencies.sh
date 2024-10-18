#!/bin/bash
set -e

# Update and install prerequisites
sudo apt-get update -y
sudo apt-get install -y curl gnupg2

# Add NodeSource PPA for the latest stable version of Node.js (replace version as needed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js and npm
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v

# Optionally, install pm2 process manager globally for production use
sudo npm install -g pm2

echo "Node.js and npm installed successfully."

# install unzip
sudo npm install unzip -y

sudo apt-get install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo psql --version

echo "postgresql installed and service started successfully."
