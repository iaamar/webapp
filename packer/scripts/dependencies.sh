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

# Ensure that AWS credentials directory exists
mkdir -p ~/.aws
# Write the credentials to the AWS credentials file for the "dev" profile
cat <<EOT >> ~/.aws/credentials
[dev]
aws_access_key_id=$AWS_ACCESS_KEY_ID
aws_secret_access_key=$AWS_SECRET_ACCESS_KEY
EOT

# Write the region to the AWS config file for the "dev" profile
mkdir -p ~/.aws
cat <<EOT >> ~/.aws/config
[profile dev]
region=$AWS_DEFAULT_REGION
EOT

echo "AWS credentials and region have been configured successfully for the 'dev' profile."
cat ~/.aws/credentials
cat ~/.aws/config

# Verify the AWS CLI is configured and working
aws configure list --profile dev

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
