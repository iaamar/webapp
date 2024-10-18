#!/bin/bash

# Set the -e option to exit on any error
set -e

sudo mkdir -p /opt/webapp
 
# Step 2: Give ubuntu user permission to upload files to /opt/webapp
# Temporarily set the owner to ubuntu
sudo chown ubuntu:ubuntu /opt/webapp
sudo chmod 755 /opt/webapp


# Move to /opt/webapp directory
cd /opt/webapp
 
# Unzip the webapp.zip file
sudo unzip webapp.zip
sudo rm webapp.zip
 
# Change the ownership of the webapp directory to csye6225
sudo chown -R csye6225:csye6225 /opt/webapp
 
# Check if package.json exists
if [ ! -f /opt/webapp/package.json ]; then
  echo "Error: package.json not found in /opt/webapp"
  exit 1
fi


# Move the webapp.zip file to /opt
sudo mv /opt/webapp.zip /opt

# Move the systemd service file to /etc/systemd/system
sudo mv /opt/mywebapp.service /etc/systemd/system

# Unzip the webapp.zip file into the /opt/webapp directory
sudo unzip /opt/webapp.zip -d /opt/webapp

# Move the .env file to the /opt/webapp directory
sudo mv /opt/.env /opt/webapp

# Ensure the systemd service file has the correct permissions
sudo chown csye6225:csye6225 /etc/systemd/system/mywebapp.service
sudo chmod 777 /etc/systemd/system/mywebapp.service

# Ensure the .env file has the correct permissions
sudo chown csye6225:csye6225 /opt/webapp/.env
sudo chmod 777 /opt/webapp/.env

# Check if the .env file exists and has content; if not, create it
if [ ! -f /opt/webapp/.env ] || [ ! -s /opt/webapp/.env ]; then
  echo "Creating .env file with environment variables"
  sudo bash -c 'cat <<EOF > /opt/webapp/.env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=amarnagargoje
    DB_PASSWORD=user1234
    DB_DATABASE=healthcare
    AWS_ACCESS_KEY_ID="AKIA3TD2SF4MDSZDW523"
    AWS_SECRET_ACCESS_KEY="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"
    AWS_DEFAULT_REGION="us-east-1"
    AWS_OUTPUT_FORMAT="json"
    EOF'
  echo ".env file write success"
else
  echo ".env file already exists and has content, skipping creation"
fi

# Ensure the .env file has the proper permissions
sudo chown root:root /opt/webapp/.env
sudo chmod 777 /opt/webapp/.env

# Reload systemd to apply the service configuration
sudo systemctl daemon-reload

echo "File transfer and setup completed successfully."
