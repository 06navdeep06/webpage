/**
 * Build script for Netlify deployment.
 * Generates js/env.js from environment variables set in the Netlify dashboard.
 *
 * Usage (netlify.toml):  command = "node build-env.js"
 */

const fs = require('fs');
const path = require('path');

const pat = process.env.GITHUB_PAT || '';
const username = process.env.GITHUB_USERNAME || '06navdeep06';

const content = `/**
 * Runtime environment configuration.
 * Auto-generated during build — DO NOT EDIT.
 */
window.__ENV = Object.freeze({
  GITHUB_PAT: '${pat}',
  GITHUB_USERNAME: '${username}',
});
`;

const dest = path.join(__dirname, 'js', 'env.js');
fs.writeFileSync(dest, content, 'utf8');
console.log('✓ js/env.js generated (token present:', !!pat, ')');
