#!/bin/bash

# Set the -e option
set -e

sudo systemctl daemon-reload

sudo systemctl enable mywebapp.service

# Check if everything worked
if [ $? -ne 0 ]; then
  echo "Failed to configure the systemd service."
  exit 1
else
  echo "Systemd service configured and enabled successfully."
fi