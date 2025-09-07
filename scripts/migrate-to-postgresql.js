#!/usr/bin/env node

/**
 * Migration script from SQLite to PostgreSQL
 * This script helps migrate existing data from SQLite to PostgreSQL
 */

const fs = require('fs');
const path = require('path');

const { PrismaClient } = require('@prisma/client');

// SQLite client (old database)
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

// PostgreSQL client (new database)
const postgresqlPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...');
  
  try {
    // Check if SQLite database exists
    const sqliteDbPath = path.join(process.cwd(), 'dev.db');
    if (!fs.existsSync(sqliteDbPath)) {
      console.log('ℹ️  No SQLite database found. Skipping data migration.');
      return;
    }

    console.log('📊 Migrating Users...');
    const users = await sqlitePrisma.user.findMany({
      include: {
        accounts: true,
        sessions: true
      }
    });

    for (const user of users) {
      const { accounts, sessions, ...userData } = user;
      
      // Create user in PostgreSQL
      const newUser = await postgresqlPrisma.user.upsert({
        where: { email: user.email },
        update: userData,
        create: {
          ...userData,
          // Set default values for new fields
          mfaEnabled: false,
          backupCodes: [],
          preferences: null
        }
      });

      // Migrate accounts
      for (const account of accounts) {
        await postgresqlPrisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          },
          update: { ...account, userId: newUser.id },
          create: { ...account, userId: newUser.id }
        });
      }

      // Migrate sessions
      for (const session of sessions) {
        await postgresqlPrisma.session.upsert({
          where: { sessionToken: session.sessionToken },
          update: { ...session, userId: newUser.id },
          create: { ...session, userId: newUser.id }
        });
      }
    }

    console.log(`✅ Migrated ${users.length} users successfully`);

    // Migrate verification tokens
    console.log('🔑 Migrating verification tokens...');
    const verificationTokens = await sqlitePrisma.verificationToken.findMany();
    
    for (const token of verificationTokens) {
      await postgresqlPrisma.verificationToken.upsert({
        where: {
          identifier_token: {
            identifier: token.identifier,
            token: token.token
          }
        },
        update: token,
        create: token
      });
    }

    console.log(`✅ Migrated ${verificationTokens.length} verification tokens successfully`);

    // Note: Posts table is being replaced by the new construction models
    // If you have important post data, add migration logic here

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresqlPrisma.$disconnect();
  }
}

async function main() {
  try {
    await migrateData();
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateData };