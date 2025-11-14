module.exports = function (plop) {
  // Load custom helpers
  const caseHelpers = require('./helpers/case-helpers');
  const appRemover = require('./helpers/app-remover');
  const { execSync } = require('child_process');

  // Register all case helpers
  Object.keys(caseHelpers).forEach((name) => {
    plop.setHelper(name, caseHelpers[name]);
  });

  // Helper function to get current git repository
  function getCurrentGitRepo() {
    try {
      const remoteUrl = execSync('git config --get remote.origin.url', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      }).trim();

      // Parse GitHub repo from various URL formats
      // SSH: git@github.com:owner/repo.git
      // HTTPS: https://github.com/owner/repo.git
      // HTTPS (no .git): https://github.com/owner/repo
      const sshMatch = remoteUrl.match(/git@github\.com:(.+)\.git$/);
      const httpsMatch = remoteUrl.match(/github\.com\/(.+?)(\.git)?$/);

      if (sshMatch) {
        return sshMatch[1];
      } else if (httpsMatch) {
        return httpsMatch[1].replace(/\.git$/, '');
      }
    } catch (error) {
      // Git command failed or not in a git repo
    }
    return 'username/my-app';
  }

  // Helper function to get project name from git repo
  function getProjectNameFromRepo() {
    const repo = getCurrentGitRepo();
    const parts = repo.split('/');
    if (parts.length === 2) {
      // Convert repo name to valid project name format
      // e.g., "lifeos-spike" stays as is, "MyProject" becomes "myproject"
      return parts[1].toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }
    return 'my-app';
  }

  // Helper function to get organization name from git repo
  function getOrgNameFromRepo() {
    const repo = getCurrentGitRepo();
    const parts = repo.split('/');
    if (parts.length === 2) {
      // Convert owner name to valid org name format
      // e.g., "chanthus" stays as is, "My-Company" becomes "mycompany"
      return parts[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    return 'mycompany';
  }

  // Main setup generator
  plop.setGenerator('setup', {
    description: 'Setup your monorepo with selected apps',
    prompts: [
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: (input) => {
          if (!input) return 'Project name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Project name must be lowercase, start with letter, and contain only letters, numbers, and dashes';
          }
          return true;
        },
        default: getProjectNameFromRepo(),
      },
      {
        type: 'input',
        name: 'orgName',
        message: 'What is your organization name (for mobile bundle ID)?',
        validate: (input) => {
          if (!input) return 'Organization name is required';
          if (!/^[a-z][a-z0-9]*$/.test(input)) {
            return 'Organization name must be lowercase letters and numbers only';
          }
          return true;
        },
        default: getOrgNameFromRepo(),
      },
      {
        type: 'input',
        name: 'githubRepo',
        message: 'What is your GitHub repository (format: owner/repo)?',
        validate: (input) => {
          if (!input) return 'GitHub repository is required';
          if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/.test(input)) {
            return 'GitHub repository must be in format: owner/repo';
          }
          return true;
        },
        default: getCurrentGitRepo(),
      },
      {
        type: 'checkbox',
        name: 'selectedApps',
        message: 'Which apps do you want to include?',
        choices: [
          {
            name: 'Web - Customer-facing Next.js app',
            value: 'web',
            checked: true,
          },
          {
            name: 'Admin - Internal dashboard (Next.js)',
            value: 'admin',
            checked: true,
          },
          {
            name: 'Mobile - iOS/Android app (Expo)',
            value: 'mobile',
            checked: true,
          },
          {
            name: 'Marketing - Public marketing site (Next.js)',
            value: 'marketing',
            checked: true,
          },
        ],
        validate: (choices) => {
          if (choices.length === 0) {
            return 'You must select at least one app';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'vercelApiToken',
        message:
          '\n🔐 Infrastructure Credentials (optional - can be added later)\n   Vercel API Token (from https://vercel.com/account/tokens):',
        default: '',
      },
      {
        type: 'input',
        name: 'neonApiKey',
        message:
          '   Neon API Key (from https://console.neon.tech/app/settings/api-keys):',
        default: '',
      },
      {
        type: 'input',
        name: 'neonOrgId',
        message:
          '   Neon Organization ID (from https://console.neon.tech/app/settings/org-settings):',
        default: '',
      },
      {
        type: 'input',
        name: 'terraformCloudOrg',
        message:
          '\n☁️  Terraform Cloud (optional - for remote state)\n   Organization name:',
        validate: (input) => {
          if (!input) return true; // Optional
          if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(input)) {
            return 'Organization name must start with a letter or number and contain only letters, numbers, underscores, and dashes';
          }
          return true;
        },
        default: '',
      },
      {
        type: 'input',
        name: 'terraformCloudWorkspace',
        message: '   Workspace name:',
        validate: (input) => {
          if (!input) return true; // Optional
          if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(input)) {
            return 'Workspace name must start with a letter or number and contain only letters, numbers, underscores, and dashes';
          }
          return true;
        },
        default: '',
      },
    ],
    actions: function (data) {
      const actions = [];

      // Add case variations to data for templates
      data.projectNamePascal = caseHelpers.toPascalCase(data.projectName);
      data.projectNameSnake = caseHelpers.toSnakeCase(data.projectName);

      // Calculate dependencies
      const needsBackend = data.selectedApps.length > 0;
      const needsDatabase = needsBackend;
      const needsUI =
        data.selectedApps.includes('web') ||
        data.selectedApps.includes('admin') ||
        data.selectedApps.includes('mobile') ||
        data.selectedApps.includes('marketing');

      // Show what will be included
      actions.push({
        type: 'showDependencies',
        needsBackend,
        needsDatabase,
        needsUI,
        selectedApps: data.selectedApps,
      });

      // 1. Template replacements for project name
      actions.push({
        type: 'modifyMultiple',
        templateReplacements: data,
        files: [
          // Root files
          'package.json',
          'README.md',
          '*.md',
          '*.json',

          // Apps - all file types
          'apps/**/*.{ts,tsx,js,jsx,json,md}',
          'apps/**/app.json',
          'apps/**/package.json',

          // Packages - all file types
          'packages/**/*.{ts,tsx,js,jsx,json,md}',
          'packages/**/package.json',

          // Documentation
          'docs/**/*.md',

          // Config files
          '**/.env.example',
          '**/tsconfig.json',

          // Infrastructure
          'infrastructure/**/*.{tf,tfvars,md}',
          'infrastructure/**/*.example',
        ],
      });

      // 2. Remove unselected apps
      const allApps = ['web', 'admin', 'mobile', 'marketing'];
      const appsToRemove = allApps.filter(
        (app) => !data.selectedApps.includes(app)
      );

      if (appsToRemove.length > 0) {
        actions.push({
          type: 'removeApps',
          apps: appsToRemove,
        });
      }

      // 3. Clean up package.json scripts for removed apps
      actions.push({
        type: 'cleanupPackageJson',
        selectedApps: data.selectedApps,
        needsBackend,
      });

      // 4. Update turbo.json for selected apps only
      actions.push({
        type: 'updateTurboConfig',
        selectedApps: data.selectedApps,
        needsBackend,
      });

      // 5. Setup environment files
      actions.push({
        type: 'setupEnvFiles',
      });

      // 6. Generate infrastructure terraform.tfvars file
      actions.push({
        type: 'generateTerraformVars',
        vercelApiToken: data.vercelApiToken,
        neonApiKey: data.neonApiKey,
        neonOrgId: data.neonOrgId,
      });

      // 7. Final success message
      actions.push({
        type: 'showSuccess',
        projectName: data.projectName,
        selectedApps: data.selectedApps,
      });

      return actions;
    },
  });

  // Custom action: Show dependencies
  plop.setActionType('showDependencies', function (answers, config) {
    console.log('\n📦 Setting up your monorepo with:');
    console.log('   Selected apps:', config.selectedApps.join(', '));

    if (config.needsBackend) {
      console.log('   ✓ Including required: backend (tRPC API)');
    }
    if (config.needsDatabase) {
      console.log('   ✓ Including required: database (PostgreSQL + Drizzle)');
    }
    if (config.needsUI) {
      console.log('   ✓ Including required: ui (shared components)');
    }
    console.log('   ✓ Including required: config, shared (always needed)\n');

    return 'Dependencies calculated';
  });

  // Custom action: Modify multiple files
  plop.setActionType('modifyMultiple', async function (answers, config) {
    const fs = require('fs-extra');
    const glob = require('glob');
    const path = require('path');

    console.log('\n🔄 Replacing template placeholders...');

    // Apply template replacements
    const replacements = caseHelpers.generateReplacements(
      config.templateReplacements.projectName,
      config.templateReplacements.orgName,
      config.templateReplacements.githubRepo,
      config.templateReplacements.terraformCloudOrg,
      config.templateReplacements.terraformCloudWorkspace
    );

    console.log('   Project name:', config.templateReplacements.projectName);
    console.log('   Organization:', config.templateReplacements.orgName);
    console.log('   GitHub repo:', config.templateReplacements.githubRepo);
    if (config.templateReplacements.terraformCloudOrg) {
      console.log(
        '   Terraform Cloud:',
        config.templateReplacements.terraformCloudOrg +
          '/' +
          config.templateReplacements.terraformCloudWorkspace
      );
    }

    let totalReplacements = 0;

    for (const pattern of config.files) {
      const files = glob.sync(pattern, { cwd: process.cwd() });

      for (const file of files) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          let content = fs.readFileSync(filePath, 'utf8');
          let originalContent = content;
          let fileReplacements = 0;

          // Apply all replacements
          for (const [search, replace] of Object.entries(replacements)) {
            // Use string replacement for template variables
            if (content.includes(search)) {
              content = content.replace(
                new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                replace
              );
              fileReplacements++;
            }
          }

          if (fileReplacements > 0) {
            fs.writeFileSync(filePath, content);
            console.log(
              `   ✓ Updated ${file} (${fileReplacements} replacements)`
            );
            totalReplacements += fileReplacements;
          }
        }
      }
    }

    console.log(`   Total: ${totalReplacements} replacements made\n`);
    return 'Template replacements complete';
  });

  // Custom action: Remove apps
  plop.setActionType('removeApps', async function (answers, config) {
    const result = await appRemover.removeApps(config.apps);
    return result;
  });

  // Custom action: Clean up package.json
  plop.setActionType('cleanupPackageJson', async function (answers, config) {
    const fs = require('fs-extra');
    const packagePath = 'package.json';
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Start with all existing scripts
    const scripts = { ...pkg.scripts };

    // Define which apps were NOT selected
    const allApps = ['web', 'admin', 'mobile', 'marketing'];
    const removedApps = allApps.filter(
      (app) => !config.selectedApps.includes(app)
    );

    // Remove dev:* scripts for apps that were not selected
    removedApps.forEach((app) => {
      delete scripts[`dev:${app}`];
    });

    // Remove backend-related scripts if no backend is needed
    if (!config.needsBackend) {
      delete scripts['dev:backend'];
      delete scripts['db:generate'];
      delete scripts['db:migrate'];
      delete scripts['db:seed'];
      delete scripts['db:studio'];
      delete scripts['db:push'];
    }

    pkg.scripts = scripts;
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

    return 'Package.json scripts updated';
  });

  // Custom action: Update turbo.json
  plop.setActionType('updateTurboConfig', async function (answers, config) {
    const fs = require('fs-extra');
    const turboPath = 'turbo.json';
    const turbo = JSON.parse(fs.readFileSync(turboPath, 'utf8'));

    // Keep only pipelines for selected apps and required packages
    const keepPatterns = [
      '@project/db#*',
      '@project/shared#*',
      '@project/ui#*',
      '@project/config#*',
    ];

    if (config.needsBackend) {
      keepPatterns.push('@project/backend#*');
    }

    config.selectedApps.forEach((app) => {
      keepPatterns.push(`@project/${app}#*`);
    });

    // Filter pipeline tasks
    const filteredPipeline = {};
    Object.keys(turbo.pipeline || turbo.tasks || {}).forEach((key) => {
      // Keep if it's a general task or matches our patterns
      if (
        !key.includes('#') ||
        keepPatterns.some((pattern) => {
          const regex = pattern.replace('*', '.*');
          return new RegExp(regex).test(key);
        })
      ) {
        filteredPipeline[key] = (turbo.pipeline || turbo.tasks)[key];
      }
    });

    if (turbo.pipeline) turbo.pipeline = filteredPipeline;
    if (turbo.tasks) turbo.tasks = filteredPipeline;

    fs.writeFileSync(turboPath, JSON.stringify(turbo, null, 2) + '\n');

    return 'Turbo config updated';
  });

  // Custom action: Setup environment files
  plop.setActionType('setupEnvFiles', async function () {
    const { execSync } = require('child_process');

    console.log('\n📝 Setting up environment files...');

    try {
      execSync('pnpm env:setup', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      console.log('');
      return 'Environment files created successfully';
    } catch (error) {
      console.error('\n⚠️  Warning: Failed to setup env files:', error.message);
      console.log('   You can run "pnpm env:setup" manually later\n');
      return 'Env setup skipped (non-fatal)';
    }
  });

  // Custom action: Generate Terraform variables file
  plop.setActionType('generateTerraformVars', async function (answers, config) {
    const fs = require('fs-extra');
    const path = require('path');

    console.log('\n🏗️  Generating infrastructure/terraform.tfvars...');

    const infraPath = path.join(process.cwd(), 'infrastructure');
    const tfvarsPath = path.join(infraPath, 'terraform.tfvars');

    // Check if infrastructure directory exists
    if (!fs.existsSync(infraPath)) {
      console.log('   ⏭️  Skipped (no infrastructure directory)\n');
      return 'Infrastructure directory not found';
    }

    // Generate terraform.tfvars content
    const content = `# Vercel API Token
# Get from: https://vercel.com/account/tokens
vercel_api_token = "${config.vercelApiToken || 'your-vercel-api-token-here'}"

# Neon API Key
# Get from: https://console.neon.tech/app/settings/api-keys
neon_api_key = "${config.neonApiKey || 'your-neon-api-key-here'}"

# Neon Organization ID
# Get from: https://console.neon.tech/app/settings/org-settings
neon_org_id = "${config.neonOrgId || 'your-neon-org-id-here'}"
`;

    fs.writeFileSync(tfvarsPath, content);

    if (config.vercelApiToken && config.neonApiKey && config.neonOrgId) {
      console.log('   ✓ Created with provided credentials\n');
    } else {
      console.log(
        '   ✓ Created with placeholder values (update manually later)\n'
      );
    }

    return 'Terraform variables file created';
  });

  // Custom action: Show success
  plop.setActionType('showSuccess', function (answers, config) {
    console.log('\n✅ Setup complete!\n');
    console.log('Your monorepo has been customized with:');
    console.log(`  - Project name: ${config.projectName}`);
    console.log(
      `  - Selected apps: ${config.selectedApps && config.selectedApps.length > 0 ? config.selectedApps.join(', ') : 'none'}`
    );
    console.log('\nNext steps:');
    console.log('  1. pnpm install  (if not already done)');
    console.log(
      '  2. Review and customize .env files (already created from templates)'
    );
    console.log('  3. Set up your database (see README)');
    console.log('  4. pnpm dev\n');

    return 'Setup complete!';
  });
};
