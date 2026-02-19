/**
 * Netlify deployment helper script
 * This script prepares the project for Netlify deployment by:
 * 1. Injecting environment variables into env.js
 * 2. Ensuring all files are ready for deployment
 */

const fs = require('fs');
const path = require('path');

// Read environment variables from process.env
const githubPat = process.env.GITHUB_PAT || '';
const githubUsername = process.env.GITHUB_USERNAME || '';

// Create the env.js content
const envContent = `/**
 * Runtime environment configuration.
 *
 * IMPORTANT: This file is git-ignored so tokens are never committed.
 */
window.__ENV = Object.freeze({
  GITHUB_PAT: '${githubPat}',
  GITHUB_USERNAME: '${githubUsername}',
});
`;

// Write to env.js
const envPath = path.join(__dirname, 'js', 'env.js');
fs.writeFileSync(envPath, envContent);

console.log('✅ env.js updated with environment variables');
console.log('🚀 Ready for Netlify deployment');
