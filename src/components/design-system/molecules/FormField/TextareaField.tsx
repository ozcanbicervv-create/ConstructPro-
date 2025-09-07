'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { forwardRef, useId } from 'react';

import { cn } from '@/lib/utils';

import { Icon } from '../../atoms/Icon';
import { Typography } from '../../atoms/Typography';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  optional?: boolean;
  variant?: 'default' | 'filled' | 'glass';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  minRows?: number;
  maxRows?: number;
  showCharCount?: boolean;
  maxLength?: number;
  className?: string;
  labelClassName?: string;
  textareaClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  containerClassName?: string;
}

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(({
  label,
  description,
  error,
  success,
  required = false,
  optional = false,
  variant = 'default',
  resize = 'vertical',
  minRows = 3,
  maxRows,
  showCharCount = false,
  maxLength,
  className,
  labelClassName,
  textareaClassName,
  descriptionClassName,
  errorClassName,
  containerClassName,
  id,
  value,
  ...props
}, ref) => {
  const fieldId = useId();
  const textareaId = id || fieldId;
  const descriptionId = description ? `${textareaId}-description` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const successId = success ? `${textareaId}-success` : undefined;

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

  const getResizeClasses = () => {
    switch (resize) {
      case 'none':
        return 'resize-none';
      case 'horizontal':
        return 'resize-x';
      case 'both':
        return 'resize';
      default:
        return 'resize-y';
    }
  };

  const currentLength = typeof value === 'string' ? value.length : 0;
  const showCount = showCharCount && (maxLength || currentLength > 0);

  return (
    <div className={cn('w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={textareaId}
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

      {/* Textarea Container */}
      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          rows={minRows}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border transition-all duration-200',
            'placeholder:text-gray-500 dark:placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'dark:text-white',
            getVariantClasses(),
            getResizeClasses(),
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
            textareaClassName
          )}
          style={{
            minHeight: `${minRows * 1.5}rem`,
            maxHeight: maxRows ? `${maxRows * 1.5}rem` : undefined,
          }}
          aria-describedby={cn(
            descriptionId,
            errorId,
            successId
          ).trim() || undefined}
          aria-invalid={hasError}
          {...props}
        />

        {/* Character Count */}
        {showCount && (
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <Typography
              variant="caption"
              className={cn(
                'text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 px-1 rounded',
                maxLength && currentLength > maxLength * 0.9 && 'text-orange-600 dark:text-orange-400',
                maxLength && currentLength >= maxLength && 'text-red-600 dark:text-red-400'
              )}
            >
              {currentLength}{maxLength && `/${maxLength}`}
            </Typography>
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

TextareaField.displayName = 'TextareaField';

export default TextareaField;