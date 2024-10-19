packer {
  required_plugins {
    amazon = {
      version = ">=1.2.7, <2.10.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "a04" {
  ami_name             = var.ami_name
  ami_description      = var.ami_description
  instance_type        = var.instance_type
  region               = var.region
  source_ami           = var.source_ami
  ssh_username         = var.ssh_username
  subnet_id            = var.subnet_id
  ami_regions          = var.ami_regions

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sda1"
    volume_size           = 10
    volume_type           = "gp2"
    encrypted             = true
  }

  aws_polling {
    delay_seconds = 10
    max_attempts  = 60
  }
}

build {
  sources = ["source.amazon-ebs.a04"]

  # Upload files to a temporary directory
  provisioner "file" {
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "scripts/mywebapp.service"
    destination = "/tmp/mywebapp.service"
  }

  # Set up environment variables and install dependencies
  provisioner "shell" {
    environment_vars = [
      "AWS_ACCESS_KEY_ID={{env `AWS_ACCESS_KEY_ID`}}",
      "AWS_SECRET_ACCESS_KEY={{env `AWS_SECRET_ACCESS_KEY`}}",
      "AWS_DEFAULT_REGION={{env `AWS_DEFAULT_REGION`}}"
    ]
    inline = [
      "set -e",

      # Update and install prerequisites
      "sudo apt-get update -y"
      "sudo apt-get install -y curl gnupg2 unzip zip"

      # Install AWS CLI
      "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
      "unzip awscliv2.zip",
      "sudo ./aws/install",

      # Configure AWS CLI with environment variables
      "aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID --profile dev",
      "aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY --profile dev",
      "aws configure set region $AWS_DEFAULT_REGION --profile dev",
      "aws configure set output json --profile dev",
      "aws configure list"
    ]
  }

  # Execute additional scripts after environment setup
  provisioner "shell" {
    scripts = [
      "scripts/dependencies.sh",
      "scripts/file-transfer.sh",
      "scripts/create-user.sh",
      "scripts/db-setup.sh",
      "scripts/launch-service.sh",
    ]
  }
}


variable "ami_name" {
  type = string
}

variable "ami_description" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "region" {
  type = string
}

variable "source_ami" {
  type = string
}

variable "ssh_username" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "ami_regions" {
  type = list(string)
}

variable "db_user" {
  type = string
}

variable "db_password" {
  type = string
}

variable "db_name" {
  type = string
}
