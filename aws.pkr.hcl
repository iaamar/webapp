packer {
  required_plugins {
    amazon = {
      version = "~> 1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "a04-ami" {
  ami_name             = var.ami_name
  ami_description      = var.ami_description
  instance_type        = var.instance_type
  region               = var.region
  source_ami           = var.source_ami
  ssh_username         = var.ssh_username

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
  sources = ["source.amazon-ebs.a04-ami"]

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
    "DB_HOST=\"${var.db_host}\"",
    "DB_PORT=\"${var.db_port}\"",
    "DB_USER=\"${var.db_user}\"",
    "DB_PASSWORD=\"${var.db_password}\"",
    "DB_DATABASE=\"${var.db_database}\"",
    "INSTANCE_TYPE=\"${var.instance_type}\"",
    "REGION=\"${var.region}\"",
    "SOURCE_AMI=\"${var.source_ami}\"",
    "SSH_USERNAME=\"${var.ssh_username}\"",
    "AMI_NAME=\"${var.ami_name}\"",
    "AMI_DESCRIPTION=\"${var.ami_description}\""
  ]
  inline = [
    "set -e",

      "sudo apt-get install -y unzip",

      # Install AWS CLI
      "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
      "unzip awscliv2.zip",
      "sudo ./aws/install",

      # Configure AWS CLI using environment variables
      "export AWS_PROFILE=demo",
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

    # Set up the database using environment variables
    "sudo -u postgres psql -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\"",
    "sudo -u postgres psql -c \"CREATE DATABASE $DB_DATABASE WITH OWNER $DB_USER;\"",
    "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_DATABASE TO $DB_USER;\"",
    "sudo -u postgres psql -c \"ALTER USER $DB_USER WITH SUPERUSER;\"",

    # Restart PostgreSQL service
    "sudo systemctl restart postgresql",

    # Debug info
    "echo \"Database: $DB_DATABASE, User: $DB_USER\"",

    # Grant schema privileges to the user
    "sudo -u postgres psql -d $DB_DATABASE -c 'GRANT ALL ON SCHEMA public TO $DB_USER;'",
    "sudo -u postgres psql -d $DB_DATABASE -c 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;'",
    "sudo -u postgres psql -d $DB_DATABASE -c 'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;'",

    "echo 'PostgreSQL and user configuration completed successfully.'"
    ]
  }

   # Execute additional scripts after environment setup
  provisioner "shell" {
    scripts = [
      "scripts/create-user.sh",
      "scripts/file-transfer.sh",
      // "scripts/db-setup.sh",
      "scripts/launch-service.sh",
    ]
  }
}


variable "ami_name" {
  type = string
  default = ""
}

variable "ami_description" {
  type = string
  default = ""
}

variable "instance_type" {
  type = string
  default = ""
}

variable "region" {
  type = string
  default = ""
}

variable "source_ami" {
  type = string
  default = ""
}

variable "ssh_username" {
  type = string
  default = ""
}


variable "db_user" {
  type = string
  default = ""
}

variable "db_password" {
  type = string
  default = ""
}

variable "db_name" {
  type = string
  default = ""
}

variable "db_database" {
  type = string
  default = ""
}

variable "db_host" {
  type = string
  default = ""
}

variable "db_port" {
  type = string
  default = ""
}

variable "aws_access_key_id" {
  type = string
  default = ""
}

variable "aws_secret_access_key" {
  type = string
  default = ""
}

variable "aws_default_region" {
  type = string
  default = ""
}
