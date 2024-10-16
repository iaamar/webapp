#!/bin/bash

# Set the -e option
set -e

# Add user with nologin shell
sudo adduser csye6225 --shell /usr/sbin/nologin

# Set ownership of the app files to user and group csye6225
sudo chown -R csye6225:csye6225 /opt/webapp.zip
sudo chown -R csye6225:csye6225 /opt/webapp

