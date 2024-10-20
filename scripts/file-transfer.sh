#!/bin/bash

# Set the -e option to exit on any error
set -e

# Move files from /tmp to their final destinations
sudo mkdir -p /opt/webapp

# Unzip the webapp.zip file into /opt/webapp, including hidden files
sudo unzip -o /tmp/webapp.zip -d /opt/webapp
cd /opt/webapp

# Display all files, including hidden ones
ls -la

# Check if .env file exists after extraction
if [ -f ".env" ]; then
  echo ".env file found:"
  cat .env  # Display the contents of the .env file
else
  echo ".env file not found. Creating a new .env file with default variables."

  # Create a new .env file with specified variables
  sudo bash -c 'cat <<EOF > /opt/webapp/.env
DB_HOST=localhost
DB_PORT=5432
DB_USER=amarnagargoje
DB_PASSWORD=user1234
DB_DATABASE=healthcare
AWS_ACCESS_KEY_ID="AKIA3TD2SF4MLQA4AQNC"
AWS_SECRET_ACCESS_KEY="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"
AWS_DEFAULT_REGION="us-east-2"
AWS_OUTPUT_FORMAT="json"
EOF'

  echo ".env file created successfully."
fi

# Move the mywebapp.service file to /etc/systemd/system
sudo mv /tmp/mywebapp.service /etc/systemd/system

# Change ownership of /opt/webapp to the 'csye6225' user and group
sudo chown -R csye6225:csye6225 /opt/webapp
sudo chmod -R 755 /opt/webapp

# Set permissions for .env and systemd service files
if [ -f ".env" ]; then
  sudo chown csye6225:csye6225 /opt/webapp/.env
  sudo chmod 600 /opt/webapp/.env
else
  echo "Skipping .env file permissions setup: file not found."
fi

sudo chown csye6225:csye6225 /etc/systemd/system/mywebapp.service
sudo chmod 644 /etc/systemd/system/mywebapp.service

# Ensure /home/csye6225 directory ownership and permissions
sudo chown -R csye6225:csye6225 /home/csye6225
sudo chmod 755 /home/csye6225

# Create and set ownership for .npm directory in user's home
sudo -u csye6225 mkdir -p /home/csye6225/.npm
sudo chown -R csye6225:csye6225 /home/csye6225/.npm


echo "File transfer and setup completed successfully."
