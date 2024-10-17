packer {
  required_plugins {
    amazon = {
      version = ">=1.2.7, <2.10.0"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "a04-ami" {
  ami_name        = var.ami_name
  ami_description = var.ami_description
  instance_type   = var.instance_type
  region          = var.region
  source_ami      = var.source_ami
  ssh_username    = var.ssh_username
  subnet_id       = var.subnet_id
  ami_regions     = var.ami_regions

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/sda1"
    volume_size           = 10
    volume_type           = "gp2"
  }

  aws_polling {
    delay_seconds = 10
    max_attempts  = 60
  }

}

build {
  sources = ["source.amazon-ebs.a04-ami"]

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "packer/scripts/mywebapp.service"
    destination = "/tmp/mywebapp.service"
  }

  provisioner "file" {
    source      = ".env"
    destination = "/tmp/.env"
    generated   = true
  }

  provisioner "shell" {
    scripts = [
      // "packer/scripts/build-artifact.sh",
      "packer/scripts/dependencies.sh",
      "packer/scripts/file-transfer.sh",
      "packer/scripts/create-user.sh",
      // "packer/scripts/user-data.sh",
      "packer/scripts/db-setup.sh",
      "packer/scripts/launch-service.sh",
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
