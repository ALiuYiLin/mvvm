/**
 * Version bump script for @actview packages
 * 
 * Usage:
 *   node build/bump-version.mjs           # Bump patch version for all packages
 *   node build/bump-version.mjs patch     # Bump patch version (1.0.0 -> 1.0.1)
 *   node build/bump-version.mjs minor     # Bump minor version (1.0.0 -> 1.1.0)
 *   node build/bump-version.mjs major     # Bump major version (1.0.0 -> 2.0.0)
 *   node build/bump-version.mjs 1.2.3     # Set specific version
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const packagesDir = resolve(rootDir, 'packages');

/**
 * Get all package directories
 */
async function getPackages() {
  const entries = await readdir(packagesDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

/**
 * Bump version string
 */
function bumpVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Check if string is a valid semver
 */
function isValidVersion(str) {
  return /^\d+\.\d+\.\d+$/.test(str);
}

/**
 * Update package.json version
 */
async function updatePackageVersion(packagePath, newVersion) {
  const content = await readFile(packagePath, 'utf-8');
  const pkgJson = JSON.parse(content);
  const oldVersion = pkgJson.version;
  pkgJson.version = newVersion;
  
  await writeFile(packagePath, JSON.stringify(pkgJson, null, 2) + '\n');
  
  return { name: pkgJson.name, oldVersion, newVersion };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const bumpType = args[0] || 'patch';
  
  console.log('🔄 Actview Version Bump\n');
  console.log('='.repeat(40));

  const packages = await getPackages();
  const results = [];

  // Get current version from first package to determine new version
  const firstPkgPath = resolve(packagesDir, packages[0], 'package.json');
  const firstPkgContent = await readFile(firstPkgPath, 'utf-8');
  const firstPkg = JSON.parse(firstPkgContent);
  
  // Determine new version
  let newVersion;
  if (isValidVersion(bumpType)) {
    // Specific version provided
    newVersion = bumpType;
  } else {
    // Bump type provided
    newVersion = bumpVersion(firstPkg.version, bumpType);
  }

  console.log(`📦 Bump type: ${isValidVersion(bumpType) ? 'set' : bumpType}`);
  console.log(`📦 New version: ${newVersion}\n`);

  // Update all packages
  for (const pkg of packages) {
    const pkgPath = resolve(packagesDir, pkg, 'package.json');
    if (existsSync(pkgPath)) {
      const result = await updatePackageVersion(pkgPath, newVersion);
      results.push(result);
      console.log(`✅ ${result.name}: ${result.oldVersion} -> ${result.newVersion}`);
    }
  }

  console.log('\n' + '='.repeat(40));
  console.log(`🎉 Updated ${results.length} packages to version ${newVersion}\n`);
}

main().catch(console.error);
