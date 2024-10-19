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
sudo mv /tmp/webapp.zip /opt
sudo unzip /opt/webapp.zip -d /opt
cd /opt/webapp
ls -la

sudo mv /tmp/mywebapp.service /etc/systemd/system

# Change ownership of /opt/webapp to the 'csye6225' user
#unzip the file

sudo chown -R csye6225:csye6225 /opt/webapp
sudo chmod 755 /opt/webapp

# Set permissions for .env and systemd service files
sudo chown csye6225:csye6225 /opt/webapp/.env
sudo chmod 600 /opt/webapp/.env
sudo chown csye6225:csye6225 /etc/systemd/system/mywebapp.service
sudo chmod 644 /etc/systemd/system/mywebapp.service

echo "File transfer and setup completed successfully."
