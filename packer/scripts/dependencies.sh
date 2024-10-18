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
AWS_ACCESS_KEY_ID="AKIA3TD2SF4MDSZDW523"
AWS_SECRET_ACCESS_KEY="8iUN5TMnJy2iEc7s5/KbnnNr5jd9f9ZTn6oxlq23"
AWS_DEFAULT_REGION="us-east-1"  # e.g., us-east-1
AWS_OUTPUT_FORMAT="json"  # You can set this to json, text, or table

aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID --profile dev
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY --profile dev
aws configure set region $AWS_DEFAULT_REGION --profile dev
aws configure set output $AWS_OUTPUT_FORMAT --profile dev
aws configure list --profile dev

echo "AWS credentials and region have been configured successfully for the 'dev' profile."
cat ~/.aws/credentials
cat ~/.aws/config

# Add NodeSource PPA for the latest stable version of Node.js (replace version as needed)
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
