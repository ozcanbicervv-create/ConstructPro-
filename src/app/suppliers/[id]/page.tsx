'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  StarOff,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Building,
  Award,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  Clock,
  DollarSign,
  MessageSquare,
  FileText,
  Share2,
  Heart,
  AlertTriangle,
  Shield,
  Target
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { cn } from '@/lib/utils';

// Mock supplier data (in real app, this would come from API)
const mockSupplier = {
  id: 'sup1',
  name: 'BuildMart Supply Co.',
  logo: '/suppliers/buildmart-logo.png',
  description: 'Leading supplier of construction materials with over 25 years of experience in the industry. We specialize in providing high-quality materials for commercial and residential construction projects.',
  category: 'General Construction',
  specialties: ['Concrete Materials', 'Masonry Supplies', 'Construction Tools', 'Safety Equipment'],
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
    certifications: ['ISO 9001', 'OSHA Certified', 'Better Business Bureau A+'],
    licenses: ['General Contractor License #GC123456', 'Material Supplier License #MS789012']
  },
  performance: {
    onTimeDelivery: 94,
    qualityScore: 96,
    responseTime: 2,
    completionRate: 98,
    customerSatisfaction: 95
  },
  business: {
    established: '1998',
    employees: '50-100',
    annualRevenue: '$10M-$50M',
    serviceArea: ['California', 'Nevada', 'Arizona'],
    operatingHours: {
      weekdays: '7:00 AM - 6:00 PM',
      saturday: '8:00 AM - 4:00 PM',
      sunday: 'Closed'
    }
  },
  materials: [
    { id: '1', name: 'Portland Cement Type I', category: 'Concrete & Masonry', price: 12.50, unit: 'bag', inStock: true, quantity: 500 },
    { id: '4', name: 'Concrete Mix Ready', category: 'Concrete & Masonry', price: 85.00, unit: 'yard', inStock: true, quantity: 200 },
    { id: '7', name: 'Masonry Cement', category: 'Concrete & Masonry', price: 14.25, unit: 'bag', inStock: false, quantity: 0 },
    { id: '8', name: 'Construction Sand', category: 'Aggregates', price: 35.00, unit: 'ton', inStock: true, quantity: 150 }
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
      content: 'BuildMart has been our go-to supplier for years. Always reliable delivery and top-quality materials. Their customer service is outstanding and they always go the extra mile.',
      date: '2024-01-10',
      verified: true,
      helpful: 8,
      categories: {
        quality: 5,
        delivery: 5,
        service: 5,
        pricing: 4
      }
    },
    {
      id: 'rev2',
      reviewer: {
        name: 'Sarah Johnson',
        company: 'Metro Builders',
        avatar: '/avatars/sarah-johnson.jpg'
      },
      rating: 4,
      title: 'Good value and reliable service',
      content: 'Consistent quality and competitive pricing. Delivery is usually on time, though there have been a few delays during peak season.',
      date: '2024-01-05',
      verified: true,
      helpful: 5,
      categories: {
        quality: 4,
        delivery: 4,
        service: 4,
        pricing: 5
      }
    },
    {
      id: 'rev3',
      reviewer: {
        name: 'Mike Wilson',
        company: 'Wilson Construction',
        avatar: '/avatars/mike-wilson.jpg'
      },
      rating: 5,
      title: 'Outstanding customer support',
      content: 'When we had an urgent order, BuildMart went above and beyond to accommodate our timeline. Great communication throughout the process.',
      date: '2023-12-28',
      verified: true,
      helpful: 12,
      categories: {
        quality: 5,
        delivery: 5,
        service: 5,
        pricing: 4
      }
    }
  ],
  projects: [
    {
      id: 'proj1',
      name: 'Downtown Office Complex',
      type: 'Commercial',
      completedDate: '2023-12-15',
      value: 250000,
      description: 'Supplied concrete and masonry materials for 15-story office building'
    },
    {
      id: 'proj2',
      name: 'Residential Development Phase 2',
      type: 'Residential',
      completedDate: '2023-11-30',
      value: 180000,
      description: 'Complete material supply for 50-unit residential complex'
    },
    {
      id: 'proj3',
      name: 'Highway Infrastructure Project',
      type: 'Infrastructure',
      completedDate: '2023-10-20',
      value: 420000,
      description: 'Concrete and aggregate materials for highway construction'
    }
  ],
  performanceHistory: [
    { month: 'Aug 2023', onTimeDelivery: 92, qualityScore: 94, customerSatisfaction: 93 },
    { month: 'Sep 2023', onTimeDelivery: 95, qualityScore: 95, customerSatisfaction: 94 },
    { month: 'Oct 2023', onTimeDelivery: 93, qualityScore: 96, customerSatisfaction: 95 },
    { month: 'Nov 2023', onTimeDelivery: 96, qualityScore: 97, customerSatisfaction: 96 },
    { month: 'Dec 2023', onTimeDelivery: 94, qualityScore: 96, customerSatisfaction: 95 },
    { month: 'Jan 2024', onTimeDelivery: 94, qualityScore: 96, customerSatisfaction: 95 }
  ],
  orderHistory: [
    { month: 'Aug 2023', orders: 45, value: 125000 },
    { month: 'Sep 2023', orders: 52, value: 142000 },
    { month: 'Oct 2023', orders: 48, value: 135000 },
    { month: 'Nov 2023', orders: 55, value: 158000 },
    { month: 'Dec 2023', orders: 42, value: 118000 },
    { month: 'Jan 2024', orders: 38, value: 105000 }
  ],
  isFavorite: true,
  lastActive: '2024-01-15',
  responseRate: 98,
  averageResponseTime: '2 hours'
};

const performanceColors = {
  excellent: '#10b981',
  good: '#3b82f6',
  average: '#f59e0b',
  poor: '#ef4444'
};

const getPerformanceColor = (score: number) => {
  if (score >= 95) {return performanceColors.excellent;}
  if (score >= 85) {return performanceColors.good;}
  if (score >= 75) {return performanceColors.average;}
  return performanceColors.poor;
};

const getPerformanceLabel = (score: number) => {
  if (score >= 95) {return 'Excellent';}
  if (score >= 85) {return 'Good';}
  if (score >= 75) {return 'Average';}
  return 'Needs Improvement';
};

export default function SupplierProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(mockSupplier.isFavorite);
  const [activeTab, setActiveTab] = useState('overview');

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Update favorite status
  };

  const handleContactSupplier = () => {
    console.log('Contacting supplier:', params.id);
    // TODO: Open contact modal or form
  };

  const handleViewMaterial = (materialId: string) => {
    router.push(`/materials/${materialId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Badge variant="outline">{mockSupplier.category}</Badge>
        </div>

        {/* Supplier Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
              <div className="flex items-start space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={mockSupplier.logo} />
                  <AvatarFallback className="text-2xl">
                    {mockSupplier.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {mockSupplier.name}
                      </h1>
                      {mockSupplier.verification.verified && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleFavorite}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        {isFavorite ? (
                          <Star className="h-5 w-5 fill-current" />
                        ) : (
                          <StarOff className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                      {mockSupplier.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mockSupplier.contact.address.city}, {mockSupplier.contact.address.state}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Est. {mockSupplier.business.established}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{mockSupplier.business.employees} employees</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-5 w-5",
                              i < Math.floor(mockSupplier.rating.overall) 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-lg">{mockSupplier.rating.overall}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        ({mockSupplier.rating.totalReviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button onClick={handleContactSupplier} size="lg">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Supplier
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">On-Time Delivery</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: getPerformanceColor(mockSupplier.performance.onTimeDelivery) }}>
                  {mockSupplier.performance.onTimeDelivery}%
                </span>
              </div>
              <Progress value={mockSupplier.performance.onTimeDelivery} className="h-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {getPerformanceLabel(mockSupplier.performance.onTimeDelivery)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Quality Score</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: getPerformanceColor(mockSupplier.performance.qualityScore) }}>
                  {mockSupplier.performance.qualityScore}%
                </span>
              </div>
              <Progress value={mockSupplier.performance.qualityScore} className="h-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {getPerformanceLabel(mockSupplier.performance.qualityScore)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Response Time</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {mockSupplier.performance.responseTime}h
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Average response time
              </p>
              <p className="text-xs text-green-600 mt-1">
                {mockSupplier.responseRate}% response rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Satisfaction</span>
                </div>
                <span className="text-2xl font-bold" style={{ color: getPerformanceColor(mockSupplier.performance.customerSatisfaction) }}>
                  {mockSupplier.performance.customerSatisfaction}%
                </span>
              </div>
              <Progress value={mockSupplier.performance.customerSatisfaction} className="h-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Customer satisfaction
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{mockSupplier.contact.address.street}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {mockSupplier.contact.address.city}, {mockSupplier.contact.address.state} {mockSupplier.contact.address.zipCode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span>{mockSupplier.contact.phone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span>{mockSupplier.contact.email}</span>
                    </div>
                    
                    {mockSupplier.contact.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <a href={mockSupplier.contact.website} className="text-blue-600 hover:underline">
                          {mockSupplier.contact.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Operating Hours</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span>{mockSupplier.business.operatingHours.weekdays}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span>{mockSupplier.business.operatingHours.saturday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span>{mockSupplier.business.operatingHours.sunday}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Established</p>
                      <p className="font-semibold">{mockSupplier.business.established}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Employees</p>
                      <p className="font-semibold">{mockSupplier.business.employees}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Annual Revenue</p>
                      <p className="font-semibold">{mockSupplier.business.annualRevenue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last Active</p>
                      <p className="font-semibold">{mockSupplier.lastActive}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Service Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockSupplier.business.serviceArea.map((area) => (
                        <Badge key={area} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockSupplier.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certifications and Licenses */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications & Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span>Certifications</span>
                    </h4>
                    <div className="space-y-2">
                      {mockSupplier.verification.certifications.map((cert) => (
                        <div key={cert} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Licenses</span>
                    </h4>
                    <div className="space-y-2">
                      {mockSupplier.verification.licenses.map((license) => (
                        <div key={license} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{license}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Materials ({mockSupplier.materials.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockSupplier.materials.map((material) => (
                    <motion.div
                      key={material.id}
                      whileHover={{ y: -2 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleViewMaterial(material.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {material.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {material.category}
                            </p>
                          </div>
                        </div>
                        <Badge className={material.inStock ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}>
                          {material.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${material.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            per {material.unit}
                          </p>
                        </div>
                        {material.inStock && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {material.quantity} available
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockSupplier.performanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="onTimeDelivery" stroke="#3b82f6" strokeWidth={2} name="On-Time Delivery" />
                      <Line type="monotone" dataKey="qualityScore" stroke="#10b981" strokeWidth={2} name="Quality Score" />
                      <Line type="monotone" dataKey="customerSatisfaction" stroke="#f59e0b" strokeWidth={2} name="Customer Satisfaction" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Order Volume */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Volume & Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockSupplier.orderHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip formatter={(value, name) => [name === 'orders' ? value : `$${value.toLocaleString()}`, name === 'orders' ? 'Orders' : 'Value']} />
                      <Bar dataKey="orders" fill="#3b82f6" name="orders" />
                      <Bar dataKey="value" fill="#10b981" name="value" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Rating Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {Object.entries(mockSupplier.rating).filter(([key]) => key !== 'totalReviews').map(([category, rating]) => (
                    <div key={category} className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {typeof rating === 'number' ? rating.toFixed(1) : rating}
                      </div>
                      <div className="flex justify-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.floor(typeof rating === 'number' ? rating : 0) 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {category === 'overall' ? 'Overall Rating' : category}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews ({mockSupplier.rating.totalReviews})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockSupplier.reviews.map((review) => (
                    <div key={review.id} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarImage src={review.reviewer.avatar} />
                            <AvatarFallback>
                              {review.reviewer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">{review.reviewer.name}</h4>
                              {review.verified && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{review.reviewer.company}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-4 w-4",
                                      i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <h5 className="font-semibold mb-2">{review.title}</h5>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{review.content}</p>
                      
                      {/* Category Ratings */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {Object.entries(review.categories).map(([category, rating]) => (
                          <div key={category} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{rating}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{category}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Heart className="h-4 w-4" />
                        <span>{review.helpful} people found this helpful</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects ({mockSupplier.projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSupplier.projects.map((project) => (
                    <div key={project.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
                        </div>
                        <Badge variant="outline">{project.type}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Completed: {project.completedDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            ${project.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}