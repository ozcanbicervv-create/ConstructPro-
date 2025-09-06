import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const hashedPassword = await hash('123456', 12);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@constructpro.com' },
    update: {},
    create: {
      email: 'admin@constructpro.com',
      name: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN',
      company: 'ConstructPro',
      title: 'System Administrator',
      phone: '+1234567890',
    },
  });

  // Manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@constructpro.com' },
    update: {},
    create: {
      email: 'manager@constructpro.com',
      name: 'Project Manager',
      firstName: 'John',
      lastName: 'Smith',
      password: hashedPassword,
      role: 'MANAGER',
      company: 'ABC Construction',
      title: 'Project Manager',
      phone: '+1234567891',
    },
  });

  // Worker user
  const worker = await prisma.user.upsert({
    where: { email: 'worker@constructpro.com' },
    update: {},
    create: {
      email: 'worker@constructpro.com',
      name: 'Construction Worker',
      firstName: 'Mike',
      lastName: 'Johnson',
      password: hashedPassword,
      role: 'WORKER',
      company: 'ABC Construction',
      title: 'Site Supervisor',
      phone: '+1234567892',
    },
  });

  // Your personal super admin user
  const superAdmin = await prisma.user.upsert({
    where: { email: 'mrbcr@constructpro.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'mrbcr@constructpro.com',
      name: 'MRBCR - Super Admin',
      firstName: 'MRBCR',
      lastName: 'Developer',
      password: hashedPassword,
      role: 'ADMIN',
      company: 'Vovelet-Tech',
      title: 'Lead Developer & System Architect',
      phone: '+90555000000',
    },
  });

  // Client user for testing
  const client = await prisma.user.upsert({
    where: { email: 'client@constructpro.com' },
    update: {},
    create: {
      email: 'client@constructpro.com',
      name: 'Client User',
      firstName: 'Sarah',
      lastName: 'Williams',
      password: hashedPassword,
      role: 'CLIENT',
      company: 'Williams Real Estate',
      title: 'Property Owner',
      phone: '+1234567893',
    },
  });

  console.log('✅ Database seeding completed successfully');
  console.log('📧 Test users created:');
  console.log('   🚀 SUPER ADMIN (Your Account): mrbcr@constructpro.com / 123456');
  console.log('   👨‍💼 Admin: admin@constructpro.com / 123456');
  console.log('   📋 Manager: manager@constructpro.com / 123456');
  console.log('   🔨 Worker: worker@constructpro.com / 123456');
  console.log('   👤 Client: client@constructpro.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });