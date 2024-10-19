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
  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1",
    ]
    inline = [
      "aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID --profile dev",
      "aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY --profile dev",
      "aws configure set default.region $AWS_DEFAULT_REGION --profile dev",
      "aws configure set default.output json",
      "export AWS_PROFILE=dev",
    ]
  }

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/opt/webapp.zip"
  }

  provisioner "file" {
    source      = "scripts/mywebapp.service"
    destination = "/opt/mywebapp.service"
  }

  provisioner "file" {
    source      = ".env"
    destination = "/opt/.env"
    generated   = true
  }

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
