#!/usr/bin/env node

// Cross-platform development script
process.env.NODE_ENV = 'development';

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const tsx = spawn('npx', ['tsx', 'server/index.ts'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

tsx.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

tsx.on('error', (error) => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});