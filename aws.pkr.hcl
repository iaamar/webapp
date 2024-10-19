variable "aws_access_key_id" {
  type = string
}

variable "aws_secret_access_key" {
  type = string
}

variable "aws_default_region" {
  type = string
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
    inline = [
      "set -e",

      # Install AWS CLI
      "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
      "unzip awscliv2.zip",
      "sudo ./aws/install",

      # Configure AWS CLI with variables
      "aws configure set aws_access_key_id \"${var.aws_access_key_id}\" --profile dev",
      "aws configure set aws_secret_access_key \"${var.aws_secret_access_key}\" --profile dev",
      "aws configure set region \"${var.aws_default_region}\" --profile dev",
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
