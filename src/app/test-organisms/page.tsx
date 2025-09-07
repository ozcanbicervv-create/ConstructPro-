'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Dashboard Components
import { Dashboard } from '@/components/design-system/organisms/Dashboard';

// Data Visualization Components
import {
  ProjectProgressChart,
  CostAnalysisChart,
  GanttChart,
  type ProjectProgressData,
  type CostAnalysisData,
  type TimelineTask,
  type TimelineMilestone
} from '@/components/design-system/organisms/DataVisualization';

// Project Management Components
import {
  ProjectGrid,
  ProjectDetailView,
  ProjectFormWizard,
  type Project,
  type ProjectDetail
} from '@/components/design-system/organisms/ProjectManagement';

// Material Management Components
import {
  MaterialComparisonTable,
  SupplierDirectory,
  MaterialCostAnalysis,
  MaterialOrderingWorkflow,
  type Material,
  type Supplier,
  type MaterialPriceHistory,
  type CategoryCostData,
  type SupplierCostData,
  type OrderItem,
  type MaterialOrder
} from '@/components/design-system/organisms/MaterialManagement';

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Downtown Office Complex',
    description: 'Modern 20-story office building with sustainable features',
    status: 'active',
    priority: 'high',
    progress: 75,
    startDate: '2024-01-15',
    endDate: '2024-12-15',
    budget: 2500000,
    spent: 1875000,
    location: 'Downtown Seattle, WA',
    manager: { id: '1', name: 'John Smith', avatar: '/avatars/john.jpg' },
    team: [
      { id: '1', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Site Supervisor' },
      { id: '2', name: 'Mike Wilson', avatar: '/avatars/mike.jpg', role: 'Engineer' }
    ],
    tags: ['Commercial', 'Sustainable', 'High-rise'],
    category: 'Commercial Construction',
    client: 'TechCorp Inc.',
    isFavorite: true,
    lastUpdated: '2024-09-07'
  },
  {
    id: '2',
    name: 'Residential Tower A',
    description: 'Luxury residential tower with 150 units',
    status: 'planning',
    priority: 'medium',
    progress: 25,
    startDate: '2024-03-01',
    endDate: '2025-06-30',
    budget: 3200000,
    spent: 800000,
    location: 'Bellevue, WA',
    manager: { id: '2', name: 'Lisa Chen', avatar: '/avatars/lisa.jpg' },
    team: [
      { id: '3', name: 'David Brown', avatar: '/avatars/david.jpg', role: 'Architect' },
      { id: '4', name: 'Emma Davis', avatar: '/avatars/emma.jpg', role: 'Project Coordinator' }
    ],
    tags: ['Residential', 'Luxury', 'High-rise'],
    category: 'Residential Construction',
    client: 'Luxury Living LLC',
    isFavorite: false,
    lastUpdated: '2024-09-06'
  }
];

const mockMaterials: Material[] = [
  {
    id: '1',
    name: 'Steel I-Beams Grade A992',
    category: 'Structural Steel',
    subcategory: 'I-Beams',
    description: 'High-strength structural steel beams for commercial construction',
    specifications: {
      grade: 'A992',
      length: '20 ft',
      weight: '35 lb/ft',
      yield: '50 ksi'
    },
    pricing: {
      unitPrice: 125.50,
      unit: 'linear foot',
      minimumOrder: 100,
      bulkDiscounts: [
        { quantity: 500, discount: 5 },
        { quantity: 1000, discount: 10 }
      ]
    },
    availability: {
      inStock: true,
      quantity: 2500,
      leadTime: 7,
      location: 'Seattle Warehouse'
    },
    supplier: {
      id: '1',
      name: 'Pacific Steel Supply',
      rating: 4.8,
      verified: true,
      contact: {
        phone: '(206) 555-0123',
        email: 'orders@pacificsteel.com'
      }
    },
    quality: {
      grade: 'Premium',
      certifications: ['AISC', 'AWS', 'ISO 9001'],
      testReports: ['mill-cert-001.pdf']
    },
    sustainability: {
      ecoFriendly: true,
      carbonFootprint: 2.1,
      recyclable: true,
      certifications: ['LEED', 'Green Building']
    },
    images: ['/materials/steel-beam-1.jpg'],
    tags: ['Structural', 'Commercial', 'High-strength'],
    isFavorite: true,
    lastUpdated: '2024-09-07',
    priceHistory: [
      { date: '2024-06-01', price: 120.00 },
      { date: '2024-07-01', price: 122.50 },
      { date: '2024-08-01', price: 125.50 }
    ]
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Pacific Steel Supply',
    logo: '/suppliers/pacific-steel.jpg',
    description: 'Leading supplier of structural steel and metal products for commercial and residential construction projects.',
    category: 'Steel & Metal',
    specialties: ['Structural Steel', 'Rebar', 'Metal Fabrication', 'Custom Welding'],
    contact: {
      address: {
        street: '1234 Industrial Way',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      },
      phone: '(206) 555-0123',
      email: 'info@pacificsteel.com',
      website: 'https://pacificsteel.com'
    },
    rating: {
      overall: 4.8,
      quality: 4.9,
      delivery: 4.7,
      service: 4.8,
      pricing: 4.6,
      totalReviews: 127
    },
    verification: {
      verified: true,
      verifiedDate: '2024-01-15',
      certifications: ['ISO 9001', 'AISC Certified', 'AWS Certified'],
      licenses: ['WA Contractor License', 'DOT Certified']
    },
    performance: {
      onTimeDelivery: 94,
      qualityScore: 96,
      responseTime: 2,
      completionRate: 98
    },
    business: {
      established: '1985',
      employees: '150-200',
      annualRevenue: '$50M-100M',
      serviceArea: ['Washington', 'Oregon', 'Idaho']
    },
    materials: [
      { id: '1', name: 'Steel I-Beams', category: 'Structural Steel', price: 125.50, unit: 'linear foot' }
    ],
    reviews: [
      {
        id: '1',
        reviewer: { name: 'John Smith', company: 'ABC Construction', avatar: '/avatars/john.jpg' },
        rating: 5,
        title: 'Excellent quality and service',
        content: 'Pacific Steel has been our go-to supplier for over 5 years. Always reliable.',
        date: '2024-08-15',
        verified: true,
        helpful: 12
      }
    ],
    projects: [
      { id: '1', name: 'Downtown Office Complex', type: 'Commercial', completedDate: '2024-06-30', value: 250000 }
    ],
    isFavorite: true,
    lastActive: '2024-09-07'
  }
];

export default function TestOrganismsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  const handleProjectView = (project: Project) => {
    setSelectedProject(project);
    toast.success(`Viewing project: ${project.name}`);
  };

  const handleProjectEdit = (project: Project) => {
    toast.info(`Edit project: ${project.name}`);
  };

  const handleProjectDelete = (project: Project) => {
    toast.error(`Delete project: ${project.name}`);
  };

  const handleToggleFavorite = (project: Project) => {
    toast.success(`${project.isFavorite ? 'Removed from' : 'Added to'} favorites`);
  };

  const handleMaterialOrder = (material: Material) => {
    const existingItem = cartItems.find(item => item.materialId === material.id);
    if (existingItem) {
      setCartItems(prev => prev.map(item => 
        item.materialId === material.id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        materialId: material.id,
        material,
        quantity: 1,
        unitPrice: material.pricing.unitPrice,
        totalPrice: material.pricing.unitPrice,
        urgency: 'medium'
      };
      setCartItems(prev => [...prev, newItem]);
    }
    toast.success(`Added ${material.name} to cart`);
  };

  const handleUpdateCartQuantity = (materialId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.materialId === materialId 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  };

  const handleRemoveFromCart = (materialId: string) => {
    setCartItems(prev => prev.filter(item => item.materialId !== materialId));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    setCartItems([]);
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    toast.success('Proceeding to checkout...');
  };

  if (selectedProject) {
    const projectDetail: ProjectDetail = {
      ...selectedProject,
      overview: {
        totalTasks: 45,
        completedTasks: 34,
        overdueTasks: 2,
        upcomingMilestones: 3
      },
      timeline: [
        {
          id: '1',
          title: 'Foundation Complete',
          description: 'All foundation work completed and inspected',
          date: '2024-03-15',
          type: 'milestone',
          status: 'completed'
        }
      ],
      documents: [
        {
          id: '1',
          name: 'Project Blueprint v2.1',
          type: 'application/pdf',
          size: '2.4 MB',
          uploadedBy: 'John Smith',
          uploadedAt: '2024-09-01',
          url: '/documents/blueprint.pdf'
        }
      ],
      comments: [
        {
          id: '1',
          author: { name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Site Supervisor' },
          content: 'Foundation inspection completed successfully. Ready to proceed with framing.',
          timestamp: '2024-09-07T10:30:00Z'
        }
      ],
      financials: {
        totalBudget: selectedProject.budget,
        spent: selectedProject.spent,
        committed: 200000,
        remaining: selectedProject.budget - selectedProject.spent - 200000,
        breakdown: [
          { category: 'Labor', budgeted: 1000000, spent: 750000, percentage: 40 },
          { category: 'Materials', budgeted: 800000, spent: 600000, percentage: 32 },
          { category: 'Equipment', budgeted: 400000, spent: 300000, percentage: 16 },
          { category: 'Overhead', budgeted: 300000, spent: 225000, percentage: 12 }
        ]
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-8">
          <ProjectDetailView
            project={projectDetail}
            onBack={() => setSelectedProject(null)}
            onEdit={() => toast.info('Edit project functionality')}
          />
        </div>
      </div>
    );
  }

  if (showProjectForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-8">
          <ProjectFormWizard
            onSubmit={async (data) => {
              console.log('Project form data:', data);
              toast.success('Project created successfully!');
              setShowProjectForm(false);
            }}
            onCancel={() => setShowProjectForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complex Organism Components
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced organism components for dashboard, project management, data visualization, and material management.
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="data-viz">Data Visualization</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard
              onWidgetAdd={() => toast.info('Add widget functionality')}
              onWidgetRemove={(id) => toast.info(`Remove widget: ${id}`)}
              onWidgetConfigure={(id) => toast.info(`Configure widget: ${id}`)}
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setShowProjectForm(true)}>
                Create New Project
              </Button>
            </div>
            <ProjectGrid
              projects={mockProjects}
              onView={handleProjectView}
              onEdit={handleProjectEdit}
              onDelete={handleProjectDelete}
              onToggleFavorite={handleToggleFavorite}
              onCreateNew={() => setShowProjectForm(true)}
            />
          </TabsContent>

          <TabsContent value="data-viz" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectProgressChart
                data={[
                  { date: 'Jan', planned: 10, actual: 8, budget: 100000, issues: 2 },
                  { date: 'Feb', planned: 25, actual: 22, budget: 250000, issues: 1 },
                  { date: 'Mar', planned: 40, actual: 45, budget: 400000, issues: 0 },
                  { date: 'Apr', planned: 55, actual: 52, budget: 550000, issues: 3 }
                ]}
                title="Project Progress Trends"
                height={300}
              />
              <CostAnalysisChart
                data={[
                  { 
                    period: 'Q1', 
                    budgeted: 250000, 
                    actual: 240000, 
                    forecast: 245000, 
                    variance: -4,
                    cumulativeBudget: 250000,
                    cumulativeActual: 240000
                  },
                  { 
                    period: 'Q2', 
                    budgeted: 300000, 
                    actual: 320000, 
                    forecast: 315000, 
                    variance: 6.7,
                    cumulativeBudget: 550000,
                    cumulativeActual: 560000
                  }
                ]}
                title="Cost Analysis Overview"
                height={300}
              />
            </div>
            <GanttChart
              tasks={[
                {
                  id: '1',
                  name: 'Foundation Work',
                  startDate: '2024-01-01',
                  endDate: '2024-03-15',
                  duration: 74,
                  progress: 100,
                  status: 'completed',
                  priority: 'high',
                  assignees: [{ id: '1', name: 'John Smith' }],
                  category: 'Foundation'
                },
                {
                  id: '2',
                  name: 'Frame Construction',
                  startDate: '2024-03-16',
                  endDate: '2024-06-30',
                  duration: 106,
                  progress: 75,
                  status: 'in-progress',
                  priority: 'high',
                  assignees: [{ id: '2', name: 'Sarah Johnson' }],
                  category: 'Structure'
                }
              ]}
              milestones={[
                { id: '1', name: 'Foundation Complete', date: '2024-03-15', type: 'checkpoint', status: 'completed' },
                { id: '2', name: 'Frame Complete', date: '2024-06-30', type: 'checkpoint', status: 'current' }
              ]}
              title="Project Timeline"
            />
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Tabs defaultValue="comparison" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="comparison">Material Comparison</TabsTrigger>
                <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                <TabsTrigger value="cost-analysis">Cost Analysis</TabsTrigger>
                <TabsTrigger value="ordering">Ordering</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison">
                <MaterialComparisonTable
                  materials={mockMaterials}
                  onMaterialView={(material) => toast.info(`View material: ${material.name}`)}
                  onMaterialOrder={handleMaterialOrder}
                  onToggleFavorite={(material) => toast.success(`${material.isFavorite ? 'Removed from' : 'Added to'} favorites`)}
                />
              </TabsContent>

              <TabsContent value="suppliers">
                <SupplierDirectory
                  suppliers={mockSuppliers}
                  onSupplierView={(supplier) => toast.info(`View supplier: ${supplier.name}`)}
                  onSupplierContact={(supplier) => toast.info(`Contact supplier: ${supplier.name}`)}
                  onToggleFavorite={(supplier) => toast.success(`${supplier.isFavorite ? 'Removed from' : 'Added to'} favorites`)}
                />
              </TabsContent>

              <TabsContent value="cost-analysis">
                <MaterialCostAnalysis
                  priceHistory={[
                    {
                      materialId: '1',
                      materialName: 'Steel I-Beams',
                      category: 'Structural Steel',
                      data: [
                        { date: '2024-06-01', price: 120.00, volume: 500, supplier: 'Pacific Steel' },
                        { date: '2024-07-01', price: 122.50, volume: 450, supplier: 'Pacific Steel' },
                        { date: '2024-08-01', price: 125.50, volume: 600, supplier: 'Pacific Steel' }
                      ]
                    }
                  ]}
                  categoryData={[
                    { category: 'Steel', currentCost: 125000, previousCost: 120000, budget: 130000, variance: 5000, variancePercent: 4.2, color: '#3b82f6' },
                    { category: 'Concrete', currentCost: 85000, previousCost: 90000, budget: 88000, variance: -3000, variancePercent: -3.4, color: '#10b981' }
                  ]}
                  supplierData={[
                    {
                      supplierId: '1',
                      supplierName: 'Pacific Steel Supply',
                      totalSpent: 125000,
                      orderCount: 15,
                      averageOrderValue: 8333,
                      onTimeDelivery: 94,
                      qualityRating: 4.8,
                      costTrend: 'up',
                      trendPercent: 4.2
                    }
                  ]}
                />
              </TabsContent>

              <TabsContent value="ordering">
                <MaterialOrderingWorkflow
                  cartItems={cartItems}
                  orders={[]}
                  onUpdateCartQuantity={handleUpdateCartQuantity}
                  onRemoveFromCart={handleRemoveFromCart}
                  onClearCart={handleClearCart}
                  onCheckout={handleCheckout}
                  onOrderView={(order) => toast.info(`View order: ${order.orderNumber}`)}
                  onOrderEdit={(order) => toast.info(`Edit order: ${order.orderNumber}`)}
                  onOrderCancel={(order) => toast.info(`Cancel order: ${order.orderNumber}`)}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}