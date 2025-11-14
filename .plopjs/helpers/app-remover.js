/**
 * App removal logic for cleaning up unselected apps
 */

const fs = require('fs-extra');
const path = require('path');

async function removeApps(appsToRemove) {
  console.log('\n🗑️  Removing unselected apps...');

  for (const app of appsToRemove) {
    console.log(`   Removing ${app}...`);

    try {
      // 1. Remove app directory
      const appPath = path.join(process.cwd(), 'apps', app);
      if (fs.existsSync(appPath)) {
        await fs.remove(appPath);
        console.log(`   ✓ Removed apps/${app} directory`);
      }

      // 2. Remove from root tsconfig.json references
      await removeFromTsConfig(app);

      // 3. Remove from pnpm-workspace.yaml (if needed)
      await removeFromWorkspace(app);

      // 4. Remove app-specific references from other files
      await removeAppReferences(app);

      // 5. Remove from infrastructure Terraform config
      await removeFromInfrastructure(app);

      console.log(`   ✓ Completely removed ${app}\n`);
    } catch (error) {
      console.error(`   ✗ Error removing ${app}:`, error.message);
    }
  }

  return 'Apps removed successfully';
}

async function removeFromTsConfig(app) {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    if (tsconfig.references) {
      tsconfig.references = tsconfig.references.filter(
        (ref) => !ref.path.includes(`apps/${app}`)
      );
    }

    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
  }
}

async function removeFromWorkspace(app) {
  const workspacePath = path.join(process.cwd(), 'pnpm-workspace.yaml');

  if (fs.existsSync(workspacePath)) {
    let content = fs.readFileSync(workspacePath, 'utf8');

    // Remove the app line from packages array
    const lines = content.split('\n');
    const filteredLines = lines.filter((line) => {
      // Keep the line if it doesn't reference the removed app
      return !line.includes(`apps/${app}`);
    });

    fs.writeFileSync(workspacePath, filteredLines.join('\n'));
  }
}

async function removeAppReferences(app) {
  // Remove references from various config files
  const filesToCheck = [
    '.github/workflows/ci.yml',
    '.vscode/settings.json',
    'README.md',
  ];

  for (const file of filesToCheck) {
    const filePath = path.join(process.cwd(), file);

    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Remove app-specific sections in README
      if (file === 'README.md') {
        // Remove app description sections
        const appSectionRegex = new RegExp(
          `### ${app}[\\s\\S]*?(?=###|##|$)`,
          'gi'
        );
        const newContent = content.replace(appSectionRegex, '');
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }

        // Remove from app list
        const listItemRegex = new RegExp(`^.*@project/${app}.*$`, 'gm');
        const newListContent = content.replace(listItemRegex, '');
        if (newListContent !== content) {
          content = newListContent;
          modified = true;
        }
      }

      // Remove from CI workflows
      if (file.includes('.yml')) {
        // Remove app from matrix or steps
        const appMatrixRegex = new RegExp(`["']${app}["'].*?,?`, 'g');
        content = content.replace(appMatrixRegex, '');
        modified = true;
      }

      if (modified) {
        // Clean up extra newlines
        content = content.replace(/\n{3,}/g, '\n\n');
        fs.writeFileSync(filePath, content);
      }
    }
  }
}

async function removeFromInfrastructure(app) {
  const configPath = path.join(
    process.cwd(),
    'infrastructure',
    'config.auto.tfvars'
  );

  if (!fs.existsSync(configPath)) {
    return; // No infrastructure directory
  }

  let content = fs.readFileSync(configPath, 'utf8');

  // Simply set the deploy flag to false for unselected apps
  const deployFlagRegex = new RegExp(`deploy_${app}\\s*=\\s*true`, 'g');
  const newContent = content.replace(
    deployFlagRegex,
    `deploy_${app}   = false`
  );

  if (newContent !== content) {
    fs.writeFileSync(configPath, newContent);
    console.log(`   ✓ Set deploy_${app} = false in config.auto.tfvars`);
  }
}

module.exports = {
  removeApps,
};
