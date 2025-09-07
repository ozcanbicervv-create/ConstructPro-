'use client';

import { motion } from 'framer-motion';
import {
  Search,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Filter,
  Plus,
  Download,
  Upload,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


// Import Material Management Components
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockMaterials: Material[] = [
  {
    id: '1',
    name: 'Portland Cement Type I',
    category: 'Concrete & Masonry',
    subcategory: 'Cement',
    description: 'High-quality Portland cement for general construction use',
    specifications: {
      'Compressive Strength': '4000 PSI',
      'Setting Time': '45 minutes',
      'Fineness': '350 m²/kg'
    },
    pricing: {
      unitPrice: 12.50,
      unit: 'bag',
      minimumOrder: 10,
      bulkDiscounts: [
        { quantity: 100, discount: 5 },
        { quantity: 500, discount: 10 }
      ]
    },
    availability: {
      inStock: true,
      quantity: 500,
      leadTime: 3,
      location: 'Warehouse A'
    },
    supplier: {
      id: 'sup1',
      name: 'BuildMart Supply Co.',
      rating: 4.5,
      verified: true,
      contact: {
        phone: '(555) 123-4567',
        email: 'orders@buildmart.com'
      }
    },
    quality: {
      grade: 'Grade A',
      certifications: ['ASTM C150', 'ISO 9001'],
      testReports: ['test-report-1.pdf']
    },
    sustainability: {
      ecoFriendly: true,
      carbonFootprint: 0.85,
      recyclable: false,
      certifications: ['LEED Certified']
    },
    images: ['/materials/cement-1.jpg'],
    tags: ['cement', 'concrete', 'construction'],
    isFavorite: true,
    lastUpdated: '2024-01-15',
    priceHistory: [
      { date: '2024-01-01', price: 12.00 },
      { date: '2024-01-15', price: 12.50 }
    ]
  },
  {
    id: '2',
    name: 'Steel Rebar #4',
    category: 'Steel & Metal',
    subcategory: 'Reinforcement',
    description: 'Grade 60 steel reinforcement bar for concrete structures',
    specifications: {
      'Yield Strength': '60,000 PSI',
      'Diameter': '0.5 inches',
      'Length': '20 feet'
    },
    pricing: {
      unitPrice: 8.75,
      unit: 'piece',
      minimumOrder: 50,
      bulkDiscounts: [
        { quantity: 200, discount: 8 },
        { quantity: 1000, discount: 15 }
      ]
    },
    availability: {
      inStock: true,
      quantity: 1200,
      leadTime: 5,
      location: 'Steel Yard'
    },
    supplier: {
      id: 'sup2',
      name: 'Metro Steel Works',
      rating: 4.8,
      verified: true,
      contact: {
        phone: '(555) 987-6543',
        email: 'sales@metrosteel.com'
      }
    },
    quality: {
      grade: 'Grade 60',
      certifications: ['ASTM A615', 'AWS D1.4'],
      testReports: ['mill-cert-2024.pdf']
    },
    sustainability: {
      ecoFriendly: true,
      carbonFootprint: 1.2,
      recyclable: true,
      certifications: ['Recycled Content 90%']
    },
    images: ['/materials/rebar-1.jpg'],
    tags: ['steel', 'rebar', 'reinforcement'],
    isFavorite: false,
    lastUpdated: '2024-01-10',
    priceHistory: [
      { date: '2024-01-01', price: 9.00 },
      { date: '2024-01-10', price: 8.75 }
    ]
  },
  {
    id: '3',
    name: 'Pressure Treated Lumber 2x4x8',
    category: 'Lumber & Wood',
    subcategory: 'Framing Lumber',
    description: 'Pressure treated southern pine lumber for outdoor construction',
    specifications: {
      'Species': 'Southern Pine',
      'Treatment': 'ACQ Pressure Treated',
      'Moisture Content': '19% or less'
    },
    pricing: {
      unitPrice: 6.25,
      unit: 'piece',
      minimumOrder: 25,
      bulkDiscounts: [
        { quantity: 100, discount: 5 },
        { quantity: 500, discount: 12 }
      ]
    },
    availability: {
      inStock: false,
      quantity: 0,
      leadTime: 7,
      location: 'Lumber Yard'
    },
    supplier: {
      id: 'sup3',
      name: 'Forest Products Inc.',
      rating: 4.2,
      verified: true,
      contact: {
        phone: '(555) 456-7890',
        email: 'orders@forestproducts.com'
      }
    },
    quality: {
      grade: 'Construction Grade',
      certifications: ['SFI Certified', 'PEFC'],
      testReports: []
    },
    sustainability: {
      ecoFriendly: true,
      carbonFootprint: 0.3,
      recyclable: true,
      certifications: ['FSC Certified', 'Sustainable Forestry']
    },
    images: ['/materials/lumber-1.jpg'],
    tags: ['lumber', 'wood', 'framing'],
    isFavorite: false,
    lastUpdated: '2024-01-12',
    priceHistory: [
      { date: '2024-01-01', price: 6.50 },
      { date: '2024-01-12', price: 6.25 }
    ]
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: 'sup1',
    name: 'BuildMart Supply Co.',
    logo: '/suppliers/buildmart-logo.png',
    description: 'Leading supplier of construction materials with over 25 years of experience in the industry.',
    category: 'General Construction',
    specialties: ['Concrete Materials', 'Masonry Supplies', 'Construction Tools'],
    contact: {
      address: {
        street: '123 Industrial Blvd',
        city: 'Construction City',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      },
      phone: '(555) 123-4567',
      email: 'orders@buildmart.com',
      website: 'https://buildmart.com'
    },
    rating: {
      overall: 4.5,
      quality: 4.6,
      delivery: 4.4,
      service: 4.5,
      pricing: 4.3,
      totalReviews: 127
    },
    verification: {
      verified: true,
      verifiedDate: '2023-06-15',
      certifications: ['ISO 9001', 'OSHA Certified'],
      licenses: ['General Contractor License', 'Material Supplier License']
    },
    performance: {
      onTimeDelivery: 94,
      qualityScore: 96,
      responseTime: 2,
      completionRate: 98
    },
    business: {
      established: '1998',
      employees: '50-100',
      annualRevenue: '$10M-$50M',
      serviceArea: ['California', 'Nevada', 'Arizona']
    },
    materials: [
      { id: '1', name: 'Portland Cement', category: 'Concrete', price: 12.50, unit: 'bag' },
      { id: '4', name: 'Concrete Mix', category: 'Concrete', price: 85.00, unit: 'yard' }
    ],
    reviews: [
      {
        id: 'rev1',
        reviewer: {
          name: 'John Smith',
          company: 'ABC Construction',
          avatar: '/avatars/john-smith.jpg'
        },
        rating: 5,
        title: 'Excellent service and quality materials',
        content: 'BuildMart has been our go-to supplier for years. Always reliable delivery and top-quality materials.',
        date: '2024-01-10',
        verified: true,
        helpful: 8
      }
    ],
    projects: [
      {
        id: 'proj1',
        name: 'Downtown Office Complex',
        type: 'Commercial',
        completedDate: '2023-12-15',
        value: 250000
      }
    ],
    isFavorite: true,
    lastActive: '2024-01-15'
  },
  {
    id: 'sup2',
    name: 'Metro Steel Works',
    logo: '/suppliers/metro-steel-logo.png',
    description: 'Specialized steel fabrication and supply company serving the construction industry since 1985.',
    category: 'Steel & Metal',
    specialties: ['Structural Steel', 'Reinforcement Bars', 'Custom Fabrication'],
    contact: {
      address: {
        street: '456 Steel Avenue',
        city: 'Industrial Park',
        state: 'TX',
        zipCode: '75201',
        country: 'USA'
      },
      phone: '(555) 987-6543',
      email: 'sales@metrosteel.com',
      website: 'https://metrosteel.com'
    },
    rating: {
      overall: 4.8,
      quality: 4.9,
      delivery: 4.7,
      service: 4.8,
      pricing: 4.6,
      totalReviews: 89
    },
    verification: {
      verified: true,
      verifiedDate: '2023-08-20',
      certifications: ['AWS Certified', 'AISC Certified'],
      licenses: ['Steel Fabricator License', 'Structural Steel License']
    },
    performance: {
      onTimeDelivery: 96,
      qualityScore: 98,
      responseTime: 1.5,
      completionRate: 99
    },
    business: {
      established: '1985',
      employees: '100-250',
      annualRevenue: '$25M-$100M',
      serviceArea: ['Texas', 'Oklahoma', 'Louisiana', 'Arkansas']
    },
    materials: [
      { id: '2', name: 'Steel Rebar #4', category: 'Steel', price: 8.75, unit: 'piece' },
      { id: '5', name: 'Structural Beam', category: 'Steel', price: 125.00, unit: 'foot' }
    ],
    reviews: [
      {
        id: 'rev2',
        reviewer: {
          name: 'Sarah Johnson',
          company: 'Steel Frame Builders',
          avatar: '/avatars/sarah-johnson.jpg'
        },
        rating: 5,
        title: 'Outstanding quality and precision',
        content: 'Metro Steel consistently delivers high-quality steel products with precise specifications.',
        date: '2024-01-08',
        verified: true,
        helpful: 12
      }
    ],
    projects: [
      {
        id: 'proj2',
        name: 'Highway Bridge Construction',
        type: 'Infrastructure',
        completedDate: '2023-11-30',
        value: 500000
      }
    ],
    isFavorite: false,
    lastActive: '2024-01-14'
  }
];

const mockPriceHistory: MaterialPriceHistory[] = [
  {
    materialId: '1',
    materialName: 'Portland Cement Type I',
    category: 'Concrete & Masonry',
    data: [
      { date: '2023-10-01', price: 11.50, volume: 1000, supplier: 'BuildMart Supply Co.' },
      { date: '2023-11-01', price: 11.75, volume: 1200, supplier: 'BuildMart Supply Co.' },
      { date: '2023-12-01', price: 12.00, volume: 1100, supplier: 'BuildMart Supply Co.' },
      { date: '2024-01-01', price: 12.25, volume: 1300, supplier: 'BuildMart Supply Co.' },
      { date: '2024-01-15', price: 12.50, volume: 1150, supplier: 'BuildMart Supply Co.' }
    ]
  },
  {
    materialId: '2',
    materialName: 'Steel Rebar #4',
    category: 'Steel & Metal',
    data: [
      { date: '2023-10-01', price: 9.25, volume: 800, supplier: 'Metro Steel Works' },
      { date: '2023-11-01', price: 9.00, volume: 950, supplier: 'Metro Steel Works' },
      { date: '2023-12-01', price: 8.90, volume: 1050, supplier: 'Metro Steel Works' },
      { date: '2024-01-01', price: 8.80, volume: 1200, supplier: 'Metro Steel Works' },
      { date: '2024-01-15', price: 8.75, volume: 1100, supplier: 'Metro Steel Works' }
    ]
  }
];

const mockCategoryData: CategoryCostData[] = [
  {
    category: 'Concrete & Masonry',
    currentCost: 45000,
    previousCost: 42000,
    budget: 50000,
    variance: -5000,
    variancePercent: -10,
    color: '#3b82f6'
  },
  {
    category: 'Steel & Metal',
    currentCost: 78000,
    previousCost: 75000,
    budget: 80000,
    variance: -2000,
    variancePercent: -2.5,
    color: '#10b981'
  },
  {
    category: 'Lumber & Wood',
    currentCost: 32000,
    previousCost: 28000,
    budget: 30000,
    variance: 2000,
    variancePercent: 6.7,
    color: '#f59e0b'
  },
  {
    category: 'Electrical',
    currentCost: 25000,
    previousCost: 24000,
    budget: 28000,
    variance: -3000,
    variancePercent: -10.7,
    color: '#ef4444'
  }
];

const mockSupplierCostData: SupplierCostData[] = [
  {
    supplierId: 'sup1',
    supplierName: 'BuildMart Supply Co.',
    totalSpent: 125000,
    orderCount: 45,
    averageOrderValue: 2778,
    onTimeDelivery: 94,
    qualityRating: 4.5,
    costTrend: 'up',
    trendPercent: 3.2
  },
  {
    supplierId: 'sup2',
    supplierName: 'Metro Steel Works',
    totalSpent: 98000,
    orderCount: 32,
    averageOrderValue: 3063,
    onTimeDelivery: 96,
    qualityRating: 4.8,
    costTrend: 'down',
    trendPercent: -2.1
  }
];

const mockCartItems: OrderItem[] = [
  {
    materialId: '1',
    material: mockMaterials[0],
    quantity: 50,
    unitPrice: 12.50,
    totalPrice: 625,
    notes: 'For foundation work',
    urgency: 'high',
    deliveryDate: '2024-02-01'
  }
];

const mockOrders: MaterialOrder[] = [
  {
    id: 'order1',
    orderNumber: 'ORD-2024-001',
    status: 'approved',
    items: mockCartItems,
    totalAmount: 625,
    tax: 50,
    shipping: 25,
    grandTotal: 700,
    supplier: {
      id: 'sup1',
      name: 'BuildMart Supply Co.',
      contact: {
        name: 'John Doe',
        email: 'john@buildmart.com',
        phone: '(555) 123-4567'
      }
    },
    project: {
      id: 'proj1',
      name: 'Downtown Office Complex'
    },
    requestedBy: {
      id: 'user1',
      name: 'Mike Johnson',
      role: 'Project Manager',
      avatar: '/avatars/mike-johnson.jpg'
    },
    approvals: [
      {
        id: 'app1',
        approver: {
          id: 'mgr1',
          name: 'Sarah Smith',
          role: 'Construction Manager'
        },
        status: 'approved',
        date: '2024-01-16',
        comments: 'Approved for immediate procurement'
      }
    ],
    deliveryAddress: {
      street: '789 Construction Site Rd',
      city: 'Build City',
      state: 'CA',
      zipCode: '90211',
      country: 'USA',
      instructions: 'Deliver to main gate, contact site supervisor'
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-16',
    expectedDelivery: '2024-02-01'
  }
];

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<OrderItem[]>(mockCartItems);
  const [orders, setOrders] = useState<MaterialOrder[]>(mockOrders);

  // Material management handlers
  const handleMaterialView = (material: Material) => {
    console.log('View material:', material);
    // TODO: Open material detail modal
  };

  const handleMaterialOrder = (material: Material) => {
    console.log('Add to cart:', material);
    // TODO: Add material to cart
  };

  const handleToggleFavorite = (material: Material) => {
    console.log('Toggle favorite:', material);
    // TODO: Toggle material favorite status
  };

  // Supplier management handlers
  const handleSupplierView = (supplier: Supplier) => {
    console.log('View supplier:', supplier);
    // TODO: Open supplier detail modal
  };

  const handleSupplierContact = (supplier: Supplier) => {
    console.log('Contact supplier:', supplier);
    // TODO: Open contact form or redirect to contact page
  };

  const handleSupplierToggleFavorite = (supplier: Supplier) => {
    console.log('Toggle supplier favorite:', supplier);
    // TODO: Toggle supplier favorite status
  };

  // Cart management handlers
  const handleUpdateCartQuantity = (materialId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.materialId === materialId 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ));
  };

  const handleRemoveFromCart = (materialId: string) => {
    setCartItems(prev => prev.filter(item => item.materialId !== materialId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCheckout = () => {
    console.log('Proceed to checkout');
    // TODO: Navigate to checkout page
  };

  // Order management handlers
  const handleOrderView = (order: MaterialOrder) => {
    console.log('View order:', order);
    // TODO: Open order detail modal
  };

  const handleOrderEdit = (order: MaterialOrder) => {
    console.log('Edit order:', order);
    // TODO: Navigate to order edit page
  };

  const handleOrderCancel = (order: MaterialOrder) => {
    console.log('Cancel order:', order);
    // TODO: Show confirmation dialog and cancel order
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Material Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive material catalog, supplier directory, and ordering system
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Materials
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Materials
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockMaterials.length.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">12%</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Suppliers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockSuppliers.length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">8%</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.filter(o => o.status === 'pending-approval').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  ${orders.reduce((sum, o) => sum + o.grandTotal, 0).toLocaleString()} total value
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Monthly Spend
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    $180K
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">5%</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">vs budget</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="catalog" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Material Catalog</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Suppliers</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Cost Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <MaterialComparisonTable
              materials={mockMaterials}
              onMaterialView={handleMaterialView}
              onMaterialOrder={handleMaterialOrder}
              onToggleFavorite={handleToggleFavorite}
            />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <SupplierDirectory
              suppliers={mockSuppliers}
              onSupplierView={handleSupplierView}
              onSupplierContact={handleSupplierContact}
              onToggleFavorite={handleSupplierToggleFavorite}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MaterialCostAnalysis
              priceHistory={mockPriceHistory}
              categoryData={mockCategoryData}
              supplierData={mockSupplierCostData}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <MaterialOrderingWorkflow
              cartItems={cartItems}
              orders={orders}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              onOrderView={handleOrderView}
              onOrderEdit={handleOrderEdit}
              onOrderCancel={handleOrderCancel}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}