'use client';

import React, { useState } from 'react';

import { Badge } from '@/components/design-system/atoms/Badge';
import { Button } from '@/components/design-system/atoms/Button';
import { Icon } from '@/components/design-system/atoms/Icon';
import { Typography } from '@/components/design-system/atoms/Typography';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription,
  ProjectCard,
  TaskCard,
  MaterialCard,
  DocumentCard,
  type ProjectData,
  type TaskData,
  type MaterialData,
  type DocumentData
} from '@/components/design-system/molecules/Card';

export default function TestCardsPage() {
  const [selectedCard, setSelectedCard] = useState<string>('');

  // Sample data
  const sampleProject: ProjectData = {
    id: '1',
    name: 'Downtown Office Complex',
    description: 'Modern 15-story office building with sustainable design features and underground parking.',
    status: 'active',
    progress: 68,
    startDate: '2024-01-15',
    endDate: '2024-11-30',
    budget: 3500000,
    spent: 2380000,
    manager: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
    },
    team: 32,
    location: 'Downtown Business District',
    priority: 'high',
  };

  const sampleTask: TaskData = {
    id: '1',
    title: 'Foundation Concrete Pour',
    description: 'Complete the concrete pour for the main foundation structure. Ensure proper curing conditions.',
    status: 'in-progress',
    priority: 'critical',
    assignee: {
      name: 'Mike Rodriguez',
      avatar: '/avatars/mike.jpg',
    },
    dueDate: '2024-02-20',
    project: 'Downtown Office Complex',
    tags: ['foundation', 'concrete', 'critical-path'],
    completed: false,
    subtasks: {
      total: 8,
      completed: 5,
    },
  };

  const sampleMaterial: MaterialData = {
    id: '1',
    name: 'High-Performance Concrete Mix C40/50',
    description: 'Premium concrete mix designed for high-rise construction with enhanced durability and strength.',
    category: 'concrete',
    supplier: {
      name: 'Premier Building Materials',
      rating: 4.8,
      verified: true,
    },
    price: {
      amount: 145.75,
      unit: 'cubic meter',
      currency: 'USD',
    },
    availability: 'in-stock',
    quantity: {
      available: 2500,
      unit: 'cubic meters',
    },
    specifications: {
      grade: 'C40/50',
      dimensions: 'Ready-mix',
      weight: '2400 kg/m³',
    },
    certifications: ['ISO 9001', 'ASTM C94', 'EN 206'],
    leadTime: 3,
    minOrder: 25,
  };

  const sampleDocument: DocumentData = {
    id: '1',
    name: 'Structural Engineering Plans Rev 3.2',
    description: 'Updated structural drawings including foundation details and steel frame specifications.',
    type: 'blueprint',
    fileType: 'dwg',
    size: 24567890,
    uploadedBy: {
      name: 'David Chen',
      avatar: '/avatars/david.jpg',
    },
    uploadedAt: '2024-01-25T09:15:00Z',
    lastModified: '2024-02-10T16:30:00Z',
    version: '3.2',
    status: 'approved',
    project: 'Downtown Office Complex',
    tags: ['structural', 'blueprints', 'approved', 'foundation'],
    isShared: true,
    downloadCount: 47,
  };

  const handleCardAction = (action: string, item: any) => {
    console.log(`${action}:`, item);
    setSelectedCard(`${action}: ${item.name || item.title}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="heading-xl" className="font-bold text-gray-900 mb-2">
            Card Components Demo
          </Typography>
          <Typography variant="body" className="text-gray-600">
            Comprehensive card system with multiple variants and specialized components for construction industry.
          </Typography>
          {selectedCard && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Typography variant="body-sm" className="text-blue-800 dark:text-blue-200">
                Last Action: {selectedCard}
              </Typography>
            </div>
          )}
        </div>

        {/* Basic Card Variants */}
        <section className="mb-12">
          <Typography variant="heading-lg" className="font-semibold text-gray-900 mb-6">
            Basic Card Variants
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Default Card */}
            <Card variant="default" hover>
              <CardHeader divider>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard card with subtle styling</CardDescription>
              </CardHeader>
              <CardContent padding="md">
                <Typography variant="body-sm" className="text-gray-600">
                  Clean and professional appearance suitable for most use cases.
                </Typography>
              </CardContent>
              <CardFooter divider>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>

            {/* Glass Card */}
            <Card variant="glass" hover>
              <CardHeader divider>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Modern glassmorphism effect</CardDescription>
              </CardHeader>
              <CardContent padding="md">
                <Typography variant="body-sm" className="text-gray-600">
                  Backdrop blur with transparency for modern aesthetics.
                </Typography>
              </CardContent>
              <CardFooter divider>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated" hover>
              <CardHeader divider>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Prominent shadow styling</CardDescription>
              </CardHeader>
              <CardContent padding="md">
                <Typography variant="body-sm" className="text-gray-600">
                  Enhanced shadow for emphasis and visual hierarchy.
                </Typography>
              </CardContent>
              <CardFooter divider>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>

            {/* Outlined Card */}
            <Card variant="outlined" hover>
              <CardHeader divider>
                <CardTitle>Outlined Card</CardTitle>
                <CardDescription>Minimal border styling</CardDescription>
              </CardHeader>
              <CardContent padding="md">
                <Typography variant="body-sm" className="text-gray-600">
                  Clean border design without shadows for subtle emphasis.
                </Typography>
              </CardContent>
              <CardFooter divider>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Interactive Cards */}
        <section className="mb-12">
          <Typography variant="heading-lg" className="font-semibold text-gray-900 mb-6">
            Interactive Cards
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              variant="glass" 
              interactive 
              onClick={() => handleCardAction('Clicked', { name: 'Interactive Card' })}
              className="cursor-pointer"
            >
              <CardContent padding="lg" className="text-center">
                <Icon name="mouse-pointer-click" size="lg" className="mx-auto mb-4 text-blue-600" />
                <CardTitle className="mb-2">Clickable Card</CardTitle>
                <CardDescription>Click me to see interaction</CardDescription>
              </CardContent>
            </Card>

            <Card variant="elevated" hover>
              <CardContent padding="lg" className="text-center">
                <Icon name="hand" size="lg" className="mx-auto mb-4 text-green-600" />
                <CardTitle className="mb-2">Hover Effects</CardTitle>
                <CardDescription>Hover to see smooth animations</CardDescription>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent padding="lg" className="text-center">
                <Icon name="focus" size="lg" className="mx-auto mb-4 text-purple-600" />
                <CardTitle className="mb-2">Focus States</CardTitle>
                <CardDescription>Keyboard navigation support</CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Specialized Cards */}
        <section className="mb-12">
          <Typography variant="heading-lg" className="font-semibold text-gray-900 mb-6">
            Construction Industry Cards
          </Typography>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Project Cards */}
            <div>
              <Typography variant="heading-md" className="font-medium text-gray-900 mb-4">
                Project Cards
              </Typography>
              <div className="space-y-4">
                <ProjectCard
                  project={sampleProject}
                  variant="glass"
                  onSelect={(project) => handleCardAction('Selected Project', project)}
                  onEdit={(project) => handleCardAction('Edit Project', project)}
                  onDelete={(project) => handleCardAction('Delete Project', project)}
                />
              </div>
            </div>

            {/* Task Cards */}
            <div>
              <Typography variant="heading-md" className="font-medium text-gray-900 mb-4">
                Task Cards
              </Typography>
              <div className="space-y-4">
                <TaskCard
                  task={sampleTask}
                  variant="elevated"
                  onSelect={(task) => handleCardAction('Selected Task', task)}
                  onToggleComplete={(task) => handleCardAction('Toggle Task', task)}
                  onEdit={(task) => handleCardAction('Edit Task', task)}
                />
                
                {/* Compact Task Card */}
                <TaskCard
                  task={{ ...sampleTask, title: 'Compact Task View' }}
                  variant="outlined"
                  compact
                  onSelect={(task) => handleCardAction('Selected Compact Task', task)}
                  onToggleComplete={(task) => handleCardAction('Toggle Compact Task', task)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Material and Document Cards */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Material Cards */}
            <div>
              <Typography variant="heading-md" className="font-medium text-gray-900 mb-4">
                Material Cards
              </Typography>
              <div className="space-y-4">
                <MaterialCard
                  material={sampleMaterial}
                  variant="default"
                  onSelect={(material) => handleCardAction('Selected Material', material)}
                  onCompare={(material) => handleCardAction('Compare Material', material)}
                  onOrder={(material) => handleCardAction('Order Material', material)}
                />
                
                {/* Compact Material Card */}
                <MaterialCard
                  material={{ ...sampleMaterial, name: 'Compact Material View' }}
                  variant="outlined"
                  compact
                  onSelect={(material) => handleCardAction('Selected Compact Material', material)}
                />
              </div>
            </div>

            {/* Document Cards */}
            <div>
              <Typography variant="heading-md" className="font-medium text-gray-900 mb-4">
                Document Cards
              </Typography>
              <div className="space-y-4">
                <DocumentCard
                  document={sampleDocument}
                  variant="glass"
                  onSelect={(doc) => handleCardAction('Selected Document', doc)}
                  onDownload={(doc) => handleCardAction('Download Document', doc)}
                  onShare={(doc) => handleCardAction('Share Document', doc)}
                  onEdit={(doc) => handleCardAction('Edit Document', doc)}
                />
                
                {/* Compact Document Card */}
                <DocumentCard
                  document={{ ...sampleDocument, name: 'Compact Document View' }}
                  variant="outlined"
                  compact
                  onSelect={(doc) => handleCardAction('Selected Compact Document', doc)}
                  onDownload={(doc) => handleCardAction('Download Compact Document', doc)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Card Features */}
        <section className="mb-12">
          <Typography variant="heading-lg" className="font-semibold text-gray-900 mb-6">
            Card Features
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="glass" className="text-center">
              <CardContent padding="lg">
                <Icon name="palette" size="lg" className="mx-auto mb-4 text-blue-600" />
                <CardTitle className="mb-2">Multiple Variants</CardTitle>
                <CardDescription>
                  Glass, elevated, outlined, and flat styles for different use cases
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="elevated" className="text-center">
              <CardContent padding="lg">
                <Icon name="zap" size="lg" className="mx-auto mb-4 text-yellow-600" />
                <CardTitle className="mb-2">Micro-interactions</CardTitle>
                <CardDescription>
                  Smooth hover effects and animations powered by Framer Motion
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="outlined" className="text-center">
              <CardContent padding="lg">
                <Icon name="accessibility" size="lg" className="mx-auto mb-4 text-green-600" />
                <CardTitle className="mb-2">Accessibility</CardTitle>
                <CardDescription>
                  WCAG 2.1 AA compliant with keyboard navigation support
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="default" className="text-center">
              <CardContent padding="lg">
                <Icon name="smartphone" size="lg" className="mx-auto mb-4 text-purple-600" />
                <CardTitle className="mb-2">Responsive</CardTitle>
                <CardDescription>
                  Mobile-first design with compact modes for different screen sizes
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="glass" className="text-center">
              <CardContent padding="lg">
                <Icon name="building" size="lg" className="mx-auto mb-4 text-orange-600" />
                <CardTitle className="mb-2">Industry-Specific</CardTitle>
                <CardDescription>
                  Specialized cards for construction projects, tasks, and materials
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="elevated" className="text-center">
              <CardContent padding="lg">
                <Icon name="settings" size="lg" className="mx-auto mb-4 text-gray-600" />
                <CardTitle className="mb-2">Customizable</CardTitle>
                <CardDescription>
                  Flexible padding, spacing, and styling options for any design
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Usage Examples */}
        <section>
          <Typography variant="heading-lg" className="font-semibold text-gray-900 mb-6">
            Usage Examples
          </Typography>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card variant="outlined" padding="lg">
              <CardHeader>
                <CardTitle>Dashboard Grid</CardTitle>
                <CardDescription>Perfect for project dashboards and overview screens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      <Typography variant="caption" className="text-gray-500">Card {i}</Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" padding="lg">
              <CardHeader>
                <CardTitle>List Views</CardTitle>
                <CardDescription>Compact cards work great in list layouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-white/50 dark:bg-gray-800/50 rounded flex items-center px-3">
                      <Typography variant="body-sm" className="text-gray-700">List Item {i}</Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}