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
