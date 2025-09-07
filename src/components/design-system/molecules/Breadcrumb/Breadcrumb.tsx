'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Typography } from '../../atoms/Typography';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '../../atoms/Button';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem) => void;
  separator?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'minimal';
  showHome?: boolean;
  maxItems?: number;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onItemClick,
  separator,
  className,
  variant = 'default',
  showHome = true,
  maxItems = 5,
}) => {
  // Add home item if requested and not already present
  const allItems = React.useMemo(() => {
    const hasHome = items.some(item => item.id === 'home');
    if (showHome && !hasHome && items.length > 0) {
      return [
        {
          id: 'home',
          label: 'Home',
          href: '/',
          icon: <Home className="h-3 w-3" />,
        },
        ...items,
      ];
    }
    return items;
  }, [items, showHome]);

  // Handle overflow by showing first item, ellipsis, and last few items
  const displayItems = React.useMemo(() => {
    if (allItems.length <= maxItems) {
      return allItems;
    }

    const firstItem = allItems[0];
    const lastItems = allItems.slice(-2);
    
    return [
      firstItem,
      {
        id: 'ellipsis',
        label: '...',
        disabled: true,
      },
      ...lastItems,
    ];
  }, [allItems, maxItems]);

  const handleItemClick = (item: BreadcrumbItem, event: React.MouseEvent) => {
    if (item.disabled || item.current || item.id === 'ellipsis') {
      event.preventDefault();
      return;
    }
    
    onItemClick?.(item);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2';
      case 'minimal':
        return '';
      default:
        return 'bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 py-2';
    }
  };

  const defaultSeparator = (
    <ChevronRight className="h-3 w-3 text-gray-400 dark:text-gray-500" />
  );

  return (
    <nav
      className={cn(
        'flex items-center space-x-2',
        getVariantClasses(),
        className
      )}
      role="navigation"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCurrent = item.current || isLast;
          const isEllipsis = item.id === 'ellipsis';

          return (
            <li key={item.id} className="flex items-center space-x-2">
              {/* Breadcrumb Item */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center"
              >
                {isEllipsis ? (
                  <span className="text-gray-400 dark:text-gray-500 px-2">
                    {item.label}
                  </span>
                ) : item.href && !isCurrent ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleItemClick(item, e)}
                    disabled={item.disabled}
                    className={cn(
                      'h-auto p-1 font-normal hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400',
                      'focus:bg-transparent focus:text-blue-600 dark:focus:text-blue-400',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    <div className="flex items-center space-x-1.5">
                      {item.icon && (
                        <span className="flex-shrink-0">
                          {item.icon}
                        </span>
                      )}
                      <Typography
                        variant="body-sm"
                        className={cn(
                          'transition-colors duration-200',
                          isCurrent 
                            ? 'text-gray-900 dark:text-white font-medium' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                        )}
                      >
                        {item.label}
                      </Typography>
                    </div>
                  </Button>
                ) : (
                  <div className="flex items-center space-x-1.5 px-1">
                    {item.icon && (
                      <span className="flex-shrink-0">
                        {item.icon}
                      </span>
                    )}
                    <Typography
                      variant="body-sm"
                      className={cn(
                        isCurrent 
                          ? 'text-gray-900 dark:text-white font-medium' 
                          : 'text-gray-600 dark:text-gray-300'
                      )}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {item.label}
                    </Typography>
                  </div>
                )}
              </motion.div>

              {/* Separator */}
              {!isLast && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.05 }}
                  className="flex-shrink-0"
                  aria-hidden="true"
                >
                  {separator || defaultSeparator}
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;