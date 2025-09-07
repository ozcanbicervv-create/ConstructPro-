/**
 * Design System Demo Page
 * 
 * Demonstrates the modern design system components and tokens
 */

'use client';

import React from 'react';
import { Button } from '@/components/design-system/atoms/Button';
import { Typography } from '@/components/design-system/atoms/Typography';
import { Input } from '@/components/design-system/atoms/Input';

export default function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-gray-50 to-brand-blue-50 p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <Typography variant="display" size="xl" color="primary">
              Modern Design System
            </Typography>
            <Typography variant="body" size="lg" color="secondary">
              ConstructPro Design System Foundation Demo
            </Typography>
          </div>

          {/* Typography Section */}
          <section className="space-y-6">
            <Typography variant="heading" size="lg" color="primary">
              Typography
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Typography variant="display" size="md">Display Text</Typography>
                <Typography variant="heading" size="md">Heading Text</Typography>
                <Typography variant="body" size="md">Body text for regular content and paragraphs.</Typography>
                <Typography variant="caption" size="md">Caption text for small details</Typography>
                <Typography variant="overline" size="md">Overline Text</Typography>
              </div>
              <div className="space-y-4">
                <Typography variant="heading" size="sm" color="accent">Color Variants</Typography>
                <Typography variant="body" size="md" color="primary">Primary Color</Typography>
                <Typography variant="body" size="md" color="secondary">Secondary Color</Typography>
                <Typography variant="body" size="md" color="muted">Muted Color</Typography>
                <Typography variant="body" size="md" color="accent">Accent Color</Typography>
              </div>
            </div>
          </section>

          {/* Buttons Section */}
          <section className="space-y-6">
            <Typography variant="heading" size="lg" color="primary">
              Buttons
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Typography variant="heading" size="sm" color="accent">Button Variants</Typography>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>
              <div className="space-y-4">
                <Typography variant="heading" size="sm" color="accent">Button Sizes</Typography>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Typography variant="heading" size="sm" color="accent">Button States</Typography>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width Button</Button>
              </div>
            </div>
          </section>

          {/* Inputs Section */}
          <section className="space-y-6">
            <Typography variant="heading" size="lg" color="primary">
              Inputs
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input 
                  label="Default Input"
                  placeholder="Enter text..."
                  helper="This is helper text"
                />
                <Input 
                  label="Filled Input"
                  variant="filled"
                  placeholder="Enter text..."
                />
                <Input 
                  label="Glass Input"
                  variant="glass"
                  placeholder="Enter text..."
                />
              </div>
              <div className="space-y-4">
                <Input 
                  label="Input with Error"
                  placeholder="Enter text..."
                  error="This field is required"
                />
                <Input 
                  label="Disabled Input"
                  placeholder="Disabled input"
                  disabled
                />
                <Input 
                  label="Large Input"
                  size="lg"
                  placeholder="Large input..."
                />
              </div>
            </div>
          </section>

          {/* Design Tokens Section */}
          <section className="space-y-6">
            <Typography variant="heading" size="lg" color="primary">
              Design Tokens
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Colors */}
              <div className="space-y-4">
                <Typography variant="heading" size="sm" color="accent">Colors</Typography>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue-600"></div>
                    <Typography variant="caption" size="md">Brand Blue</Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-orange-600"></div>
                    <Typography variant="caption" size="md">Brand Orange</Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-600"></div>
                    <Typography variant="caption" size="md">Success</Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-600"></div>
                    <Typography variant="caption" size="md">Warning</Typography>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-error"></div>
                    <Typography variant="caption" size="md">Error</Typography>
                  </div>
                </div>
              </div>

              {/* Shadows */}
              <div className="space-y-4">
                <Typography variant="heading" size="sm" color="accent">Shadows</Typography>
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <Typography variant="caption" size="md">Small Shadow</Typography>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-md">
                    <Typography variant="caption" size="md">Medium Shadow</Typography>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-lg">
                    <Typography variant="caption" size="md">Large Shadow</Typography>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-glass">
                    <Typography variant="caption" size="md">Glass Shadow</Typography>
                  </div>
                </div>
              </div>

              {/* Border Radius */}
              <div className="space-y-4">
                <Typography variant="heading" size="sm" color="accent">Border Radius</Typography>
                <div className="space-y-3">
                  <div className="p-4 bg-brand-blue-100 rounded-sm">
                    <Typography variant="caption" size="md">Small Radius</Typography>
                  </div>
                  <div className="p-4 bg-brand-blue-100 rounded-md">
                    <Typography variant="caption" size="md">Medium Radius</Typography>
                  </div>
                  <div className="p-4 bg-brand-blue-100 rounded-lg">
                    <Typography variant="caption" size="md">Large Radius</Typography>
                  </div>
                  <div className="p-4 bg-brand-blue-100 rounded-2xl">
                    <Typography variant="caption" size="md">Extra Large Radius</Typography>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Gradients Section */}
          <section className="space-y-6">
            <Typography variant="heading" size="lg" color="primary">
              Gradients & Effects
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-gradient-primary rounded-xl text-white">
                <Typography variant="heading" size="md" className="text-white">
                  Primary Gradient
                </Typography>
                <Typography variant="body" size="md" className="text-white/90">
                  Beautiful gradient backgrounds for hero sections
                </Typography>
              </div>
              <div className="p-8 bg-gradient-secondary rounded-xl text-white">
                <Typography variant="heading" size="md" className="text-white">
                  Secondary Gradient
                </Typography>
                <Typography variant="body" size="md" className="text-white/90">
                  Alternative gradient for variety
                </Typography>
              </div>
            </div>
          </section>

          {/* Animation Demo */}
          <section className="space-y-6">
            <Typography variant="heading" size="lg" color="primary">
              Animations
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Typography variant="heading" size="sm" color="accent">Hover Effects</Typography>
                <Typography variant="body" size="sm" color="secondary">
                  Hover over this card to see the animation
                </Typography>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-md animate-fade-in">
                <Typography variant="heading" size="sm" color="accent">Fade In</Typography>
                <Typography variant="body" size="sm" color="secondary">
                  This card fades in on load
                </Typography>
              </div>
              <div className="p-6 bg-white rounded-xl shadow-md animate-slide-in-right">
                <Typography variant="heading" size="sm" color="accent">Slide In</Typography>
                <Typography variant="body" size="sm" color="secondary">
                  This card slides in from the right
                </Typography>
              </div>
            </div>
          </section>
        </div>
      </div>
  );
}