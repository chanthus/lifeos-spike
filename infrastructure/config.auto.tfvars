# ==================================================
# PROJECT CONFIGURATION (Safe to commit)
# ==================================================
# This file contains non-sensitive project configuration
# It is committed to git and shared across the team

# GitHub Repository
github_repo = "chanthus/lifeos-spike"

# ==================================================
# Database Configuration
# ==================================================

# Neon Database Region
neon_region = "aws-us-east-2"

# Neon project name (appears in Neon dashboard)
neon_project_name = "lifeos-spike-production"

# Database name within the Neon project
neon_database_name = "lifeos-spike"

# Database role/user name
neon_role_name = "lifeos_spike_owner"

# ==================================================
# App Deployment Flags
# ==================================================
# Control which apps to deploy to Vercel

deploy_backend   = true
deploy_marketing = true
deploy_web       = true
deploy_admin     = true

# ==================================================
# Vercel Project Names
# ==================================================
# These names appear in Vercel dashboard and URLs
# Format: https://{project_name}.vercel.app

project_name_backend   = "lifeos-spike-backend"
project_name_marketing = "lifeos-spike-marketing"
project_name_web       = "lifeos-spike-web"
project_name_admin     = "lifeos-spike-admin"
