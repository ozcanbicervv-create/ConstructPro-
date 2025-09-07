#!/usr/bin/env node

/**
 * PostgreSQL Setup Script
 * This script helps set up PostgreSQL database for ConstructPro
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'constructpro_dev';
const DB_USER = 'constructpro';
const DB_PASSWORD = 'password';
const DB_HOST = 'localhost';
const DB_PORT = '5432';

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function checkPostgreSQLInstallation() {
  console.log('🔍 Checking PostgreSQL installation...');
  try {
    execSync('psql --version', { stdio: 'pipe' });
    console.log('✅ PostgreSQL is installed');
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL is not installed or not in PATH');
    console.log('\n📋 Installation instructions:');
    console.log('Windows: Download from https://www.postgresql.org/download/windows/');
    console.log('macOS: brew install postgresql');
    console.log('Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib');
    console.log('CentOS/RHEL: sudo yum install postgresql-server postgresql-contrib');
    return false;
  }
}

function createDatabase() {
  console.log('🗄️  Setting up PostgreSQL database...');
  
  try {
    // Create user
    console.log(`Creating user: ${DB_USER}`);
    execSync(`psql -U postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"`, { stdio: 'pipe' });
  } catch (error) {
    console.log('ℹ️  User might already exist, continuing...');
  }

  try {
    // Create database
    console.log(`Creating database: ${DB_NAME}`);
    execSync(`psql -U postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"`, { stdio: 'pipe' });
  } catch (error) {
    console.log('ℹ️  Database might already exist, continuing...');
  }

  try {
    // Grant privileges
    console.log('Granting privileges...');
    execSync(`psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"`, { stdio: 'pipe' });
    execSync(`psql -U postgres -c "ALTER USER ${DB_USER} CREATEDB;"`, { stdio: 'pipe' });
  } catch (error) {
    console.log('ℹ️  Privileges might already be granted, continuing...');
  }

  console.log('✅ Database setup completed');
}

function updateEnvironmentFile() {
  console.log('📝 Updating environment configuration...');
  
  const envPath = path.join(process.cwd(), '.env');
  const postgresUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or add DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    // Comment out SQLite and add PostgreSQL
    envContent = envContent.replace(
      /DATABASE_URL="file:\.\/dev\.db"/,
      '# DATABASE_URL="file:./dev.db"  # SQLite (commented out)\nDATABASE_URL="' + postgresUrl + '"'
    );
  } else {
    envContent += `\n# Database Configuration\nDATABASE_URL="${postgresUrl}"\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file updated');
  console.log(`📋 Database URL: ${postgresUrl}`);
}

function runPrismaMigration() {
  console.log('🔄 Running Prisma migration...');
  
  try {
    // Generate Prisma client
    runCommand('npm run db:generate', 'Generating Prisma client');
    
    // Push schema to database
    runCommand('npm run db:push', 'Pushing schema to database');
    
    // Run seed script
    runCommand('npm run db:seed', 'Seeding database with sample data');
    
  } catch (error) {
    console.error('❌ Prisma migration failed:', error.message);
    console.log('\n🔧 Manual steps to try:');
    console.log('1. npm run db:generate');
    console.log('2. npm run db:push');
    console.log('3. npm run db:seed');
    throw error;
  }
}

async function main() {
  console.log('🚀 PostgreSQL Setup for ConstructPro\n');

  try {
    // Check if PostgreSQL is installed
    if (!checkPostgreSQLInstallation()) {
      console.log('\n❌ Please install PostgreSQL first and try again.');
      process.exit(1);
    }

    // Create database and user
    createDatabase();

    // Update environment file
    updateEnvironmentFile();

    // Run Prisma migration
    runPrismaMigration();

    console.log('\n🎉 PostgreSQL setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Access the database: npm run db:studio');
    console.log('3. View logs: Check your application logs for any database connection issues');
    
    console.log('\n🔐 Database credentials:');
    console.log(`Host: ${DB_HOST}`);
    console.log(`Port: ${DB_PORT}`);
    console.log(`Database: ${DB_NAME}`);
    console.log(`Username: ${DB_USER}`);
    console.log(`Password: ${DB_PASSWORD}`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure PostgreSQL service is running');
    console.log('2. Check if you have permission to create databases');
    console.log('3. Verify PostgreSQL is accessible via command line');
    console.log('4. Check firewall settings if using remote database');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };