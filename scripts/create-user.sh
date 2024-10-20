#!/bin/bash

# Set Create the 'csye6225' group if it doesn't exist
if ! getent group csye6225 &>/dev/null; then
  sudo groupadd csye6225
  echo "Group 'csye6225' created successfully."
else
  echo "Group 'csye6225' already exists."
fi

# Create the 'csye6225' user with the /usr/sbin/nologin shell
if ! id "csye6225" &>/dev/null; then
  sudo useradd -m -g csye6225 -s /usr/sbin/nologin csye6225
  echo "User 'csye6225' created successfully with no login shell."
else
  echo "User 'csye6225' already exists."
fi