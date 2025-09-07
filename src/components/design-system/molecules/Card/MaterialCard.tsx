'use client';

import React from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Typography } from '../../atoms/Typography';

import Card from './Card';
import CardContent from './CardContent';
import CardDescription from './CardDescription';
import CardFooter from './CardFooter';
import CardHeader from './CardHeader';
import CardTitle from './CardTitle';

export interface MaterialData {
  id: string;
  name: string;
  description: string;
  category: 'concrete' | 'steel' | 'lumber' | 'electrical' | 'plumbing' | 'insulation' | 'roofing' | 'other';
  supplier: {
    name: string;
    rating: number;
    verified: boolean;
  };
  price: {
    amount: number;
    unit: string;
    currency: string;
  };
  availability: 'in-stock' | 'low-stock' | 'out-of-stock' | 'pre-order';
  quantity: {
    available: number;
    unit: string;
  };
  specifications: {
    grade?: string;
    dimensions?: string;
    weight?: string;
    [key: string]: string | undefined;
  };
  certifications: string[];
  leadTime: number; // in days
  minOrder: number;
}

export interface MaterialCardProps {
  material: MaterialData;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  onSelect?: (material: MaterialData) => void;
  onCompare?: (material: MaterialData) => void;
  onOrder?: (material: MaterialData) => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  variant = 'default',
  onSelect,
  onCompare,
  onOrder,
  className,
  showActions = true,
  compact = false,
}) => {
  const getCategoryIcon = (category: MaterialData['category']) => {
    switch (category) {
      case 'concrete':
        return 'building';
      case 'steel':
        return 'zap';
      case 'lumber':
        return 'tree-pine';
      case 'electrical':
        return 'zap';
      case 'plumbing':
        return 'droplets';
      case 'insulation':
        return 'shield';
      case 'roofing':
        return 'home';
      default:
        return 'package';
    }
  };

  const getAvailabilityColor = (availability: MaterialData['availability']) => {
    switch (availability) {
      case 'in-stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pre-order':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatPrice = (price: MaterialData['price']) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 2,
    }).format(price.amount);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="star"
        size="xs"
        className={cn(
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        )}
      />
    ));
  };

  if (compact) {
    return (
      <Card
        variant={variant}
        padding="sm"
        hover
        interactive={!!onSelect}
        onClick={() => onSelect?.(material)}
        className={cn('w-full', className)}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Icon name={getCategoryIcon(material.category)} size="sm" className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Typography variant="body-sm" className="font-medium truncate">
              {material.name}
            </Typography>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={cn('text-xs', getAvailabilityColor(material.availability))}
              >
                {material.availability.replace('-', ' ')}
              </Badge>
              <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                {formatPrice(material.price)}/{material.price.unit}
              </Typography>
            </div>
          </div>

          <div className="text-right">
            <Typography variant="body-sm" className="font-semibold">
              {formatPrice(material.price)}
            </Typography>
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              per {material.price.unit}
            </Typography>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant={variant}
      hover
      interactive={!!onSelect}
      onClick={() => onSelect?.(material)}
      className={cn('w-full max-w-sm', className)}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Icon name={getCategoryIcon(material.category)} size="md" className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle size="sm" className="truncate">
              {material.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={cn('text-xs', getAvailabilityColor(material.availability))}
              >
                {material.availability.replace('-', ' ')}
              </Badge>
              <Typography variant="caption" className="text-gray-600 dark:text-gray-400 capitalize">
                {material.category}
              </Typography>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent padding="md">
        <CardDescription className="mb-4 line-clamp-2">
          {material.description}
        </CardDescription>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <Typography variant="heading-md" className="font-bold text-gray-900 dark:text-white">
              {formatPrice(material.price)}
            </Typography>
            <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400">
              per {material.price.unit}
            </Typography>
          </div>
        </div>

        {/* Supplier Info */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Typography variant="body-sm" className="font-medium text-gray-900 dark:text-white">
              {material.supplier.name}
            </Typography>
            {material.supplier.verified && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                <Icon name="shield-check" size="xs" className="mr-1" />
                Verified
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {renderStars(material.supplier.rating)}
            <Typography variant="caption" className="ml-1 text-gray-600 dark:text-gray-400">
              {material.supplier.rating.toFixed(1)}
            </Typography>
          </div>
        </div>

        {/* Specifications */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Available
            </Typography>
            <Typography variant="caption" className="font-medium">
              {material.quantity.available.toLocaleString()} {material.quantity.unit}
            </Typography>
          </div>
          
          <div className="flex items-center justify-between">
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Lead Time
            </Typography>
            <Typography variant="caption" className="font-medium">
              {material.leadTime} days
            </Typography>
          </div>
          
          <div className="flex items-center justify-between">
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Min Order
            </Typography>
            <Typography variant="caption" className="font-medium">
              {material.minOrder} {material.quantity.unit}
            </Typography>
          </div>
        </div>

        {/* Certifications */}
        {material.certifications.length > 0 && (
          <div className="mb-4">
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400 mb-2 block">
              Certifications
            </Typography>
            <div className="flex flex-wrap gap-1">
              {material.certifications.slice(0, 2).map((cert) => (
                <Badge
                  key={cert}
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  {cert}
                </Badge>
              ))}
              {material.certifications.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  +{material.certifications.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter divider justify="between">
          <div className="flex gap-2">
            {onCompare && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare(material);
                }}
              >
                <Icon name="git-compare" size="xs" className="mr-1" />
                Compare
              </Button>
            )}
          </div>

          {onOrder && material.availability !== 'out-of-stock' && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOrder(material);
              }}
            >
              <Icon name="shopping-cart" size="xs" className="mr-1" />
              Order
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default MaterialCard;