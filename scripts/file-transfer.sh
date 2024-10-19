#!/bin/bash

# Set the -e option to exit on any error
set -e
# Create the 'csye6225' group if it doesn't exist
if ! getent group csye6225 &>/dev/null; then
  sudo groupadd csye6225
  echo "Group 'csye6225' created successfully."
else
  echo "Group 'csye6225' already exists."
fi

# Create the 'csye6225' user with primary group 'csye6225' and set /usr/sbin/nologin as the shell
if ! id "csye6225" &>/dev/null; then
  sudo useradd -r -g csye6225 -s /usr/sbin/nologin csye6225
  echo "User 'csye6225' created successfully with /usr/sbin/nologin as the shell."
else
  echo "User 'csye6225' already exists."
fi

# Add 'csye6225' user to the 'sudo' group to grant all privileges
sudo usermod -aG sudo csye6225

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
