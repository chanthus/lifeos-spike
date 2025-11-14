# Infrastructure deployment

Terraform configuration for deploying project to Vercel with Neon PostgreSQL database.

## What This Creates

- **Neon PostgreSQL Database** - Serverless PostgreSQL with autoscaling
- **4 Vercel Projects**:
  - Backend (Hono API)
  - Marketing (Next.js)
  - Web App (Next.js)
  - Admin Dashboard (Next.js)
- **Environment Variables** - Automatic configuration of DATABASE_URL and other env vars

## Prerequisites

1. **Terraform** - Install from [terraform.io](https://www.terraform.io/downloads)

   ```bash
   # macOS
   brew install terraform

   # Verify
   terraform version
   ```

2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Neon Account** - Sign up at [neon.tech](https://neon.tech)
4. **GitHub Repository** - Your code must be in a GitHub repo

## Getting Started

### 1. Get API Keys

**Vercel API Token:**

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Copy the token

**Neon API Key:**

1. Go to [console.neon.tech/app/settings/api-keys](https://console.neon.tech/app/settings/api-keys)
2. Click "Generate new API key"
3. Copy the key

### 2. Configure Credentials

```bash
# Create credentials file from template
cp terraform.tfvars.example terraform.tfvars

# Edit with your API keys
nano terraform.tfvars
```

**terraform.tfvars:**

```hcl
vercel_api_token = "your-vercel-token"
neon_api_key     = "your-neon-key"
neon_org_id      = "org-xxxxx"
```

**config.auto.tfvars:**

```hcl
github_repo = "your-github-username/your-repo-name"

# Deployment flags
deploy_backend   = true
deploy_marketing = true
deploy_web       = true
deploy_admin     = true
```

### 3. Initialize Terraform

```bash
cd infrastructure
terraform init
```

### 4. (Optional) Terraform Cloud for Teams

For team collaboration, use Terraform Cloud (free) to store state remotely:

1. Sign up at https://app.terraform.io/signup
2. Create an organization and workspace
3. Edit `vercel.tf` and update the `cloud` block:
   ```hcl
   terraform {
     cloud {
       organization = "your-org-name"
       workspaces {
         name = "your-workspace-name"
       }
     }
   }
   ```
4. Authenticate and migrate state:
   ```bash
   terraform login
   terraform init  # Migrates local state to cloud
   ```

## Common Commands

### Plan Changes

Preview what will be created or modified:

```bash
terraform plan
```

### Apply Changes

Create or update infrastructure:

```bash
terraform apply
# Type "yes" when prompted
```

⏱️ **Takes 2-3 minutes**

### Destroy Everything

Delete all resources:

```bash
terraform destroy
# Type "yes" when prompted
```

⚠️ **Warning:** This permanently deletes:

- Neon database (all data lost)
- All 4 Vercel projects
- All environment variables

### View Outputs

```bash
terraform output                           # All outputs
terraform output backend_url              # Backend URL
terraform output neon_connection_string   # Database URL (sensitive)
```

## Resources

- **Terraform**: https://www.terraform.io/docs
- **Vercel Provider**: https://registry.terraform.io/providers/vercel/vercel
- **Neon Provider**: https://registry.terraform.io/providers/kislerdm/neon
- **Neon Docs**: https://neon.tech/docs
- **Vercel Docs**: https://vercel.com/docs
