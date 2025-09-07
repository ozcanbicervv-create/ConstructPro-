'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Star,
  StarOff,
  ShoppingCart,
  Eye,
  GitCompare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Package,
  Truck,
  Clock,
  DollarSign
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';


// Types for material data
export interface Material {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  specifications: {
    [key: string]: string | number;
  };
  pricing: {
    unitPrice: number;
    unit: string;
    minimumOrder: number;
    bulkDiscounts?: Array<{
      quantity: number;
      discount: number;
    }>;
  };
  availability: {
    inStock: boolean;
    quantity: number;
    leadTime: number; // in days
    location: string;
  };
  supplier: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
    contact: {
      phone: string;
      email: string;
    };
  };
  quality: {
    grade: string;
    certifications: string[];
    testReports?: string[];
  };
  sustainability: {
    ecoFriendly: boolean;
    carbonFootprint?: number;
    recyclable: boolean;
    certifications: string[];
  };
  images: string[];
  tags: string[];
  isFavorite?: boolean;
  lastUpdated: string;
  priceHistory: Array<{
    date: string;
    price: number;
  }>;
}

// Filter and sort options
export interface MaterialFilterOptions {
  category?: string;
  subcategory?: string;
  supplier?: string;
  availability?: 'in-stock' | 'out-of-stock' | 'all';
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  certifications?: string[];
  ecoFriendly?: boolean;
}

export interface MaterialSortOptions {
  field: 'name' | 'price' | 'rating' | 'availability' | 'leadTime' | 'lastUpdated';
  direction: 'asc' | 'desc';
}

// Material Comparison Table Component
export interface MaterialComparisonTableProps {
  materials: Material[];
  selectedMaterials?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onMaterialView?: (material: Material) => void;
  onMaterialOrder?: (material: Material) => void;
  onToggleFavorite?: (material: Material) => void;
  loading?: boolean;
  className?: string;
}

export const MaterialComparisonTable: React.FC<MaterialComparisonTableProps> = ({
  materials,
  selectedMaterials = [],
  onSelectionChange,
  onMaterialView,
  onMaterialOrder,
  onToggleFavorite,
  loading = false,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MaterialFilterOptions>({});
  const [sortOptions, setSortOptions] = useState<MaterialSortOptions>({
    field: 'name',
    direction: 'asc'
  });
  const [comparisonMode, setComparisonMode] = useState(false);

  // Filter and sort materials
  const filteredAndSortedMaterials = useMemo(() => {
    const filtered = materials.filter(material => {
      const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.supplier.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !filters.category || material.category === filters.category;
      const matchesSubcategory = !filters.subcategory || material.subcategory === filters.subcategory;
      const matchesSupplier = !filters.supplier || material.supplier.id === filters.supplier;

      const matchesAvailability = !filters.availability ||
        (filters.availability === 'in-stock' && material.availability.inStock) ||
        (filters.availability === 'out-of-stock' && !material.availability.inStock) ||
        filters.availability === 'all';

      const matchesPriceRange = !filters.priceRange ||
        (material.pricing.unitPrice >= filters.priceRange.min &&
          material.pricing.unitPrice <= filters.priceRange.max);

      const matchesRating = !filters.rating || material.supplier.rating >= filters.rating;

      const matchesEcoFriendly = filters.ecoFriendly === undefined ||
        material.sustainability.ecoFriendly === filters.ecoFriendly;

      return matchesSearch && matchesCategory && matchesSubcategory &&
        matchesSupplier && matchesAvailability && matchesPriceRange &&
        matchesRating && matchesEcoFriendly;
    });

    // Sort materials
    filtered.sort((a, b) => {
      const { field, direction } = sortOptions;
      let aValue: any = a[field as keyof Material];
      let bValue: any = b[field as keyof Material];

      switch (field) {
        case 'price':
          aValue = a.pricing.unitPrice;
          bValue = b.pricing.unitPrice;
          break;
        case 'rating':
          aValue = a.supplier.rating;
          bValue = b.supplier.rating;
          break;
        case 'availability':
          aValue = a.availability.inStock ? 1 : 0;
          bValue = b.availability.inStock ? 1 : 0;
          break;
        case 'leadTime':
          aValue = a.availability.leadTime;
          bValue = b.availability.leadTime;
          break;
        case 'lastUpdated':
          aValue = new Date(a.lastUpdated).getTime();
          bValue = new Date(b.lastUpdated).getTime();
          break;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [materials, searchQuery, filters, sortOptions]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(materials.map(m => m.category))];
    const subcategories = [...new Set(materials.map(m => m.subcategory))];
    const suppliers = [...new Set(materials.map(m => ({ id: m.supplier.id, name: m.supplier.name })))];

    return { categories, subcategories, suppliers };
  }, [materials]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(filteredAndSortedMaterials.map(m => m.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectMaterial = (materialId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedMaterials, materialId]);
    } else {
      onSelectionChange?.(selectedMaterials.filter(id => id !== materialId));
    }
  };

  const getPriceChange = (material: Material) => {
    if (material.priceHistory.length < 2) {return null;}

    const current = material.priceHistory[material.priceHistory.length - 1].price;
    const previous = material.priceHistory[material.priceHistory.length - 2].price;
    const change = ((current - previous) / previous) * 100;

    return {
      percentage: change,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  };

  const getAvailabilityStatus = (material: Material) => {
    if (!material.availability.inStock) {
      return { status: 'out-of-stock', color: 'text-red-600 bg-red-100 dark:bg-red-900/20' };
    }

    if (material.availability.quantity < material.pricing.minimumOrder) {
      return { status: 'low-stock', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20' };
    }

    return { status: 'in-stock', color: 'text-green-600 bg-green-100 dark:bg-green-900/20' };
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Material Comparison ({filteredAndSortedMaterials.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Compare materials, prices, and suppliers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={comparisonMode ? "default" : "outline"}
            onClick={() => setComparisonMode(!comparisonMode)}
            disabled={selectedMaterials.length === 0}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            Compare ({selectedMaterials.length})
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search materials, suppliers..."
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

          <Select value={filters.availability || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value as any }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={`${sortOptions.field}-${sortOptions.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split('-') as [MaterialSortOptions['field'], MaterialSortOptions['direction']];
              setSortOptions({ field, direction });
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="price-asc">Price Low-High</SelectItem>
              <SelectItem value="price-desc">Price High-Low</SelectItem>
              <SelectItem value="rating-desc">Rating High-Low</SelectItem>
              <SelectItem value="availability-desc">Availability</SelectItem>
              <SelectItem value="leadTime-asc">Lead Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Materials Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMaterials.length === filteredAndSortedMaterials.length && filteredAndSortedMaterials.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Lead Time</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Certifications</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredAndSortedMaterials.map((material, index) => {
                    const priceChange = getPriceChange(material);
                    const availabilityStatus = getAvailabilityStatus(material);

                    return (
                      <motion.tr
                        key={material.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedMaterials.includes(material.id)}
                            onCheckedChange={(checked) => handleSelectMaterial(material.id, checked as boolean)}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {material.name}
                                </p>
                                {material.isFavorite && (
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                )}
                                {material.sustainability.ecoFriendly && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Eco
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {material.category} • {material.subcategory}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {material.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {material.supplier.name}
                              </p>
                              <div className="flex items-center space-x-1">
                                {material.supplier.verified && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {material.supplier.verified ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                ${material.pricing.unitPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                /{material.pricing.unit}
                              </span>
                              {priceChange && (
                                <div className={cn(
                                  "flex items-center space-x-1 text-xs",
                                  priceChange.direction === 'up' ? 'text-red-600' :
                                    priceChange.direction === 'down' ? 'text-green-600' : 'text-gray-500'
                                )}>
                                  {priceChange.direction === 'up' ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : priceChange.direction === 'down' ? (
                                    <TrendingDown className="h-3 w-3" />
                                  ) : null}
                                  <span>{Math.abs(priceChange.percentage).toFixed(1)}%</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Min order: {material.pricing.minimumOrder} {material.pricing.unit}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge className={availabilityStatus.color}>
                              {availabilityStatus.status.replace('-', ' ')}
                            </Badge>
                            {material.availability.inStock && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {material.availability.quantity} available
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {material.availability.leadTime} days
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-3 w-3",
                                    i < Math.floor(material.supplier.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {material.supplier.rating.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {material.quality.certifications.slice(0, 2).map((cert) => (
                              <Badge key={cert} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                            {material.quality.certifications.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{material.quality.certifications.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onMaterialView?.(material)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onMaterialOrder?.(material)}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Order
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onToggleFavorite?.(material)}>
                                {material.isFavorite ? (
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
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* No Results */}
      {filteredAndSortedMaterials.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Package className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No materials found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default MaterialComparisonTable;