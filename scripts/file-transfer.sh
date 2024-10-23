#!/bin/bash
set -e
sudo mkdir -p /opt/webapp
sudo chown -R csye6225:csye6225 /opt/webapp
sudo chmod -R 755 /opt/webapp

# Copy application files
sudo unzip -o /tmp/webapp.zip -d /opt/webapp
cd /opt/webapp
ls -la

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