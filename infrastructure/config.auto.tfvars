# ==================================================
# PROJECT CONFIGURATION (Safe to commit)
# ==================================================
# This file contains non-sensitive project configuration
# It is committed to git and shared across the team

# GitHub Repository
github_repo = "{{githubRepo}}"

# ==================================================
# Database Configuration
# ==================================================

# Neon Database Region
neon_region = "aws-us-east-2"

# Neon project name (appears in Neon dashboard)
neon_project_name = "{{projectName}}-production"

# Database name within the Neon project
neon_database_name = "{{projectName}}"

# Database role/user name
neon_role_name = "{{projectNameSnake}}_owner"

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

project_name_backend   = "{{projectName}}-backend"
project_name_marketing = "{{projectName}}-marketing"
project_name_web       = "{{projectName}}-web"
project_name_admin     = "{{projectName}}-admin"
