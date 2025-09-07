'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Menu, PanelLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number | string;
  active?: boolean;
  children?: NavigationItem[];
  disabled?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
  variant?: 'default' | 'glass' | 'solid';
  position?: 'left' | 'top';
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  collapsed = false,
  onToggleCollapse,
  onItemClick,
  className,
  variant = 'glass',
  position = 'left',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg';
      case 'solid':
        return 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm';
      default:
        return 'bg-gray-50/80 backdrop-blur-sm border border-gray-200/50';
    }
  };

  const getPositionClasses = () => {
    if (position === 'top') {
      return 'w-full h-16 flex-row';
    }
    return collapsed ? 'w-16' : 'w-64';
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.active;

    return (
      <div key={item.id} className="w-full">
        <motion.div
          whileHover={{ x: level === 0 ? 4 : 2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'relative group',
            level > 0 && 'ml-4'
          )}
        >
          <button
            onClick={(e) => handleItemClick(item, e)}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              'hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50',
              isActive && 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
              item.disabled && 'opacity-50 cursor-not-allowed',
              collapsed && position === 'left' && 'justify-center px-2'
            )}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-current={isActive ? 'page' : undefined}
          >
            {/* Icon */}
            {item.icon && (
              <div className={cn(
                'flex-shrink-0 w-5 h-5 flex items-center justify-center',
                isActive && 'text-blue-600 dark:text-blue-400'
              )}>
                {item.icon}
              </div>
            )}

            {/* Label */}
            <AnimatePresence>
              {(!collapsed || position === 'top') && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 text-left overflow-hidden"
                >
                  <Typography
                    variant="body-sm"
                    className={cn(
                      'font-medium truncate',
                      isActive && 'text-blue-600 dark:text-blue-400'
                    )}
                  >
                    {item.label}
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Badge */}
            {item.badge && (!collapsed || position === 'top') && (
              <Badge
                variant={isActive ? 'primary' : 'secondary'}
                size="sm"
                className="ml-auto"
              >
                {item.badge}
              </Badge>
            )}

            {/* Expand/Collapse Icon */}
            {hasChildren && (!collapsed || position === 'top') && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 w-4 h-4"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            )}
          </button>

          {/* Tooltip for collapsed state */}
          {collapsed && position === 'left' && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap">
                {item.label}
                {item.badge && (
                  <Badge variant="primary" size="xs" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (!collapsed || position === 'top') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="py-1 space-y-1">
                {item.children?.map((child) => renderNavigationItem(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (position === 'top') {
    return (
      <nav
        className={cn(
          'flex items-center justify-between px-6 py-3',
          getVariantClasses(),
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-6">
          {items.map((item) => renderNavigationItem(item))}
        </div>
        
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </nav>
    );
  }

  return (
    <motion.nav
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'flex flex-col h-full',
        getVariantClasses(),
        getPositionClasses(),
        className
      )}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="heading-sm" className="font-bold text-gray-900 dark:text-white">
                ConstructPro
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
        
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <PanelLeft className="h-4 w-4" />
            </motion.div>
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => renderNavigationItem(item))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <Typography variant="caption" className="text-gray-500 dark:text-gray-400 text-center">
            v1.0.0
          </Typography>
        </div>
      )}
    </motion.nav>
  );
};

export default Navigation;