'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../../atoms/Button';
import { ChevronRight, X } from 'lucide-react';
import { Typography } from '../../atoms/Typography';
import { Badge } from '../../atoms/Badge';
import { NavigationItem } from '../Navigation/Navigation';

export interface MobileNavigationProps {
  items: NavigationItem[];
  isOpen: boolean;
  onToggle: () => void;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
  variant?: 'default' | 'glass';
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  isOpen,
  onToggle,
  onItemClick,
  className,
  variant = 'glass',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [dragOffset, setDragOffset] = useState(0);

  // Close navigation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('[data-mobile-nav]')) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onToggle]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onToggle]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: NavigationItem, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      onItemClick?.(item);
      onToggle(); // Close mobile nav after selection
    }
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < 0) {
      setDragOffset(Math.max(info.offset.x, -300));
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100 || info.velocity.x < -500) {
      onToggle();
    }
    setDragOffset(0);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-r border-white/20';
      default:
        return 'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800';
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.active;

    return (
      <div key={item.id} className="w-full">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className={cn(
            'relative',
            level > 0 && 'ml-4'
          )}
        >
          <button
            onClick={(e) => handleItemClick(item, e)}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-4 px-4 py-4 transition-all duration-200',
              'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800',
              'focus:bg-gray-50 dark:focus:bg-gray-800/50 focus:outline-none',
              isActive && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
              item.disabled && 'opacity-50 cursor-not-allowed',
              'touch-manipulation' // Optimize for touch
            )}
            style={{ minHeight: '56px' }} // Ensure touch-friendly size
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Icon */}
            {item.icon && (
              <div className={cn(
                'flex-shrink-0 w-6 h-6 flex items-center justify-center',
                isActive && 'text-blue-600 dark:text-blue-400'
              )}>
                {item.icon}
              </div>
            )}

            {/* Label */}
            <div className="flex-1 text-left">
              <Typography
                variant="body"
                className={cn(
                  'font-medium',
                  isActive && 'text-blue-600 dark:text-blue-400'
                )}
              >
                {item.label}
              </Typography>
            </div>

            {/* Badge */}
            {item.badge && (
              <Badge
                variant={isActive ? 'primary' : 'secondary'}
                size="sm"
              >
                {item.badge}
              </Badge>
            )}

            {/* Expand/Collapse Icon */}
            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 w-5 h-5"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden bg-gray-50/50 dark:bg-gray-800/30"
            >
              <div className="py-2">
                {item.children?.map((child) => renderNavigationItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: dragOffset }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="x"
            dragConstraints={{ left: -300, right: 0 }}
            dragElastic={0.1}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed left-0 top-0 h-full w-80 max-w-[85vw] z-50 md:hidden',
              'flex flex-col shadow-2xl',
              getVariantClasses(),
              className
            )}
            data-mobile-nav
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <Typography variant="heading-sm" className="font-bold text-gray-900 dark:text-white">
                ConstructPro
              </Typography>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="flex-shrink-0"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Drag Indicator */}
            <div className="flex justify-center py-2 border-b border-gray-200 dark:border-gray-800">
              <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto">
              {items.map((item) => renderNavigationItem(item))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <Typography variant="caption" className="text-gray-500 dark:text-gray-400 text-center">
                Swipe left to close
              </Typography>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;