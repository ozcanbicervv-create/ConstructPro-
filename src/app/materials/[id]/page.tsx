'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  StarOff,
  ShoppingCart,
  Package,
  Truck,
  Shield,
  Leaf,
  FileText,
  Download,
  Share2,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Mock material data (in real app, this would come from API)
const mockMaterial = {
  id: '1',
  name: 'Portland Cement Type I',
  category: 'Concrete & Masonry',
  subcategory: 'Cement',
  description: 'High-quality Portland cement for general construction use. This premium grade cement meets all ASTM standards and is suitable for a wide range of construction applications including foundations, structural elements, and general concrete work.',
  specifications: {
    'Compressive Strength': '4000 PSI',
    'Setting Time': '45 minutes',
    'Fineness': '350 m²/kg',
    'Soundness': 'Passes autoclave test',
    'Chemical Composition': 'C3S: 55%, C2S: 19%, C3A: 10%, C4AF: 7%'
  },
  pricing: {
    unitPrice: 12.50,
    unit: 'bag',
    minimumOrder: 10,
    bulkDiscounts: [
      { quantity: 100, discount: 5, price: 11.88 },
      { quantity: 500, discount: 10, price: 11.25 },
      { quantity: 1000, discount: 15, price: 10.63 }
    ]
  },
  availability: {
    inStock: true,
    quantity: 500,
    leadTime: 3,
    location: 'Warehouse A - Bay 12',
    reservedQuantity: 50,
    availableQuantity: 450
  },
  supplier: {
    id: 'sup1',
    name: 'BuildMart Supply Co.',
    rating: 4.5,
    verified: true,
    contact: {
      phone: '(555) 123-4567',
      email: 'orders@buildmart.com',
      website: 'https://buildmart.com'
    },
    address: {
      street: '123 Industrial Blvd',
      city: 'Construction City',
      state: 'CA',
      zipCode: '90210'
    }
  },
  quality: {
    grade: 'Grade A',
    certifications: ['ASTM C150', 'ISO 9001', 'LEED Certified'],
    testReports: [
      { name: 'Quality Test Report Q1 2024', url: '/reports/cement-q1-2024.pdf', date: '2024-01-15' },
      { name: 'Chemical Analysis Report', url: '/reports/cement-chemical-2024.pdf', date: '2024-01-10' }
    ],
    qualityScore: 96
  },
  sustainability: {
    ecoFriendly: true,
    carbonFootprint: 0.85,
    recyclable: false,
    certifications: ['LEED Certified', 'Green Building Council Approved'],
    sustainabilityScore: 85,
    environmentalImpact: 'Low CO2 emissions during production'
  },
  images: [
    '/materials/cement-1.jpg',
    '/materials/cement-2.jpg',
    '/materials/cement-packaging.jpg'
  ],
  tags: ['cement', 'concrete', 'construction', 'astm-certified'],
  isFavorite: true,
  lastUpdated: '2024-01-15',
  priceHistory: [
    { date: '2023-10-01', price: 11.50 },
    { date: '2023-11-01', price: 11.75 },
    { date: '2023-12-01', price: 12.00 },
    { date: '2024-01-01', price: 12.25 },
    { date: '2024-01-15', price: 12.50 }
  ],
  usageHistory: [
    { date: '2023-10-01', quantity: 150 },
    { date: '2023-11-01', quantity: 200 },
    { date: '2023-12-01', quantity: 180 },
    { date: '2024-01-01', quantity: 220 },
    { date: '2024-01-15', quantity: 190 }
  ],
  relatedMaterials: [
    { id: '4', name: 'Concrete Mix Ready', category: 'Concrete & Masonry', price: 85.00 },
    { id: '5', name: 'Masonry Cement', category: 'Concrete & Masonry', price: 14.25 },
    { id: '6', name: 'Concrete Admixture', category: 'Concrete & Masonry', price: 8.75 }
  ],
  reviews: [
    {
      id: 'rev1',
      reviewer: 'John Smith - ABC Construction',
      rating: 5,
      title: 'Excellent quality cement',
      content: 'We\'ve been using this cement for our foundation work and it consistently delivers excellent results. The setting time is perfect and the strength is as advertised.',
      date: '2024-01-10',
      verified: true,
      helpful: 8
    },
    {
      id: 'rev2',
      reviewer: 'Sarah Johnson - Metro Builders',
      rating: 4,
      title: 'Good value for money',
      content: 'Reliable cement with good bulk pricing. Delivery is always on time and the quality is consistent.',
      date: '2024-01-05',
      verified: true,
      helpful: 5
    }
  ]
};

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(10);
  const [isFavorite, setIsFavorite] = useState(mockMaterial.isFavorite);

  const handleAddToCart = () => {
    console.log('Adding to cart:', { materialId: params.id, quantity });
    // TODO: Add to cart logic
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Update favorite status
  };

  const handleContactSupplier = () => {
    console.log('Contacting supplier:', mockMaterial.supplier.id);
    // TODO: Open contact modal or navigate to supplier page
  };

  const getPriceForQuantity = (qty: number) => {
    const discount = mockMaterial.pricing.bulkDiscounts.find(d => qty >= d.quantity);
    return discount ? discount.price : mockMaterial.pricing.unitPrice;
  };

  const getTotalPrice = () => {
    return getPriceForQuantity(quantity) * quantity;
  };

  const getPriceChange = () => {
    const history = mockMaterial.priceHistory;
    if (history.length < 2) {return null;}
    
    const current = history[history.length - 1].price;
    const previous = history[history.length - 2].price;
    const change = ((current - previous) / previous) * 100;
    
    return {
      percentage: change,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const priceChange = getPriceChange();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Materials
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{mockMaterial.category}</Badge>
            <Badge variant="outline">{mockMaterial.subcategory}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="flex space-x-2">
                    {mockMaterial.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={cn(
                          "w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center",
                          selectedImage === index && "ring-2 ring-blue-500"
                        )}
                      >
                        <Package className="h-6 w-6 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Material Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{mockMaterial.name}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {mockMaterial.description}
                    </p>
                  </div>
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
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="specifications" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="specifications">Specifications</TabsTrigger>
                    <TabsTrigger value="quality">Quality & Certifications</TabsTrigger>
                    <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="specifications" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(mockMaterial.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                          <span className="text-gray-900 dark:text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="quality" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">Quality Score</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{mockMaterial.quality.qualityScore}%</span>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {mockMaterial.quality.certifications.map((cert) => (
                            <Badge key={cert} variant="outline" className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{cert}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Test Reports</h4>
                        <div className="space-y-2">
                          {mockMaterial.quality.testReports.map((report) => (
                            <div key={report.name} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">{report.name}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{report.date}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sustainability" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Leaf className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">Sustainability Score</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">{mockMaterial.sustainability.sustainabilityScore}%</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Leaf className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Eco-Friendly</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {mockMaterial.sustainability.ecoFriendly ? 'Yes' : 'No'}
                          </p>
                        </div>

                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Carbon Footprint</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {mockMaterial.sustainability.carbonFootprint} kg CO2/kg
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Environmental Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {mockMaterial.sustainability.certifications.map((cert) => (
                            <Badge key={cert} variant="outline" className="flex items-center space-x-1">
                              <Leaf className="h-3 w-3 text-green-500" />
                              <span>{cert}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <div className="space-y-4">
                      {mockMaterial.reviews.map((review) => (
                        <div key={review.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
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
                                {review.verified && (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <h5 className="font-semibold">{review.title}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{review.reviewer}</p>
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3">{review.content}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Heart className="h-4 w-4" />
                            <span>{review.helpful} people found this helpful</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing and Actions */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pricing & Availability</span>
                  {priceChange && (
                    <div className={cn(
                      "flex items-center space-x-1 text-sm",
                      priceChange.direction === 'up' ? 'text-red-600' : 
                      priceChange.direction === 'down' ? 'text-green-600' : 'text-gray-500'
                    )}>
                      {priceChange.direction === 'up' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : priceChange.direction === 'down' ? (
                        <TrendingDown className="h-4 w-4" />
                      ) : null}
                      <span>{Math.abs(priceChange.percentage).toFixed(1)}%</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Price */}
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${getPriceForQuantity(quantity).toFixed(2)}
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                      /{mockMaterial.pricing.unit}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Minimum order: {mockMaterial.pricing.minimumOrder} {mockMaterial.pricing.unit}s
                  </p>
                </div>

                {/* Bulk Pricing */}
                <div>
                  <h4 className="font-semibold mb-3">Bulk Pricing</h4>
                  <div className="space-y-2">
                    {mockMaterial.pricing.bulkDiscounts.map((discount) => (
                      <div key={discount.quantity} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>{discount.quantity}+ {mockMaterial.pricing.unit}s</span>
                        <span className="font-medium">${discount.price.toFixed(2)} ({discount.discount}% off)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="font-semibold mb-3">Availability</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">In Stock:</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {mockMaterial.availability.quantity} available
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Lead Time:</span>
                      <span className="text-sm font-medium">{mockMaterial.availability.leadTime} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
                      <span className="text-sm font-medium">{mockMaterial.availability.location}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <h4 className="font-semibold mb-3">Quantity</h4>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(mockMaterial.pricing.minimumOrder, quantity - 10))}
                    >
                      -
                    </Button>
                    <span className="text-lg font-medium w-16 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 10)}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Total: ${getTotalPrice().toLocaleString()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button onClick={handleAddToCart} className="w-full" size="lg">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" onClick={handleContactSupplier} className="w-full">
                    Contact Supplier
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Info */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{mockMaterial.supplier.name}</h4>
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(mockMaterial.supplier.rating) 
                              ? "text-yellow-400 fill-current" 
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{mockMaterial.supplier.rating}</span>
                  </div>
                </div>

                {mockMaterial.supplier.verified && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified Supplier
                  </Badge>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{mockMaterial.supplier.address.city}, {mockMaterial.supplier.address.state}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{mockMaterial.supplier.contact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{mockMaterial.supplier.contact.email}</span>
                  </div>
                  {mockMaterial.supplier.contact.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a href={mockMaterial.supplier.contact.website} className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Price History Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={mockMaterial.priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Price']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Materials */}
        <Card>
          <CardHeader>
            <CardTitle>Related Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockMaterial.relatedMaterials.map((material) => (
                <div key={material.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {material.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {material.category}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${material.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}