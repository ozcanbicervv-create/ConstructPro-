'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star,
  StarOff,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Package,
  Truck,
  Shield,
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Eye,
  MessageSquare,
  FileText,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';


// Types for supplier data
export interface Supplier {
  id: string;
  name: string;
  logo?: string;
  description: string;
  category: string;
  specialties: string[];
  contact: {
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone: string;
    email: string;
    website?: string;
  };
  rating: {
    overall: number;
    quality: number;
    delivery: number;
    service: number;
    pricing: number;
    totalReviews: number;
  };
  verification: {
    verified: boolean;
    verifiedDate?: string;
    certifications: string[];
    licenses: string[];
  };
  performance: {
    onTimeDelivery: number; // percentage
    qualityScore: number; // percentage
    responseTime: number; // hours
    completionRate: number; // percentage
  };
  business: {
    established: string;
    employees: string;
    annualRevenue?: string;
    serviceArea: string[];
  };
  materials: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
  }>;
  reviews: Array<{
    id: string;
    reviewer: {
      name: string;
      company: string;
      avatar?: string;
    };
    rating: number;
    title: string;
    content: string;
    date: string;
    verified: boolean;
    helpful: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    type: string;
    completedDate: string;
    value: number;
  }>;
  isFavorite?: boolean;
  lastActive: string;
}

// Filter options
export interface SupplierFilterOptions {
  category?: string;
  location?: string;
  rating?: number;
  verified?: boolean;
  specialties?: string[];
}

export interface SupplierSortOptions {
  field: 'name' | 'rating' | 'reviews' | 'established' | 'lastActive';
  direction: 'asc' | 'desc';
}

// Supplier Card Component
interface SupplierCardProps {
  supplier: Supplier;
  onView: (supplier: Supplier) => void;
  onContact: (supplier: Supplier) => void;
  onToggleFavorite: (supplier: Supplier) => void;
}

const SupplierCard: React.FC<SupplierCardProps> = ({
  supplier,
  onView,
  onContact,
  onToggleFavorite
}) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) {return 'text-green-600';}
    if (rating >= 4.0) {return 'text-blue-600';}
    if (rating >= 3.5) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) {return 'text-green-600 bg-green-100 dark:bg-green-900/20';}
    if (score >= 80) {return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';}
    if (score >= 70) {return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';}
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={supplier.logo} />
                <AvatarFallback>
                  {supplier.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg truncate">
                    {supplier.name}
                  </CardTitle>
                  {supplier.isFavorite && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                  {supplier.verification.verified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <Badge variant="outline" className="mt-1">
                  {supplier.category}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(supplier)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onContact(supplier)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Supplier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFavorite(supplier)}>
                  {supplier.isFavorite ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Remove from Favorites
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {supplier.description}
          </p>
          
          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(supplier.rating.overall) 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className={cn("font-medium", getRatingColor(supplier.rating.overall))}>
                {supplier.rating.overall.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({supplier.rating.totalReviews} reviews)
              </span>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className={cn("text-lg font-bold", getPerformanceColor(supplier.performance.onTimeDelivery))}>
                {supplier.performance.onTimeDelivery}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">On-Time Delivery</div>
            </div>
            
            <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className={cn("text-lg font-bold", getPerformanceColor(supplier.performance.qualityScore))}>
                {supplier.performance.qualityScore}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Quality Score</div>
            </div>
          </div>
          
          {/* Location and Contact */}
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{supplier.contact.address.city}, {supplier.contact.address.state}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Est. {supplier.business.established}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>{supplier.business.employees} employees</span>
            </div>
          </div>
          
          {/* Specialties */}
          <div>
            <div className="flex flex-wrap gap-1">
              {supplier.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {supplier.specialties.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{supplier.specialties.length - 3}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Certifications */}
          {supplier.verification.certifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {supplier.verification.certifications.length} certification{supplier.verification.certifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onView(supplier)} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button size="sm" onClick={() => onContact(supplier)} className="flex-1">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Supplier Directory Component
export interface SupplierDirectoryProps {
  suppliers: Supplier[];
  onSupplierView: (supplier: Supplier) => void;
  onSupplierContact: (supplier: Supplier) => void;
  onToggleFavorite: (supplier: Supplier) => void;
  loading?: boolean;
  className?: string;
}

export const SupplierDirectory: React.FC<SupplierDirectoryProps> = ({
  suppliers,
  onSupplierView,
  onSupplierContact,
  onToggleFavorite,
  loading = false,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SupplierFilterOptions>({});
  const [sortOptions, setSortOptions] = useState<SupplierSortOptions>({
    field: 'rating',
    direction: 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort suppliers
  const filteredAndSortedSuppliers = useMemo(() => {
    const filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           supplier.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           supplier.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !filters.category || supplier.category === filters.category;
      const matchesLocation = !filters.location || 
        supplier.contact.address.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        supplier.contact.address.state.toLowerCase().includes(filters.location.toLowerCase());
      const matchesRating = !filters.rating || supplier.rating.overall >= filters.rating;
      const matchesVerified = filters.verified === undefined || supplier.verification.verified === filters.verified;
      
      return matchesSearch && matchesCategory && matchesLocation && matchesRating && matchesVerified;
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      const { field, direction } = sortOptions;
      let aValue: any = a[field as keyof Supplier];
      let bValue: any = b[field as keyof Supplier];

      switch (field) {
        case 'rating':
          aValue = a.rating.overall;
          bValue = b.rating.overall;
          break;
        case 'reviews':
          aValue = a.rating.totalReviews;
          bValue = b.rating.totalReviews;
          break;
        case 'established':
          aValue = parseInt(a.business.established);
          bValue = parseInt(b.business.established);
          break;
        case 'lastActive':
          aValue = new Date(a.lastActive).getTime();
          bValue = new Date(b.lastActive).getTime();
          break;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [suppliers, searchQuery, filters, sortOptions]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(suppliers.map(s => s.category))];
    const locations = [...new Set(suppliers.map(s => `${s.contact.address.city}, ${s.contact.address.state}`))];

    return { categories, locations };
  }, [suppliers]);

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Supplier Directory ({filteredAndSortedSuppliers.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Find and connect with verified construction suppliers
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search suppliers, specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={filters.category || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value || undefined }))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {filterOptions.categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.rating?.toString() || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value ? Number(value) : undefined }))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Ratings</SelectItem>
              <SelectItem value="4.5">4.5+ Stars</SelectItem>
              <SelectItem value="4.0">4.0+ Stars</SelectItem>
              <SelectItem value="3.5">3.5+ Stars</SelectItem>
              <SelectItem value="3.0">3.0+ Stars</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={`${sortOptions.field}-${sortOptions.direction}`} 
            onValueChange={(value) => {
              const [field, direction] = value.split('-') as [SupplierSortOptions['field'], SupplierSortOptions['direction']];
              setSortOptions({ field, direction });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="rating-desc">Highest Rated</SelectItem>
              <SelectItem value="rating-asc">Lowest Rated</SelectItem>
              <SelectItem value="reviews-desc">Most Reviews</SelectItem>
              <SelectItem value="established-asc">Newest</SelectItem>
              <SelectItem value="established-desc">Most Established</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Suppliers Grid */}
      <AnimatePresence mode="wait">
        {filteredAndSortedSuppliers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No suppliers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAndSortedSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onView={onSupplierView}
                onContact={onSupplierContact}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierDirectory;