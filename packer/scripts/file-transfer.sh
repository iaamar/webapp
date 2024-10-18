#!/bin/bash

# Set the -e option
set -e

# move file locally
sudo mv /tmp/webapp.zip /opt

# move file from git repo
# sudo mv https://github.com/CSYE6225-NetworkStruct-CloudComputing/webapp/archive/refs/heads/main.zip /opt

# move file
sudo mv /tmp/mywebapp.service /etc/systemd/system

# unzip file
sudo unzip /opt/webapp.zip -d /opt/webapp

# move file
sudo mv /tmp/.env /opt/webapp
echo "Listing files in /opt/webapp:"
ls -l /opt/webapp

echo "Displaying the contents of the .env file:"
cat /opt/webapp/.env
echo "File transfer completed successfully."