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

# Create the 'csye6225' user with a home directory and /bin/bash shell
if ! id "csye6225" &>/dev/null; then
  sudo useradd -m -g csye6225 -s /bin/bash csye6225
  echo "User 'csye6225' created successfully with a home directory."
else
  echo "User 'csye6225' already exists."
fi

# Add 'csye6225' user to the 'sudo' group to grant all privileges
sudo usermod -aG sudo csye6225
