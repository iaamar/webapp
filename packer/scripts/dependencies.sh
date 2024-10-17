#!/bin/bash
set -e

# Update and install prerequisites
sudo apt-get update -y
sudo apt-get install -y curl gnupg2 unzip zip

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify AWS CLI installation
aws --version

# Configure AWS credentials using environment variables from GitHub Secrets
aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
aws configure set region "$REGION"

# Verify the AWS CLI is configured and working
aws sts get-caller-identity
aws configure list

# Add NodeSource PPA for the latest stable version of Node.js (replace version as needed)
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -

# Install Node.js and npm
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v

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
