'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Package,
  Star,
  ShoppingCart,
  Eye,
  Grid3X3,
  List,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Truck,
  Clock,
  DollarSign,
  Leaf,
  Shield,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

// Extended mock materials data for search
const mockMaterials = [
  {
    id: '1',
    name: 'Portland Cement Type I',
    category: 'Concrete & Masonry',
    subcategory: 'Cement',
    description: 'High-quality Portland cement for general construction use',
    price: 12.50,
    unit: 'bag',
    supplier: 'BuildMart Supply Co.',
    supplierRating: 4.5,
    inStock: true,
    quantity: 500,
    leadTime: 3,
    location: 'Warehouse A',
    certifications: ['ASTM C150', 'ISO 9001'],
    ecoFriendly: true,
    tags: ['cement', 'concrete', 'construction'],
    image: '/materials/cement-1.jpg'
  },
  {
    id: '2',
    name: 'Steel Rebar #4',
    category: 'Steel & Metal',
    subcategory: 'Reinforcement',
    description: 'Grade 60 steel reinforcement bar for concrete structures',
    price: 8.75,
    unit: 'piece',
    supplier: 'Metro Steel Works',
    supplierRating: 4.8,
    inStock: true,
    quantity: 1200,
    leadTime: 5,
    location: 'Steel Yard',
    certifications: ['ASTM A615', 'AWS D1.4'],
    ecoFriendly: true,
    tags: ['steel', 'rebar', 'reinforcement'],
    image: '/materials/rebar-1.jpg'
  },
  {
    id: '3',
    name: 'Pressure Treated Lumber 2x4x8',
    category: 'Lumber & Wood',
    subcategory: 'Framing Lumber',
    description: 'Pressure treated southern pine lumber for outdoor construction',
    price: 6.25,
    unit: 'piece',
    supplier: 'Forest Products Inc.',
    supplierRating: 4.2,
    inStock: false,
    quantity: 0,
    leadTime: 7,
    location: 'Lumber Yard',
    certifications: ['SFI Certified', 'PEFC'],
    ecoFriendly: true,
    tags: ['lumber', 'wood', 'framing'],
    image: '/materials/lumber-1.jpg'
  },
  {
    id: '4',
    name: 'Concrete Mix Ready',
    category: 'Concrete & Masonry',
    subcategory: 'Ready Mix',
    description: 'Pre-mixed concrete for immediate use',
    price: 85.00,
    unit: 'yard',
    supplier: 'BuildMart Supply Co.',
    supplierRating: 4.5,
    inStock: true,
    quantity: 200,
    leadTime: 1,
    location: 'Concrete Plant',
    certifications: ['ASTM C94'],
    ecoFriendly: false,
    tags: ['concrete', 'ready-mix', 'construction'],
    image: '/materials/concrete-mix.jpg'
  },
  {
    id: '5',
    name: 'Structural Steel Beam I-10',
    category: 'Steel & Metal',
    subcategory: 'Structural Steel',
    description: 'Wide flange steel beam for structural applications',
    price: 125.00,
    unit: 'foot',
    supplier: 'Metro Steel Works',
    supplierRating: 4.8,
    inStock: true,
    quantity: 80,
    leadTime: 10,
    location: 'Steel Fabrication',
    certifications: ['ASTM A992', 'AISC'],
    ecoFriendly: true,
    tags: ['steel', 'beam', 'structural'],
    image: '/materials/steel-beam.jpg'
  },
  {
    id: '6',
    name: 'Insulation Fiberglass R-19',
    category: 'Insulation',
    subcategory: 'Fiberglass',
    description: 'Thermal insulation for walls and ceilings',
    price: 45.00,
    unit: 'roll',
    supplier: 'Insulation Pro',
    supplierRating: 4.3,
    inStock: true,
    quantity: 150,
    leadTime: 2,
    location: 'Warehouse B',
    certifications: ['Energy Star'],
    ecoFriendly: true,
    tags: ['insulation', 'fiberglass', 'thermal'],
    image: '/materials/insulation.jpg'
  }
];

const categories = [...new Set(mockMaterials.map(m => m.category))];
const subcategories = [...new Set(mockMaterials.map(m => m.subcategory))];
const suppliers = [...new Set(mockMaterials.map(m => m.supplier))];
const certifications = [...new Set(mockMaterials.flatMap(m => m.certifications))];

export default function MaterialSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Filter state
  const [filters, setFilters] = useState({
    categories: [] as string[],
    subcategories: [] as string[],
    suppliers: [] as string[],
    priceRange: [0, 200] as [number, number],
    inStock: false,
    ecoFriendly: false,
    certifications: [] as string[],
    leadTime: [0, 30] as [number, number],
    rating: 0
  });

  // Filter panel state
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    availability: true,
    supplier: false,
    certifications: false,
    sustainability: false
  });

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let filtered = mockMaterials.filter(material => {
      // Text search
      const matchesSearch = !searchQuery || 
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filters
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(material.category);
      
      const matchesSubcategory = filters.subcategories.length === 0 || 
        filters.subcategories.includes(material.subcategory);

      // Supplier filter
      const matchesSupplier = filters.suppliers.length === 0 || 
        filters.suppliers.includes(material.supplier);

      // Price range
      const matchesPrice = material.price >= filters.priceRange[0] && 
        material.price <= filters.priceRange[1];

      // Availability
      const matchesStock = !filters.inStock || material.inStock;

      // Eco-friendly
      const matchesEco = !filters.ecoFriendly || material.ecoFriendly;

      // Certifications
      const matchesCertifications = filters.certifications.length === 0 || 
        filters.certifications.some(cert => material.certifications.includes(cert));

      // Lead time
      const matchesLeadTime = material.leadTime >= filters.leadTime[0] && 
        material.leadTime <= filters.leadTime[1];

      // Rating
      const matchesRating = material.supplierRating >= filters.rating;

      return matchesSearch && matchesCategory && matchesSubcategory && 
             matchesSupplier && matchesPrice && matchesStock && 
             matchesEco && matchesCertifications && matchesLeadTime && matchesRating;
    });

    // Sort materials
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      if (sortBy === 'price') {
        aValue = a.price;
        bValue = b.price;
      } else if (sortBy === 'rating') {
        aValue = a.supplierRating;
        bValue = b.supplierRating;
      } else if (sortBy === 'leadTime') {
        aValue = a.leadTime;
        bValue = b.leadTime;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchQuery, filters, sortBy, sortOrder]);

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleArrayFilterToggle = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: (prev[filterType as keyof typeof prev] as string[]).includes(value)
        ? (prev[filterType as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[filterType as keyof typeof prev] as string[]), value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      subcategories: [],
      suppliers: [],
      priceRange: [0, 200],
      inStock: false,
      ecoFriendly: false,
      certifications: [],
      leadTime: [0, 30],
      rating: 0
    });
  };

  const activeFilterCount = Object.values(filters).reduce((count, filter) => {
    if (Array.isArray(filter)) {
      return count + filter.length;
    } else if (typeof filter === 'boolean') {
      return count + (filter ? 1 : 0);
    } else if (typeof filter === 'number') {
      return count + (filter > 0 ? 1 : 0);
    }
    return count;
  }, 0);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Material Search
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find the perfect materials for your construction project
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search materials, suppliers, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <Card className="sticky top-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Filters</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear All
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Category Filter */}
                    <Collapsible open={expandedSections.category} onOpenChange={() => toggleSection('category')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <span className="font-medium">Category</span>
                        {expandedSections.category ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={filters.categories.includes(category)}
                              onCheckedChange={() => handleArrayFilterToggle('categories', category)}
                            />
                            <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                              {category}
                            </label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Price Range */}
                    <Collapsible open={expandedSections.price} onOpenChange={() => toggleSection('price')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <span className="font-medium">Price Range</span>
                        {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 mt-2">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>${filters.priceRange[0]}</span>
                            <span>${filters.priceRange[1]}</span>
                          </div>
                          <Slider
                            value={filters.priceRange}
                            onValueChange={(value) => handleFilterChange('priceRange', value as [number, number])}
                            max={200}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Availability */}
                    <Collapsible open={expandedSections.availability} onOpenChange={() => toggleSection('availability')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <span className="font-medium">Availability</span>
                        {expandedSections.availability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="inStock"
                            checked={filters.inStock}
                            onCheckedChange={(checked) => handleFilterChange('inStock', checked)}
                          />
                          <label htmlFor="inStock" className="text-sm cursor-pointer">
                            In Stock Only
                          </label>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium mb-2 block">Lead Time (days)</label>
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>{filters.leadTime[0]} days</span>
                            <span>{filters.leadTime[1]} days</span>
                          </div>
                          <Slider
                            value={filters.leadTime}
                            onValueChange={(value) => handleFilterChange('leadTime', value as [number, number])}
                            max={30}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Supplier */}
                    <Collapsible open={expandedSections.supplier} onOpenChange={() => toggleSection('supplier')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <span className="font-medium">Supplier</span>
                        {expandedSections.supplier ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {suppliers.map((supplier) => (
                          <div key={supplier} className="flex items-center space-x-2">
                            <Checkbox
                              id={`supplier-${supplier}`}
                              checked={filters.suppliers.includes(supplier)}
                              onCheckedChange={() => handleArrayFilterToggle('suppliers', supplier)}
                            />
                            <label htmlFor={`supplier-${supplier}`} className="text-sm cursor-pointer">
                              {supplier}
                            </label>
                          </div>
                        ))}
                        
                        <div className="mt-4">
                          <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                          <Select value={filters.rating.toString()} onValueChange={(value) => handleFilterChange('rating', Number(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Any Rating</SelectItem>
                              <SelectItem value="3">3+ Stars</SelectItem>
                              <SelectItem value="4">4+ Stars</SelectItem>
                              <SelectItem value="4.5">4.5+ Stars</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Sustainability */}
                    <Collapsible open={expandedSections.sustainability} onOpenChange={() => toggleSection('sustainability')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <span className="font-medium">Sustainability</span>
                        {expandedSections.sustainability ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ecoFriendly"
                            checked={filters.ecoFriendly}
                            onCheckedChange={(checked) => handleFilterChange('ecoFriendly', checked)}
                          />
                          <label htmlFor="ecoFriendly" className="text-sm cursor-pointer flex items-center space-x-1">
                            <Leaf className="h-3 w-3 text-green-500" />
                            <span>Eco-Friendly Only</span>
                          </label>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Certifications */}
                    <Collapsible open={expandedSections.certifications} onOpenChange={() => toggleSection('certifications')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                        <span className="font-medium">Certifications</span>
                        {expandedSections.certifications ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 mt-2">
                        {certifications.map((cert) => (
                          <div key={cert} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cert-${cert}`}
                              checked={filters.certifications.includes(cert)}
                              onCheckedChange={() => handleArrayFilterToggle('certifications', cert)}
                            />
                            <label htmlFor={`cert-${cert}`} className="text-sm cursor-pointer">
                              {cert}
                            </label>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {filteredMaterials.length} Materials Found
                </h2>
                {searchQuery && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Results for "{searchQuery}"
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="price-asc">Price Low-High</SelectItem>
                    <SelectItem value="price-desc">Price High-Low</SelectItem>
                    <SelectItem value="rating-desc">Rating High-Low</SelectItem>
                    <SelectItem value="leadTime-asc">Lead Time Short-Long</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center space-x-1">
                    <span>{category}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleArrayFilterToggle('categories', category)}
                    />
                  </Badge>
                ))}
                {filters.suppliers.map((supplier) => (
                  <Badge key={supplier} variant="secondary" className="flex items-center space-x-1">
                    <span>{supplier}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleArrayFilterToggle('suppliers', supplier)}
                    />
                  </Badge>
                ))}
                {filters.inStock && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <span>In Stock</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('inStock', false)}
                    />
                  </Badge>
                )}
                {filters.ecoFriendly && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Leaf className="h-3 w-3" />
                    <span>Eco-Friendly</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('ecoFriendly', false)}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Grid/List */}
            <AnimatePresence mode="wait">
              {filteredMaterials.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No materials found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button onClick={clearFilters}>Clear All Filters</Button>
                </motion.div>
              ) : (
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-4"
                  )}
                >
                  {filteredMaterials.map((material) => (
                    <motion.div
                      key={material.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      className="group"
                    >
                      <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg">
                        <CardContent className={cn(
                          "p-6",
                          viewMode === 'list' && "flex items-center space-x-6"
                        )}>
                          {/* Material Image */}
                          <div className={cn(
                            "bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4",
                            viewMode === 'grid' ? "aspect-video" : "w-20 h-20 mb-0"
                          )}>
                            <Package className={cn(
                              "text-gray-400",
                              viewMode === 'grid' ? "h-12 w-12" : "h-8 w-8"
                            )} />
                          </div>

                          <div className={cn(
                            viewMode === 'list' && "flex-1 min-w-0"
                          )}>
                            {/* Material Info */}
                            <div className="mb-3">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                  {material.name}
                                </h3>
                                {material.ecoFriendly && (
                                  <Leaf className="h-4 w-4 text-green-500 ml-2 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {material.category}
                                </Badge>
                                <Badge className={material.inStock 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }>
                                  {material.inStock ? 'In Stock' : 'Out of Stock'}
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                {material.description}
                              </p>
                            </div>

                            {/* Supplier Info */}
                            <div className="flex items-center space-x-2 mb-3">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {material.supplier}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{material.supplierRating}</span>
                              </div>
                            </div>

                            {/* Material Details */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-4">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3" />
                                <span>${material.price.toFixed(2)}/{material.unit}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{material.leadTime} days</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{material.location}</span>
                              </div>
                              {material.inStock && (
                                <div className="flex items-center space-x-1">
                                  <Package className="h-3 w-3" />
                                  <span>{material.quantity} available</span>
                                </div>
                              )}
                            </div>

                            {/* Certifications */}
                            {material.certifications.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {material.certifications.slice(0, 2).map((cert) => (
                                  <Badge key={cert} variant="outline" className="text-xs">
                                    <Shield className="h-2 w-2 mr-1" />
                                    {cert}
                                  </Badge>
                                ))}
                                {material.certifications.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{material.certifications.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => router.push(`/materials/${material.id}`)}
                                className="flex-1"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={!material.inStock}
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}