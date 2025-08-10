#!/usr/bin/env node

// Cross-platform start script
process.env.NODE_ENV = 'production';

import('./dist/index.js')
  .then(() => {
    console.log('✅ Production server started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  });