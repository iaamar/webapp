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
    environment_vars = [
      "AWS_ACCESS_KEY_ID=${var.aws_access_key_id}",
      "AWS_SECRET_ACCESS_KEY=${var.aws_secret_access_key}",
      "AWS_DEFAULT_REGION=${var.aws_default_region}",
      "DB_HOST=${var.db_host}",
      "DB_PORT=${var.db_port}",
      "DB_USER=${var.db_user}",
      "DB_PASSWORD=${var.db_password}",
      "DB_DATABASE=${var.db_database}"
    ]
    inline = [
      "set -e",

      # Install AWS CLI
      "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
      "unzip awscliv2.zip",
      "sudo ./aws/install",

      # Configure AWS CLI using environment variables
      "aws configure set aws_access_key_id \"$AWS_ACCESS_KEY_ID\" --profile demo",
      "aws configure set aws_secret_access_key \"$AWS_SECRET_ACCESS_KEY\" --profile demo",
      "aws configure set region \"$AWS_DEFAULT_REGION\" --profile demo",
      "aws configure set output json --profile demo",
      "aws configure list",

      # Install NodeSource PPA and Node.js
      "curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash -",
      "sudo apt-get install -y nodejs",

      # Install PostgreSQL
      "sudo apt-get install -y postgresql postgresql-contrib",
      "sudo systemctl start postgresql",
      "sudo systemctl enable postgresql",

      # Use environment variables to set up the database
      "sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\"",
      "sudo -u postgres psql -c \"CREATE DATABASE $DB_DATABASE OWNER $DB_USER;\"",
      "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE TO $DB_USER;\""
    ]
  }
}
