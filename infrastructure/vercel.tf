terraform {
  cloud {
    organization = "{{terraformCloudOrg}}"
    workspaces {
      name = "{{terraformCloudWorkspace}}"
    }
  }

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
  }
}

# Variables (can be set via terraform.tfvars or environment variables)
variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
  default     = null # Allows fallback to VERCEL_API_TOKEN env var
}

variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
  default     = null # Allows fallback to NEON_API_KEY env var
}

variable "github_repo" {
  description = "GitHub repository in the format 'owner/repo'"
  type        = string
  # Required - no default value
}

variable "neon_region" {
  description = "Neon database region"
  type        = string
  default     = "aws-us-east-1"
  # Options: aws-us-east-1, aws-us-east-2, aws-us-west-2, aws-eu-central-1, aws-ap-southeast-1, ap-southeast-2
}

variable "neon_org_id" {
  description = "Neon organization ID (find at https://console.neon.tech/app/settings/org-settings)"
  type        = string
  # Required - no default value
}

variable "neon_project_name" {
  description = "Neon project name"
  type        = string
  default     = "production-db"
}

variable "neon_database_name" {
  description = "Neon database name"
  type        = string
  default     = "appdb"
}

variable "neon_role_name" {
  description = "Neon database role name"
  type        = string
  default     = "app_owner"
}

# Vercel App Deployment Flags (Optional - control which apps to deploy)
variable "deploy_backend" {
  description = "Deploy backend app to Vercel"
  type        = bool
  default     = true
}

variable "deploy_marketing" {
  description = "Deploy marketing app to Vercel"
  type        = bool
  default     = true
}

variable "deploy_web" {
  description = "Deploy web app to Vercel"
  type        = bool
  default     = true
}

variable "deploy_admin" {
  description = "Deploy admin app to Vercel"
  type        = bool
  default     = true
}

# Vercel Project Names (Optional - customize project names)
variable "project_name_backend" {
  description = "Vercel project name for backend app"
  type        = string
  default     = "backend-app"
}

variable "project_name_marketing" {
  description = "Vercel project name for marketing app"
  type        = string
  default     = "marketing-app"
}

variable "project_name_web" {
  description = "Vercel project name for web app"
  type        = string
  default     = "web-app"
}

variable "project_name_admin" {
  description = "Vercel project name for admin app"
  type        = string
  default     = "admin-app"
}

# Configure the Vercel Provider
# Reads from:
# 1. terraform.tfvars (if vercel_api_token is set)
# 2. Or VERCEL_API_TOKEN environment variable (fallback)
provider "vercel" {
  api_token = var.vercel_api_token
}

# Configure the Neon Provider
# Reads from:
# 1. terraform.tfvars (if neon_api_key is set)
# 2. Or NEON_API_KEY environment variable (fallback)
provider "neon" {
  api_key = var.neon_api_key
}

# Local values
locals {
  repo = var.github_repo

  # Dynamically construct backend URL from deployed Vercel project
  backend_url = var.deploy_backend ? "https://${vercel_project.backend[0].name}.vercel.app/trpc" : ""

  # Shared environment variables for all frontends
  frontend_env_vars = var.deploy_backend ? [
    {
      key    = "NEXT_PUBLIC_API_URL"
      value  = local.backend_url
      target = ["production"]
    }
  ] : []

  # Backend environment variables (non-sensitive)
  backend_env_vars = [
    {
      key    = "DB_PROVIDER"
      value  = "neon"
      target = ["production"]
    },
    {
      key    = "CORS_ORIGIN"
      value  = "*" # Update to specific origins in production
      target = ["production"]
    }
  ]

  # Neon provides connection_uri directly
  # Format: postgresql://user:password@host/database
  database_url = neon_project.db.connection_uri
}

# ========================================
# NEON POSTGRESQL DATABASE
# ========================================

# Create Neon Project (PostgreSQL cluster)
resource "neon_project" "db" {
  name       = var.neon_project_name
  org_id     = var.neon_org_id
  region_id  = var.neon_region
  pg_version = 16

  # History retention (free tier limit: 6 hours = 21600 seconds)
  history_retention_seconds = 21600 # Maximum for free tier

  # Configure default branch and database
  branch {
    name          = "main"
    database_name = var.neon_database_name
    role_name     = var.neon_role_name
  }

  # Configure compute settings (optional)
  # Free tier: 0.25 CU, Pro: up to 10 CU
  default_endpoint_settings {
    autoscaling_limit_min_cu = 0.25 # Minimum compute units (free tier)
    autoscaling_limit_max_cu = 2    # Maximum compute units (scales up under load)
  }

  # Neon automatically creates:
  # - A "main" branch (default_branch_id)
  # - A default database user (database_user)
  # - Connection URI (connection_uri)

  # IMPORTANT: Prevent accidental deletion of production database
  lifecycle {
    prevent_destroy = false # Set to true in production
  }
}

# ========================================
# VERCEL PROJECTS
# ========================================

# Backend Project
resource "vercel_project" "backend" {
  count     = var.deploy_backend ? 1 : 0
  name      = var.project_name_backend
  framework = "hono"

  git_repository = {
    type = "github"
    repo = local.repo
  }

  root_directory = "apps/backend"
}

# Backend Environment Variables (Non-sensitive)
resource "vercel_project_environment_variable" "backend_env" {
  for_each = var.deploy_backend ? { for idx, env in local.backend_env_vars : "${env.key}" => env } : {}

  project_id = vercel_project.backend[0].id
  key        = each.value.key
  value      = each.value.value
  target     = each.value.target
}

# Backend Database Connection (Sensitive) - Production Only
resource "vercel_project_environment_variable" "backend_database_url" {
  count      = var.deploy_backend ? 1 : 0
  project_id = vercel_project.backend[0].id
  key        = "DATABASE_URL"
  value      = local.database_url
  target     = ["production"]
  sensitive  = true
}

# Marketing Project
resource "vercel_project" "marketing" {
  count     = var.deploy_marketing ? 1 : 0
  name      = var.project_name_marketing
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = local.repo
  }

  root_directory = "apps/marketing"
}

# Marketing Environment Variables
resource "vercel_project_environment_variable" "marketing_env" {
  for_each = var.deploy_marketing ? { for idx, env in local.frontend_env_vars : "${env.key}" => env } : {}

  project_id = vercel_project.marketing[0].id
  key        = each.value.key
  value      = each.value.value
  target     = each.value.target
}

# Web Project
resource "vercel_project" "web" {
  count     = var.deploy_web ? 1 : 0
  name      = var.project_name_web
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = local.repo
  }

  root_directory = "apps/web"
}

# Web Environment Variables
resource "vercel_project_environment_variable" "web_env" {
  for_each = var.deploy_web ? { for idx, env in local.frontend_env_vars : "${env.key}" => env } : {}

  project_id = vercel_project.web[0].id
  key        = each.value.key
  value      = each.value.value
  target     = each.value.target
}

# Admin Project
resource "vercel_project" "admin" {
  count     = var.deploy_admin ? 1 : 0
  name      = var.project_name_admin
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = local.repo
  }

  root_directory = "apps/admin"
}

# Admin Environment Variables
resource "vercel_project_environment_variable" "admin_env" {
  for_each = var.deploy_admin ? { for idx, env in local.frontend_env_vars : "${env.key}" => env } : {}

  project_id = vercel_project.admin[0].id
  key        = each.value.key
  value      = each.value.value
  target     = each.value.target
}

# ========================================
# OUTPUTS
# ========================================

# Neon Database Outputs
output "neon_project_id" {
  description = "Neon project ID"
  value       = neon_project.db.id
}

output "neon_default_branch_id" {
  description = "Neon default branch ID"
  value       = neon_project.db.default_branch_id
}

output "neon_database_user" {
  description = "Neon database user"
  value       = neon_project.db.database_user
}

output "neon_connection_string" {
  description = "Full PostgreSQL connection string (use for local development)"
  value       = neon_project.db.connection_uri
  sensitive   = true
}

# Vercel Project Outputs
output "backend_url" {
  description = "Backend project URL"
  value       = var.deploy_backend ? "https://${vercel_project.backend[0].name}.vercel.app" : "Not deployed"
}

output "marketing_url" {
  description = "Marketing project URL"
  value       = var.deploy_marketing ? "https://${vercel_project.marketing[0].name}.vercel.app" : "Not deployed"
}

output "web_url" {
  description = "Web app project URL"
  value       = var.deploy_web ? "https://${vercel_project.web[0].name}.vercel.app" : "Not deployed"
}

output "admin_url" {
  description = "Admin app project URL"
  value       = var.deploy_admin ? "https://${vercel_project.admin[0].name}.vercel.app" : "Not deployed"
}
