packer {
  required_plugins {
    amazon = {
      version = "~> 1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "a06-ami" {
  ami_name        = var.ami_name
  ami_description = var.ami_description
  instance_type   = var.instance_type
  region          = var.region
  source_ami      = var.source_ami
  ssh_username    = var.ssh_username

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
  sources = ["source.amazon-ebs.a06-ami"]

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "scripts/mywebapp.service"
    destination = "/tmp/mywebapp.service"
  }

  provisioner "shell" {
    scripts = [
      "scripts/dependencies.sh",
      "scripts/cloud-watch.sh",
      "scripts/create-user.sh",
      "scripts/file-transfer.sh",
      "scripts/launch-service.sh",
    ]
  }
}

variable "ami_name" {
  type    = string
  default = ""
}

variable "ami_description" {
  type    = string
  default = ""
}

variable "instance_type" {
  type    = string
  default = ""
}

variable "region" {
  type    = string
  default = ""
}

variable "source_ami" {
  type    = string
  default = ""
}

variable "ssh_username" {
  type    = string
  default = ""
}

variable "db_user" {
  type    = string
  default = ""
}

variable "db_password" {
  type    = string
  default = ""
}

variable "db_database" {
  type    = string
  default = ""
}

variable "db_host" {
  type    = string
  default = ""
}

variable "db_port" {
  type    = string
  default = ""
}

variable "aws_access_key_id" {
  type    = string
  default = ""
}

variable "aws_secret_access_key" {
  type    = string
  default = ""
}

variable "aws_default_region" {
  type    = string
  default = ""
}