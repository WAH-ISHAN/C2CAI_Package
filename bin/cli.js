#!/usr/bin/env node

const { program } = require('commander');
const { execSync } = require('child_process');
const path = require('path');

program
  .name('c2cai')
  .description('c2cai CLI')
  .version('1.0.0')
  .option('-s, --serve', 'Start the server')
  .option('-i, --index', 'Index the site')
  .parse();

const options = program.opts();

if (options.serve) {
  execSync('npm run serve', { stdio: 'inherit', cwd: path.dirname(__filename) + '/../' });
} else if (options.index) {
  execSync('node dist/indexer.js', { stdio: 'inherit', cwd: path.dirname(__filename) + '/../' });
} else {
  program.help();
}