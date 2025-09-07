/**
 * Secure Input Component
 * Enhanced input with security features and validation
 */

"use client";

import React, { useState, useCallback } from 'react';
import { AccessibleInput } from '@/components/ui/accessible-input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Copy,
  RefreshCw,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrength {
  score: number;
  feedback: string[];
  suggestions: string[];
}

interface SecureInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'password' | 'text' | 'email';
  label?: string;
  description?: string;
  error?: string;
  showStrengthMeter?: boolean;
  showGenerator?: boolean;
  showCopyButton?: boolean;
  minStrength?: number;
  onStrengthChange?: (strength: PasswordStrength) => void;
  className?: string;
}

export function SecureInput({
  type = 'password',
  label,
  description,
  error,
  showStrengthMeter = false,
  showGenerator = false,
  showCopyButton = false,
  minStrength = 3,
  onStrengthChange,
  value,
  onChange,
  className,
  ...props
}: SecureInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>({ score: 0, feedback: [], suggestions: [] });
  const [copied, setCopied] = useState(false);

  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, feedback: [], suggestions: ['Enter a password'] };
    }

    let score = 0;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      suggestions.push('Use at least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Add uppercase letters');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Add lowercase letters');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Add numbers');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      suggestions.push('Add special characters');
    }

    // Common patterns check
    const commonPatterns = ['123', 'abc', 'password', 'qwerty'];
    const hasCommonPattern = commonPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    );
    
    if (hasCommonPattern) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid common patterns');
    }

    // Length bonus
    if (password.length >= 12) {
      score += 1;
    }

    return { score: Math.min(5, score), feedback, suggestions };
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (showStrengthMeter && type === 'password') {
      const newStrength = calculatePasswordStrength(newValue);
      setStrength(newStrength);
      onStrengthChange?.(newStrength);
    }
    
    onChange?.(e);
  }, [calculatePasswordStrength, showStrengthMeter, type, onChange, onStrengthChange]);

  const generateSecurePassword = useCallback(() => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let password = '';
    
    // Ensure at least one character from each category
    const categories = [
      'abcdefghijklmnopqrstuvwxyz',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '0123456789',
      '!@#$%^&*()'
    ];
    
    categories.forEach(category => {
      password += category.charAt(Math.floor(Math.random() * category.length));
    });
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // Create synthetic event
    const syntheticEvent = {
      target: { value: password }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handlePasswordChange(syntheticEvent);
  }, [handlePasswordChange]);

  const copyToClipboard = useCallback(async () => {
    if (typeof value === 'string' && value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  }, [value]);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return 'Very Weak';
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthIcon = (score: number) => {
    if (score <= 2) return ShieldAlert;
    if (score <= 3) return Shield;
    return ShieldCheck;
  };

  const StrengthIcon = getStrengthIcon(strength.score);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <AccessibleInput
          {...props}
          type={type === 'password' && showPassword ? 'text' : type}
          label={label}
          description={description}
          error={error}
          value={value}
          onChange={handlePasswordChange}
          className="pr-20"
        />
        
        {/* Action buttons */}
        <div className="absolute right-2 top-8 flex items-center gap-1">
          {showCopyButton && value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={copyToClipboard}
              aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {showGenerator && type === 'password' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={generateSecurePassword}
              aria-label="Generate secure password"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          
          {type === 'password' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Password strength meter */}
      {showStrengthMeter && type === 'password' && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StrengthIcon className={cn(
                "h-4 w-4",
                strength.score <= 2 ? "text-red-500" : 
                strength.score <= 3 ? "text-yellow-500" : 
                "text-green-500"
              )} />
              <span className="text-sm font-medium">
                Password Strength: {getStrengthLabel(strength.score)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {strength.score}/5
            </span>
          </div>
          
          <Progress 
            value={(strength.score / 5) * 100} 
            className="h-2"
          />
          
          {strength.suggestions.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <div className="font-medium mb-1">Suggestions:</div>
              <ul className="list-disc list-inside space-y-0.5">
                {strength.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          {strength.feedback.length > 0 && (
            <div className="text-xs text-red-600">
              {strength.feedback.map((feedback, index) => (
                <div key={index}>{feedback}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}