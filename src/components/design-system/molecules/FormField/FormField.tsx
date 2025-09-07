'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { forwardRef, useId } from 'react';

import { cn } from '@/lib/utils';

import { Icon } from '../../atoms/Icon';
import { Input } from '../../atoms/Input';
import { Typography } from '../../atoms/Typography';

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  optional?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'glass';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  loading?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  containerClassName?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  description,
  error,
  success,
  required = false,
  optional = false,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  suffix,
  prefix,
  loading = false,
  className,
  labelClassName,
  inputClassName,
  descriptionClassName,
  errorClassName,
  containerClassName,
  id,
  ...props
}, ref) => {
  const fieldId = useId();
  const inputId = id || fieldId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const successId = success ? `${inputId}-success` : undefined;

  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  return (
    <div className={cn('w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
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

      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {prefix}
          </div>
        )}

        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {icon}
          </div>
        )}

        {/* Input */}
        <Input
          ref={ref}
          id={inputId}
          size={size}
          variant={variant}
          className={cn(
            prefix && 'pl-10',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            suffix && 'pr-10',
            loading && 'pr-10',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
            inputClassName
          )}
          aria-describedby={cn(
            descriptionId,
            errorId,
            successId
          ).trim() || undefined}
          aria-invalid={hasError}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {icon}
          </div>
        )}

        {/* Suffix */}
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {suffix}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Icon name="loader" size="sm" className="text-gray-400" />
            </motion.div>
          </div>
        )}

        {/* Success Icon */}
        {hasSuccess && !loading && !suffix && !icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <Icon name="check-circle" size="sm" className="text-green-500" />
          </div>
        )}

        {/* Error Icon */}
        {hasError && !loading && !suffix && !icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
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

FormField.displayName = 'FormField';

export default FormField;