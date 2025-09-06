#!/usr/bin/env node

/**
 * Database Maintenance Script
 * Provides utilities for database backup, restore, and maintenance operations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DB_PATH = path.join(__dirname, '..', 'db', 'custom.db');
const BACKUP_DIR = path.join(__dirname, '..', 'db', 'backups');

// Ensure backup directory exists
ensureDirectoryExists(BACKUP_DIR);

function getCurrentTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function backupDatabase() {
  const timestamp = getCurrentTimestamp();
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.db`);
  
  try {
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, backupPath);
      console.log(`✅ Database backed up to: ${backupPath}`);
      return backupPath;
    } else {
      console.log('⚠️  Database file not found, skipping backup');
      return null;
    }
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

function listBackups() {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .sort()
      .reverse();
    
    if (backups.length === 0) {
      console.log('No backups found');
      return;
    }
    
    console.log('Available backups:');
    backups.forEach((backup, index) => {
      const filePath = path.join(BACKUP_DIR, backup);
      const stats = fs.statSync(filePath);
      console.log(`${index + 1}. ${backup} (${stats.size} bytes, ${stats.mtime.toISOString()})`);
    });
  } catch (error) {
    console.error('❌ Failed to list backups:', error.message);
  }
}

function restoreDatabase(backupName) {
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  try {
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup file not found: ${backupName}`);
      process.exit(1);
    }
    
    // Create backup of current database before restore
    if (fs.existsSync(DB_PATH)) {
      backupDatabase();
    }
    
    fs.copyFileSync(backupPath, DB_PATH);
    console.log(`✅ Database restored from: ${backupName}`);
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  }
}

function cleanupOldBackups(keepCount = 10) {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
    
    if (backups.length <= keepCount) {
      console.log(`Only ${backups.length} backups found, no cleanup needed`);
      return;
    }
    
    const toDelete = backups.slice(keepCount);
    toDelete.forEach(backup => {
      fs.unlinkSync(backup.path);
      console.log(`🗑️  Deleted old backup: ${backup.name}`);
    });
    
    console.log(`✅ Cleanup completed, kept ${keepCount} most recent backups`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Backup current database
    backupDatabase();
    
    // Reset using Prisma
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    
    console.log('✅ Database reset completed');
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

// CLI Interface
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'backup':
    backupDatabase();
    break;
  
  case 'restore':
    if (!arg) {
      console.error('❌ Please specify backup file name');
      console.log('Usage: node scripts/maintenance.js restore <backup-filename>');
      listBackups();
      process.exit(1);
    }
    restoreDatabase(arg);
    break;
  
  case 'list':
    listBackups();
    break;
  
  case 'cleanup':
    const keepCount = arg ? parseInt(arg) : 10;
    cleanupOldBackups(keepCount);
    break;
  
  case 'reset':
    resetDatabase();
    break;
  
  default:
    console.log('Database Maintenance Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/maintenance.js backup                    # Create database backup');
    console.log('  node scripts/maintenance.js restore <backup-name>     # Restore from backup');
    console.log('  node scripts/maintenance.js list                      # List available backups');
    console.log('  node scripts/maintenance.js cleanup [keep-count]      # Cleanup old backups (default: keep 10)');
    console.log('  node scripts/maintenance.js reset                     # Reset database with backup');
    break;
}