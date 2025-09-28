// scripts/postinstall.js
const fs = require('fs');
const path = require('path');

console.log('Post-install: Building TypeScript...');
const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
  console.warn('Build failed in postinstall, run manually.');
}

// Create example config if not exists
const configPath = path.join(__dirname, '..', 'c2cai.config.json');
if (!fs.existsSync(configPath)) {
  fs.copyFileSync(path.join(__dirname, '..', '.env.c2cai'), path.join(__dirname, '..', '.env'));
  console.log('Example .env created. Set your OPENAI_API_KEY.');
}