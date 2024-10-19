#!/bin/bash

# Set the -e option to exit on any error
set -e

# Move files from /tmp to their final destinations
sudo mkdir -p /opt/webapp

# Check if the .env file is in the ZIP archive before extraction
echo "Checking for .env file in the ZIP archive:"
sudo unzip -l /tmp/webapp.zip | grep "\.env" || echo "No .env file found in the ZIP archive."

# Unzip the webapp.zip file into /opt/webapp
sudo unzip -o /tmp/webapp.zip -d /opt/webapp
cd /opt/webapp
ls -la
# Display all files, including hidden ones, in /opt/webapp
echo "Listing contents of /opt/webapp, including hidden files:"
ls -la

# Check if .env file exists after extraction
if [ -f ".env" ]; then
  echo ".env file found:"
  cat .env  # Display the contents of the .env file
else
  echo "Error: .env file not found in /opt/webapp"
fi

# Move the mywebapp.service file to /etc/systemd/system
sudo mv /tmp/mywebapp.service /etc/systemd/system

# Change ownership of /opt/webapp to the 'csye6225' user
sudo chown -R csye6225:csye6225 /opt/webapp
sudo chmod 755 /opt/webapp

# Set permissions for .env and systemd service files if .env exists
if [ -f ".env" ]; then
  sudo chown csye6225:csye6225 /opt/webapp/.env
  sudo chmod 600 /opt/webapp/.env
else
  echo "Skipping .env file permissions setup: file not found."
fi

sudo chown csye6225:csye6225 /etc/systemd/system/mywebapp.service
sudo chmod 644 /etc/systemd/system/mywebapp.service

echo "File transfer and setup completed successfully."
