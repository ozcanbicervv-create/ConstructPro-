#!/usr/bin/env node

/**
 * Development Environment Setup Script
 * Automates the setup process for new developers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists`);
    return true;
  } else {
    console.log(`⚠️  ${description} not found`);
    return false;
  }
}

function setupEnvironment() {
  console.log('🚀 Setting up ConstructPro development environment...\n');

  // Check Node.js version
  console.log('📋 Checking system requirements...');
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
    console.log(`✅ npm: ${npmVersion}`);
  } catch (error) {
    console.error('❌ Node.js or npm not found. Please install Node.js first.');
    process.exit(1);
  }

  // Check environment files
  console.log('\n📋 Checking environment configuration...');
  const envExists = checkFile('.env', '.env file');
  const envExampleExists = checkFile('.env.example', '.env.example file');
  
  if (!envExists && envExampleExists) {
    console.log('📝 Creating .env file from .env.example...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created. Please update it with your configuration.');
  }

  // Install dependencies
  runCommand('npm ci', 'Installing dependencies');

  // Setup database
  runCommand('npm run db:generate', 'Generating Prisma client');
  runCommand('npm run db:push', 'Setting up database');

  // Setup Git hooks
  runCommand('npm run prepare', 'Setting up Git hooks');

  // Run initial checks
  runCommand('npm run type-check', 'Running TypeScript checks');
  runCommand('npm run lint', 'Running linting checks');
  runCommand('npm run test', 'Running tests');

  console.log('\n🎉 Development environment setup completed!');
  console.log('\n📚 Next steps:');
  console.log('1. Update .env file with your configuration');
  console.log('2. Run "npm run dev" to start the development server');
  console.log('3. Visit http://localhost:3000 to see the application');
  console.log('4. Read docs/development-setup.md for detailed information');
}

// Run setup if called directly
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment };