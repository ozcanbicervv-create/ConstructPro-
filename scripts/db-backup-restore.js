#!/usr/bin/env node

/**
 * Database Backup and Restore Script
 * Supports both SQLite and PostgreSQL databases
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(process.cwd(), 'db', 'backups');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
  }
}

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function parsePostgreSQLUrl(url) {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid PostgreSQL URL format');
  }
  
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5]
  };
}

function backupSQLite() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('file:')) {
    throw new Error('SQLite DATABASE_URL not found or invalid');
  }

  const dbPath = dbUrl.replace('file:', '');
  const timestamp = getTimestamp();
  const backupPath = path.join(BACKUP_DIR, `sqlite-backup-${timestamp}.db`);

  console.log(`📦 Backing up SQLite database...`);
  console.log(`Source: ${dbPath}`);
  console.log(`Destination: ${backupPath}`);

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found: ${dbPath}`);
  }

  fs.copyFileSync(dbPath, backupPath);
  console.log('✅ SQLite backup completed');
  return backupPath;
}

function backupPostgreSQL() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('postgresql:')) {
    throw new Error('PostgreSQL DATABASE_URL not found or invalid');
  }

  const dbConfig = parsePostgreSQLUrl(dbUrl);
  const timestamp = getTimestamp();
  const backupPath = path.join(BACKUP_DIR, `postgresql-backup-${timestamp}.sql`);

  console.log(`📦 Backing up PostgreSQL database...`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`Destination: ${backupPath}`);

  // Set password environment variable for pg_dump
  const env = { ...process.env, PGPASSWORD: dbConfig.password };

  const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${backupPath}" --verbose`;

  try {
    execSync(command, { env, stdio: 'inherit' });
    console.log('✅ PostgreSQL backup completed');
    return backupPath;
  } catch (error) {
    console.error('❌ PostgreSQL backup failed:', error.message);
    throw error;
  }
}

function restoreSQLite(backupPath) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('file:')) {
    throw new Error('SQLite DATABASE_URL not found or invalid');
  }

  const dbPath = dbUrl.replace('file:', '');
  
  console.log(`🔄 Restoring SQLite database...`);
  console.log(`Source: ${backupPath}`);
  console.log(`Destination: ${dbPath}`);

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  // Create backup of current database
  if (fs.existsSync(dbPath)) {
    const currentBackup = `${dbPath}.backup-${getTimestamp()}`;
    fs.copyFileSync(dbPath, currentBackup);
    console.log(`📋 Current database backed up to: ${currentBackup}`);
  }

  fs.copyFileSync(backupPath, dbPath);
  console.log('✅ SQLite restore completed');
}

function restorePostgreSQL(backupPath) {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || !dbUrl.startsWith('postgresql:')) {
    throw new Error('PostgreSQL DATABASE_URL not found or invalid');
  }

  const dbConfig = parsePostgreSQLUrl(dbUrl);
  
  console.log(`🔄 Restoring PostgreSQL database...`);
  console.log(`Source: ${backupPath}`);
  console.log(`Database: ${dbConfig.database}`);

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  // Set password environment variable for psql
  const env = { ...process.env, PGPASSWORD: dbConfig.password };

  // Drop and recreate database
  console.log('🗑️  Dropping existing database...');
  try {
    execSync(`dropdb -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} ${dbConfig.database}`, { env });
  } catch (error) {
    console.log('ℹ️  Database might not exist, continuing...');
  }

  console.log('🆕 Creating new database...');
  execSync(`createdb -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} ${dbConfig.database}`, { env });

  console.log('📥 Importing backup...');
  const command = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${backupPath}"`;
  
  try {
    execSync(command, { env, stdio: 'inherit' });
    console.log('✅ PostgreSQL restore completed');
  } catch (error) {
    console.error('❌ PostgreSQL restore failed:', error.message);
    throw error;
  }
}

function listBackups() {
  console.log('📋 Available backups:');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('No backups found. Backup directory does not exist.');
    return [];
  }

  const files = fs.readdirSync(BACKUP_DIR);
  const backups = files.filter(file => 
    file.includes('backup') && (file.endsWith('.db') || file.endsWith('.sql'))
  );

  if (backups.length === 0) {
    console.log('No backup files found.');
    return [];
  }

  backups.forEach((backup, index) => {
    const filePath = path.join(BACKUP_DIR, backup);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`${index + 1}. ${backup} (${size} MB) - ${stats.mtime.toLocaleString()}`);
  });

  return backups;
}

function main() {
  const command = process.argv[2];
  const backupFile = process.argv[3];

  ensureBackupDir();

  try {
    switch (command) {
      case 'backup':
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
          throw new Error('DATABASE_URL environment variable not set');
        }

        let backupPath;
        if (dbUrl.startsWith('file:')) {
          backupPath = backupSQLite();
        } else if (dbUrl.startsWith('postgresql:')) {
          backupPath = backupPostgreSQL();
        } else {
          throw new Error('Unsupported database type. Only SQLite and PostgreSQL are supported.');
        }

        console.log(`\n🎉 Backup completed successfully!`);
        console.log(`📁 Backup location: ${backupPath}`);
        break;

      case 'restore':
        if (!backupFile) {
          console.error('❌ Please specify a backup file to restore');
          console.log('Usage: node db-backup-restore.js restore <backup-file>');
          process.exit(1);
        }

        const fullBackupPath = path.isAbsolute(backupFile) 
          ? backupFile 
          : path.join(BACKUP_DIR, backupFile);

        if (backupFile.endsWith('.db')) {
          restoreSQLite(fullBackupPath);
        } else if (backupFile.endsWith('.sql')) {
          restorePostgreSQL(fullBackupPath);
        } else {
          throw new Error('Unsupported backup file format. Use .db for SQLite or .sql for PostgreSQL');
        }

        console.log('\n🎉 Restore completed successfully!');
        break;

      case 'list':
        listBackups();
        break;

      case 'cleanup':
        const backups = listBackups();
        if (backups.length > 5) {
          console.log(`\n🧹 Cleaning up old backups (keeping latest 5)...`);
          const sortedBackups = backups
            .map(file => ({
              name: file,
              path: path.join(BACKUP_DIR, file),
              mtime: fs.statSync(path.join(BACKUP_DIR, file)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime);

          const toDelete = sortedBackups.slice(5);
          toDelete.forEach(backup => {
            fs.unlinkSync(backup.path);
            console.log(`🗑️  Deleted: ${backup.name}`);
          });
          console.log(`✅ Cleanup completed. Deleted ${toDelete.length} old backups.`);
        } else {
          console.log('No cleanup needed. Less than 5 backups found.');
        }
        break;

      default:
        console.log('🗄️  Database Backup and Restore Tool');
        console.log('\nUsage:');
        console.log('  node db-backup-restore.js backup           - Create a backup');
        console.log('  node db-backup-restore.js restore <file>   - Restore from backup');
        console.log('  node db-backup-restore.js list             - List available backups');
        console.log('  node db-backup-restore.js cleanup          - Remove old backups (keep latest 5)');
        console.log('\nExamples:');
        console.log('  node db-backup-restore.js backup');
        console.log('  node db-backup-restore.js restore sqlite-backup-2024-01-15T10-30-00.db');
        console.log('  node db-backup-restore.js restore postgresql-backup-2024-01-15T10-30-00.sql');
        break;
    }
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { backupSQLite, backupPostgreSQL, restoreSQLite, restorePostgreSQL, listBackups };