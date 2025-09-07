import { PrismaClient, UserRole, ProjectStatus, ProjectPriority, TaskStatus, TaskPriority, DocumentType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create sample users with construction roles
  const hashedPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@constructpro.com' },
    update: {},
    create: {
      email: 'admin@constructpro.com',
      name: 'System Administrator',
      firstName: 'System',
      lastName: 'Administrator',
      password: hashedPassword,
      role: UserRole.ADMIN,
      title: 'System Administrator',
      company: 'ConstructPro',
      phone: '+1-555-0001',
      mfaEnabled: false
    },
  })

  const projectManager = await prisma.user.upsert({
    where: { email: 'manager@constructpro.com' },
    update: {},
    create: {
      email: 'manager@constructpro.com',
      name: 'John Mitchell',
      firstName: 'John',
      lastName: 'Mitchell',
      password: hashedPassword,
      role: UserRole.PROJECT_MANAGER,
      title: 'Senior Project Manager',
      company: 'BuildCorp Construction',
      phone: '+1-555-0002',
      mfaEnabled: true
    },
  })

  const siteSupervisor = await prisma.user.upsert({
    where: { email: 'supervisor@constructpro.com' },
    update: {},
    create: {
      email: 'supervisor@constructpro.com',
      name: 'Sarah Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      password: hashedPassword,
      role: UserRole.SITE_SUPERVISOR,
      title: 'Site Supervisor',
      company: 'BuildCorp Construction',
      phone: '+1-555-0003'
    },
  })

  const worker1 = await prisma.user.upsert({
    where: { email: 'worker1@constructpro.com' },
    update: {},
    create: {
      email: 'worker1@constructpro.com',
      name: 'Mike Rodriguez',
      firstName: 'Mike',
      lastName: 'Rodriguez',
      password: hashedPassword,
      role: UserRole.WORKER,
      title: 'Electrician',
      company: 'ElectricPro Services',
      phone: '+1-555-0004',
    },
  })

  const worker2 = await prisma.user.upsert({
    where: { email: 'worker2@constructpro.com' },
    update: {},
    create: {
      email: 'worker2@constructpro.com',
      name: 'Lisa Chen',
      firstName: 'Lisa',
      lastName: 'Chen',
      password: hashedPassword,
      role: UserRole.WORKER,
      title: 'Plumber',
      company: 'PlumbingPro LLC',
      phone: '+1-555-0005',
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'client@constructpro.com' },
    update: {},
    create: {
      email: 'client@constructpro.com',
      name: 'Robert Williams',
      firstName: 'Robert',
      lastName: 'Williams',
      password: hashedPassword,
      role: UserRole.CLIENT,
      title: 'Property Owner',
      company: 'Williams Real Estate',
      phone: '+1-555-0006',
    },
  })

  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@constructpro.com' },
    update: {},
    create: {
      email: 'supplier@constructpro.com',
      name: 'David Thompson',
      firstName: 'David',
      lastName: 'Thompson',
      password: hashedPassword,
      role: UserRole.SUPPLIER,
      title: 'Sales Manager',
      company: 'BuildMaterials Inc',
      phone: '+1-555-0007',
    },
  })

  console.log('✅ Created users')

  // Create material suppliers
  const supplier1 = await prisma.materialSupplier.create({
    data: {
      name: 'BuildMaterials Inc',
      contactInfo: null,
      rating: 4.5
    }
  })

  const supplier2 = await prisma.materialSupplier.create({
    data: {
      name: 'SteelWorks Supply',
      contactInfo: null,
      rating: 4.8
    }
  })

  console.log('✅ Created material suppliers')

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Downtown Office Complex',
      description: 'Construction of a 15-story office building in downtown area with modern amenities and sustainable features.',
      managerId: projectManager.id,
      status: ProjectStatus.IN_PROGRESS,
      priority: ProjectPriority.HIGH,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-06-30'),
      budget: 15000000.00,
      location: '789 Business District, Downtown, DT 11111',
      metadata: null
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Residential Housing Development',
      description: 'Development of 50 single-family homes with community amenities including park and playground.',
      managerId: projectManager.id,
      status: ProjectStatus.PLANNING,
      priority: ProjectPriority.MEDIUM,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-12-31'),
      budget: 25000000.00,
      location: 'Greenfield Subdivision, Suburbia, SB 22222',
      metadata: null
    }
  })

  console.log('✅ Created projects')

  // Create project members
  await prisma.projectMember.createMany({
    data: [
      { projectId: project1.id, userId: siteSupervisor.id, role: 'SUPERVISOR' },
      { projectId: project1.id, userId: worker1.id, role: 'MEMBER' },
      { projectId: project1.id, userId: worker2.id, role: 'MEMBER' },
      { projectId: project1.id, userId: client.id, role: 'VIEWER' },
      { projectId: project2.id, userId: siteSupervisor.id, role: 'SUPERVISOR' },
      { projectId: project2.id, userId: worker1.id, role: 'MEMBER' },
      { projectId: project2.id, userId: client.id, role: 'VIEWER' },
    ]
  })

  console.log('✅ Created project members')

  // Create project phases
  await prisma.projectPhase.createMany({
    data: [
      {
        projectId: project1.id,
        name: 'Foundation & Excavation',
        description: 'Site preparation and foundation work',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-30'),
        status: 'COMPLETED',
        order: 1
      },
      {
        projectId: project1.id,
        name: 'Structural Framework',
        description: 'Steel framework and concrete work',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-09-30'),
        status: 'IN_PROGRESS',
        order: 2
      },
      {
        projectId: project1.id,
        name: 'MEP Installation',
        description: 'Mechanical, Electrical, and Plumbing systems',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-02-28'),
        status: 'PLANNED',
        order: 3
      },
      {
        projectId: project1.id,
        name: 'Interior Finishing',
        description: 'Interior walls, flooring, and fixtures',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-05-31'),
        status: 'PLANNED',
        order: 4
      }
    ]
  })

  console.log('✅ Created project phases')

  // Create milestones
  await prisma.milestone.createMany({
    data: [
      {
        projectId: project1.id,
        name: 'Foundation Complete',
        description: 'All foundation work completed and inspected',
        dueDate: new Date('2024-04-30'),
        completed: true,
        completedAt: new Date('2024-04-28')
      },
      {
        projectId: project1.id,
        name: 'Structural Framework 50%',
        description: 'Half of the structural framework completed',
        dueDate: new Date('2024-07-15'),
        completed: false
      },
      {
        projectId: project1.id,
        name: 'MEP Rough-in Complete',
        description: 'All MEP rough-in work completed',
        dueDate: new Date('2025-01-31'),
        completed: false
      }
    ]
  })

  console.log('✅ Created milestones')

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      assignedTo: worker1.id,
      createdBy: projectManager.id,
      title: 'Install electrical panels on floors 8-10',
      description: 'Install and wire electrical distribution panels for floors 8, 9, and 10. Ensure all connections meet code requirements.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2024-12-15'),
      estimatedHours: 24.0,
      actualHours: 16.5,
      metadata: null
    }
  })

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      assignedTo: worker2.id,
      createdBy: siteSupervisor.id,
      title: 'Plumbing rough-in for restrooms',
      description: 'Complete plumbing rough-in for all restroom facilities on floors 5-7.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date('2024-12-20'),
      estimatedHours: 32.0,
      metadata: null
    }
  })

  const task3 = await prisma.task.create({
    data: {
      projectId: project2.id,
      assignedTo: worker1.id,
      createdBy: projectManager.id,
      title: 'Site survey and utility marking',
      description: 'Conduct detailed site survey and mark all underground utilities before excavation begins.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.URGENT,
      dueDate: new Date('2024-02-28'),
      estimatedHours: 16.0,
      actualHours: 14.0,
      metadata: null
    }
  })

  console.log('✅ Created tasks')

  // Create task comments
  await prisma.taskComment.createMany({
    data: [
      {
        taskId: task1.id,
        userId: worker1.id,
        content: 'Started work on floor 8. Panel installation is going smoothly. Should finish this floor by end of day.'
      },
      {
        taskId: task1.id,
        userId: siteSupervisor.id,
        content: 'Great progress! Make sure to document all wire runs for the inspection report.'
      },
      {
        taskId: task2.id,
        userId: projectManager.id,
        content: 'Please coordinate with the electrical team to avoid conflicts in the ceiling space.'
      },
      {
        taskId: task3.id,
        userId: worker1.id,
        content: 'Survey completed. Found an unmarked gas line on the east side. Updated the site plan accordingly.'
      }
    ]
  })

  console.log('✅ Created task comments')

  // Create materials
  const material1 = await prisma.material.create({
    data: {
      projectId: project1.id,
      name: 'Structural Steel Beams',
      description: 'W14x90 structural steel beams for floors 8-15',
      category: 'Structural',
      unit: 'linear feet',
      quantity: 2400.0,
      unitPrice: 45.50,
      totalCost: 109200.00,
      supplierId: supplier2.id,
      specifications: null
    }
  })

  const material2 = await prisma.material.create({
    data: {
      projectId: project1.id,
      name: 'Electrical Wire - 12 AWG',
      description: 'THHN copper wire for electrical installations',
      category: 'Electrical',
      unit: 'feet',
      quantity: 15000.0,
      unitPrice: 1.25,
      totalCost: 18750.00,
      supplierId: supplier1.id,
      specifications: null
    }
  })

  const material3 = await prisma.material.create({
    data: {
      projectId: project1.id,
      name: 'PVC Pipe - 4 inch',
      description: 'Schedule 40 PVC pipe for plumbing systems',
      category: 'Plumbing',
      unit: 'linear feet',
      quantity: 800.0,
      unitPrice: 8.75,
      totalCost: 7000.00,
      supplierId: supplier1.id,
      specifications: null
    }
  })

  console.log('✅ Created materials')

  // Create material orders
  await prisma.materialOrder.createMany({
    data: [
      {
        materialId: material1.id,
        supplierId: supplier2.id,
        quantity: 2400.0,
        unitPrice: 45.50,
        totalCost: 109200.00,
        status: 'DELIVERED',
        orderDate: new Date('2024-04-01')
      },
      {
        materialId: material2.id,
        supplierId: supplier1.id,
        quantity: 15000.0,
        unitPrice: 1.25,
        totalCost: 18750.00,
        status: 'SHIPPED',
        orderDate: new Date('2024-11-15')
      },
      {
        materialId: material3.id,
        supplierId: supplier1.id,
        quantity: 800.0,
        unitPrice: 8.75,
        totalCost: 7000.00,
        status: 'CONFIRMED',
        orderDate: new Date('2024-11-20')
      }
    ]
  })

  console.log('✅ Created material orders')

  // Create project documents
  await prisma.projectDocument.createMany({
    data: [
      {
        projectId: project1.id,
        name: 'Architectural Plans - Floors 1-5',
        description: 'Detailed architectural drawings for the first five floors',
        filePath: '/documents/project1/architectural-plans-1-5.pdf',
        fileSize: 15728640, // 15MB
        mimeType: 'application/pdf',
        type: DocumentType.BLUEPRINT,
        version: '2.1',
        uploadedBy: projectManager.id
      },
      {
        projectId: project1.id,
        name: 'Electrical Specifications',
        description: 'Complete electrical system specifications and requirements',
        filePath: '/documents/project1/electrical-specs.pdf',
        fileSize: 5242880, // 5MB
        mimeType: 'application/pdf',
        type: DocumentType.SPECIFICATION,
        version: '1.3',
        uploadedBy: projectManager.id
      },
      {
        projectId: project1.id,
        name: 'Construction Contract',
        description: 'Main construction contract with BuildCorp',
        filePath: '/documents/project1/main-contract.pdf',
        fileSize: 2097152, // 2MB
        mimeType: 'application/pdf',
        type: DocumentType.CONTRACT,
        version: '1.0',
        uploadedBy: admin.id
      },
      {
        projectId: project1.id,
        name: 'Site Progress Photos - Week 45',
        description: 'Weekly progress photos showing current construction status',
        filePath: '/documents/project1/progress-photos-week45.zip',
        fileSize: 52428800, // 50MB
        mimeType: 'application/zip',
        type: DocumentType.PHOTO,
        version: '1.0',
        uploadedBy: siteSupervisor.id
      }
    ]
  })

  console.log('✅ Created project documents')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log('- 7 users created (Admin, Project Manager, Site Supervisor, 2 Workers, Client, Supplier)')
  console.log('- 2 material suppliers created')
  console.log('- 2 projects created (Office Complex, Housing Development)')
  console.log('- 7 project members assigned')
  console.log('- 4 project phases created')
  console.log('- 3 milestones created')
  console.log('- 3 tasks created with comments')
  console.log('- 3 materials created with orders')
  console.log('- 4 project documents created')
  console.log('\n🔐 Login credentials for testing:')
  console.log('Email: admin@constructpro.com | Password: password123')
  console.log('Email: manager@constructpro.com | Password: password123')
  console.log('Email: supervisor@constructpro.com | Password: password123')
  console.log('Email: worker1@constructpro.com | Password: password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })