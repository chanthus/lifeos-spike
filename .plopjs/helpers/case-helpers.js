/**
 * Case transformation helpers for Plop templates
 */

// Convert to PascalCase (e.g., "my-app" -> "MyApp")
function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// Convert to camelCase (e.g., "my-app" -> "myApp")
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// Convert to UPPER_SNAKE_CASE (e.g., "my-app" -> "MY_APP")
function toUpperSnakeCase(str) {
  return str
    .split(/[-\s]+/)
    .join('_')
    .toUpperCase();
}

// Convert to snake_case (e.g., "my-app" -> "my_app")
function toSnakeCase(str) {
  return str
    .split(/[-\s]+/)
    .join('_')
    .toLowerCase();
}

// Convert to Title Case (e.g., "my-app" -> "My App")
function toTitleCase(str) {
  return str
    .split(/[-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Convert to kebab-case (already in this format usually)
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// Generate all replacement mappings for template placeholders
function generateReplacements(
  projectName,
  orgName,
  githubRepo = '',
  terraformCloudOrg = '',
  terraformCloudWorkspace = ''
) {
  const kebab = toKebabCase(projectName);
  const pascal = toPascalCase(projectName);
  const camel = toCamelCase(projectName);
  const upperSnake = toUpperSnakeCase(projectName);
  const snake = toSnakeCase(projectName);
  const title = toTitleCase(projectName);

  return {
    // Replace template placeholders with actual values
    '{{projectName}}': kebab,
    '{{projectNamePascal}}': pascal,
    '{{projectNameCamel}}': camel,
    '{{projectNameUpper}}': upperSnake,
    '{{projectNameSnake}}': snake,
    '{{projectNameTitle}}': title,
    '{{orgName}}': orgName,
    '{{githubRepo}}': githubRepo || 'username/repo',
    '{{terraformCloudOrg}}': terraformCloudOrg || 'your-org',
    '{{terraformCloudWorkspace}}': terraformCloudWorkspace || 'your-workspace',

    // Also handle any escaped versions
    '\\{\\{projectName\\}\\}': kebab,
    '\\{\\{projectNamePascal\\}\\}': pascal,
    '\\{\\{projectNameSnake\\}\\}': snake,
    '\\{\\{orgName\\}\\}': orgName,
    '\\{\\{githubRepo\\}\\}': githubRepo || 'username/repo',
    '\\{\\{terraformCloudOrg\\}\\}': terraformCloudOrg || 'your-org',
    '\\{\\{terraformCloudWorkspace\\}\\}':
      terraformCloudWorkspace || 'your-workspace',
  };
}

// Export all helpers for Plop
module.exports = {
  toPascalCase,
  toCamelCase,
  toUpperSnakeCase,
  toSnakeCase,
  toTitleCase,
  toKebabCase,
  generateReplacements,
};
