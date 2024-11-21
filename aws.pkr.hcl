packer {
  required_plugins {
    amazon = {
      version = "~> 1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "main" {
  ami_name        = "csye6225_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = var.ami_description
  instance_type   = var.instance_type
  region          = var.region
  source_ami      = var.source_ami
  ssh_username    = var.ssh_username
  ami_users       = var.ami_users
  ami_regions     = [var.region]

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sda1"
    volume_size           = 10
    volume_type           = "gp2"
    encrypted             = false
  }

  aws_polling {
    delay_seconds = 10
    max_attempts  = 60
  }
}

build {
  sources = ["source.amazon-ebs.main"]

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
  post-processor "manifest" {
    output     = "manifest.json"
    strip_path = true
    custom_data = {
      my_custom_data = "example"
    }
  }
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

variable "ami_users" {
  type    = list(string)
  default = []
}