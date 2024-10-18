#!/bin/bash

# Set the -e option to exit on any error
set -e

sudo mv /opt/webapp.zip /opt
sudo mv /opt/.env /opt/webapp
sudo mv /opt/mywebapp.service /etc/systemd/system

# Change the ownership of the webapp directory to csye6225
sudo chown -R csye6225:csye6225 /opt/webapp
sudo chmod 777 /opt/webapp
sudo chown csye6225:csye6225 /opt/webapp/.env
sudo chmod 777 /opt/webapp/.env
sudo chown csye6225:csye6225 /etc/systemd/system/mywebapp.service
sudo chmod 777 /etc/systemd/system/mywebapp.service

# Unzip the webapp.zip file into the /opt/webapp directory
sudo unzip /opt/webapp.zip -d /opt/webapp
ls -a /opt/webapp

# Check if package.json exists
if [ ! -f /opt/webapp/package.json ]; then
  echo "Error: package.json not found in /opt/webapp"
  exit 1
fi

# Check if the .env file exists and has content; if not, create it
if [ ! -f /opt/webapp/.env ] || [ ! -s /opt/webapp/.env ]; then
  echo "Creating .env file with environment variables"
  sudo bash -c 'cat <<EOF > /opt/webapp/.env
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=amarnagargoje
    DB_PASSWORD=user1234
    DB_DATABASE=healthcare
    AWS_ACCESS_KEY_ID="AKIA3TD2SF4MLQA4AQNC"
    AWS_SECRET_ACCESS_KEY="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"
    AWS_DEFAULT_REGION="us-east-1"
    AWS_OUTPUT_FORMAT="json"
    EOF'
  echo ".env file write success"
else
  echo ".env file already exists and has content, skipping creation"
fi

echo "File transfer and setup completed successfully."
