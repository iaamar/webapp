#!/bin/bash
set -e
sudo mkdir -p /opt/webapp
sudo chown -R csye6225:csye6225 /opt/webapp
sudo chmod -R 755 /opt/webapp

# Copy application files
sudo unzip -o /tmp/webapp.zip -d /opt/webapp
cd /opt/webapp
ls -la

# Check if .env file exists after extraction
if [ -f ".env" ]; then
  echo ".env file found:"
  cat .env  # Display the contents of the .env file
else
  echo ".env file not found. Creating a new .env file with default variables."

  # Create a new .env file with specified variables
  sudo bash -c '<<EOF > /opt/webapp/.env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=amarnagargoje
    DB_PASSWORD=user1234
    DB_DATABASE=healthcare
    AWS_ACCESS_KEY_ID="AKIAY6QVZHUMDQKGOLGR"
    AWS_SECRET_ACCESS_KEY="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"
    AWS_DEFAULT_REGION="us-east-2"
    AWS_OUTPUT_FORMAT="json"
    EOF'
  echo ".env file created successfully."
fi

# Set permissions for .env and systemd service files
if [ -f ".env" ]; then
  sudo chown csye6225:csye6225 /opt/webapp/.env
  sudo chmod 600 /opt/webapp/.env
else
  echo "Skipping .env file permissions setup: file not found."
fi

# Set correct ownership
sudo chown -R csye6225:csye6225 /opt/webapp

# Set correct permissions
sudo chmod -R 755 /opt/webapp

# Move the service file
sudo mv /tmp/mywebapp.service /etc/systemd/system/
sudo chown root:root /etc/systemd/system/mywebapp.service
sudo chmod 644 /etc/systemd/system/mywebapp.service

# Install dependencies
cd /opt/webapp
sudo -u csye6225 npm install