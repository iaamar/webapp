#!/bin/bash
set -e

sudo systemctl daemon-reload
sudo systemctl enable mywebapp.service
sudo systemctl start mywebapp.service
sudo systemctl status mywebapp.service