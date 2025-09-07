'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { forwardRef, useId } from 'react';

import { cn } from '@/lib/utils';

import { Icon } from '../../atoms/Icon';
import { Typography } from '../../atoms/Typography';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectFieldProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  optional?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'glass';
  options: SelectOption[];
  placeholder?: string;
  loading?: boolean;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  containerClassName?: string;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(({
  label,
  description,
  error,
  success,
  required = false,
  optional = false,
  size = 'md',
  variant = 'default',
  options,
  placeholder,
  loading = false,
  className,
  labelClassName,
  selectClassName,
  descriptionClassName,
  errorClassName,
  containerClassName,
  id,
  ...props
}, ref) => {
  const fieldId = useId();
  const selectId = id || fieldId;
  const descriptionId = description ? `${selectId}-description` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const successId = success ? `${selectId}-success` : undefined;

  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return 'bg-gray-50 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500';
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border-white/20 focus:bg-white/20 focus:border-white/40';
      default:
        return 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-3 text-base';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  // Group options by their group property
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  const hasGroups = Object.keys(groupedOptions).length > 1 || !groupedOptions.default;

  return (
    <div className={cn('w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className={cn(
            'block text-sm font-medium text-gray-900 dark:text-white mb-2',
            hasError && 'text-red-600 dark:text-red-400',
            hasSuccess && 'text-green-600 dark:text-green-400',
            labelClassName
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
          {optional && (
            <span className="text-gray-500 ml-1 font-normal">
              (optional)
            </span>
          )}
        </label>
      )}

      {/* Description */}
      {description && (
        <Typography
          variant="body-sm"
          className={cn(
            'text-gray-600 dark:text-gray-400 mb-2',
            descriptionClassName
          )}
          id={descriptionId}
        >
          {description}
        </Typography>
      )}

      {/* Select Container */}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={loading}
          className={cn(
            'w-full rounded-lg border transition-all duration-200 appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'dark:text-white pr-10',
            getVariantClasses(),
            getSizeClasses(),
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
            selectClassName
          )}
          aria-describedby={cn(
            descriptionId,
            errorId,
            successId
          ).trim() || undefined}
          aria-invalid={hasError}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {hasGroups ? (
            Object.entries(groupedOptions).map(([group, groupOptions]) => (
              group === 'default' ? (
                groupOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))
              ) : (
                <optgroup key={group} label={group}>
                  {groupOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              )
            ))
          ) : (
            options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))
          )}
        </select>

        {/* Dropdown Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Icon name="loader" size="sm" className="text-gray-400" />
            </motion.div>
          ) : (
            <Icon name="chevron-down" size="sm" className="text-gray-400" />
          )}
        </div>

        {/* Success Icon */}
        {hasSuccess && !loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="check-circle" size="sm" className="text-green-500" />
          </div>
        )}

        {/* Error Icon */}
        {hasError && !loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon name="alert-circle" size="sm" className="text-red-500" />
          </div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2">
              <Icon name="alert-circle" size="xs" className="text-red-500 mt-0.5 flex-shrink-0" />
              <Typography
                variant="body-sm"
                className={cn('text-red-600 dark:text-red-400', errorClassName)}
                id={errorId}
                role="alert"
              >
                {error}
              </Typography>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {success && !error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2">
              <Icon name="check-circle" size="xs" className="text-green-500 mt-0.5 flex-shrink-0" />
              <Typography
                variant="body-sm"
                className="text-green-600 dark:text-green-400"
                id={successId}
              >
                {success}
              </Typography>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SelectField.displayName = 'SelectField';

export default SelectField;