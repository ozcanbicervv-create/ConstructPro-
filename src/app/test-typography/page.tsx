/**
 * Typography Test Page
 * 
 * Comprehensive demonstration of the enhanced Typography system
 */

'use client';

import React from 'react';
import { Typography, ConstructionText } from '@/components/design-system/atoms/Typography';

export default function TypographyTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-6 py-12 space-y-16">
        
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <Typography 
            variant="display" 
            size="6xl" 
            gradient="brand"
            responsive
            as="h1"
            className="mb-4"
          >
            ConstructPro Typography
          </Typography>
          <Typography 
            variant="heading" 
            size="xl" 
            color="secondary"
            responsive
            as="h2"
          >
            Modern Typography System with Bold Styling & Construction-Specific Formatting
          </Typography>
        </section>

        {/* Typography Variants */}
        <section className="space-y-8">
          <Typography variant="heading" size="3xl" as="h2" className="border-b border-gray-200 pb-4">
            Typography Variants
          </Typography>
          
          <div className="grid gap-8">
            <div className="space-y-4">
              <Typography variant="heading" size="xl" as="h3">Display Variant</Typography>
              <div className="space-y-2">
                <Typography variant="display" size="5xl" as="h1">Display Extra Large</Typography>
                <Typography variant="display" size="4xl" as="h1">Display Large</Typography>
                <Typography variant="display" size="3xl" as="h1">Display Medium</Typography>
                <Typography variant="display" size="2xl" as="h1">Display Small</Typography>
              </div>
            </div>

            <div className="space-y-4">
              <Typography variant="heading" size="xl" as="h3">Heading Variant</Typography>
              <div className="space-y-2">
                <Typography variant="heading" size="3xl" as="h2">Heading Extra Large</Typography>
                <Typography variant="heading" size="2xl" as="h2">Heading Large</Typography>
                <Typography variant="heading" size="xl" as="h2">Heading Medium</Typography>
                <Typography variant="heading" size="lg" as="h2">Heading Small</Typography>
              </div>
            </div>

            <div className="space-y-4">
              <Typography variant="heading" size="xl" as="h3">Body Variant</Typography>
              <div className="space-y-2">
                <Typography variant="body" size="xl">Body Extra Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
                <Typography variant="body" size="lg">Body Large - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
                <Typography variant="body" size="md">Body Medium - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
                <Typography variant="body" size="sm">Body Small - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
              </div>
            </div>

            <div className="space-y-4">
              <Typography variant="heading" size="xl" as="h3">Caption & Overline</Typography>
              <div className="space-y-2">
                <Typography variant="caption" size="lg">Caption Large - Supporting text and metadata</Typography>
                <Typography variant="caption" size="md">Caption Medium - Supporting text and metadata</Typography>
                <Typography variant="caption" size="sm">Caption Small - Supporting text and metadata</Typography>
                <Typography variant="overline" size="sm">Overline - Category Label</Typography>
              </div>
            </div>
          </div>
        </section>

        {/* Gradient Effects */}
        <section className="space-y-8">
          <Typography variant="heading" size="3xl" as="h2" className="border-b border-gray-200 pb-4">
            Gradient Effects
          </Typography>
          
          <div className="grid gap-6">
            <Typography variant="display" size="4xl" gradient="primary">
              Primary Gradient Effect
            </Typography>
            <Typography variant="display" size="4xl" gradient="secondary">
              Secondary Gradient Effect
            </Typography>
            <Typography variant="display" size="4xl" gradient="success">
              Success Gradient Effect
            </Typography>
            <Typography variant="display" size="4xl" gradient="brand">
              Brand Gradient Effect
            </Typography>
          </div>
        </section>

        {/* Color Variants */}
        <section className="space-y-8">
          <Typography variant="heading" size="3xl" as="h2" className="border-b border-gray-200 pb-4">
            Color Variants
          </Typography>
          
          <div className="grid gap-4">
            <Typography variant="heading" size="xl" color="primary">Primary Color</Typography>
            <Typography variant="heading" size="xl" color="secondary">Secondary Color</Typography>
            <Typography variant="heading" size="xl" color="muted">Muted Color</Typography>
            <Typography variant="heading" size="xl" color="accent">Accent Color</Typography>
            <Typography variant="heading" size="xl" color="success">Success Color</Typography>
            <Typography variant="heading" size="xl" color="warning">Warning Color</Typography>
            <Typography variant="heading" size="xl" color="error">Error Color</Typography>
            <Typography variant="heading" size="xl" color="info">Info Color</Typography>
          </div>
        </section>

        {/* Text Modifiers */}
        <section className="space-y-8">
          <Typography variant="heading" size="3xl" as="h2" className="border-b border-gray-200 pb-4">
            Text Modifiers
          </Typography>
          
          <div className="grid gap-4">
            <Typography variant="body" size="lg" uppercase>Uppercase Text Transformation</Typography>
            <Typography variant="body" size="lg" italic>Italic Text Styling</Typography>
            <Typography variant="body" size="lg" underline>Underlined Text Decoration</Typography>
            <div className="w-64">
              <Typography variant="body" size="lg" truncate>
                This is a very long text that should be truncated when it exceeds the container width
              </Typography>
            </div>
          </div>
        </section>

        {/* Font Weights */}
        <section className="space-y-8">
          <Typography variant="heading" size="3xl" as="h2" className="border-b border-gray-200 pb-4">
            Font Weights
          </Typography>
          
          <div className="grid gap-2">
            <Typography variant="body" size="lg" weight="light">Light Weight (300)</Typography>
            <Typography variant="body" size="lg" weight="normal">Normal Weight (400)</Typography>
            <Typography variant="body" size="lg" weight="medium">Medium Weight (500)</Typography>
            <Typography variant="body" size="lg" weight="semibold">Semibold Weight (600)</Typography>
            <Typography variant="body" size="lg" weight="bold">Bold Weight (700)</Typography>
            <Typography variant="body" size="lg" weight="extrabold">Extrabold Weight (800)</Typography>
            <Typography variant="body" size="lg" weight="black">Black Weight (900)</Typography>
          </div>
        </section>

        {/* Responsive Typography */}
        <section className="space-y-8">
          <Typography variant="heading" size="3xl" as="h2" className="border-b border-gray-200 pb-4">
            Responsive Typography
          </Typography>
          
          <div className="space-y-4">
            <Typography variant="caption" color="muted">
              Resize your browser to see responsive scaling in action
            </Typography>
            <Typography variant="display" size="4xl" responsive>
              Responsive Display Text
            </Typography>
            <Typography variant="heading" size="2xl" responsive>
              Responsive Heading Text
            </Typography>
            <Typography variant="body" size="lg" responsive>
              Responsive body text that adapts to different screen sizes for optimal readability.
            </Typography>
          </div>
        </section>

        {/* Construction-Specific Formatting */}
        <section className="space-y-8">
          <Typography variant="heading" size="3xl" as="h2" className="border-b border-gray-200 pb-4">
            Construction-Specific Formatting
          </Typography>
          
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Currency */}
            <div className="space-y-4">
              <Typography variant="heading" size="lg" as="h3">Currency</Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body">Project Budget:</Typography>
                  <ConstructionText type="currency" value={2500000} />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Spent to Date:</Typography>
                  <ConstructionText type="currency" value={1875000.50} />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Remaining:</Typography>
                  <ConstructionText type="currency" value={624999.50} />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Large Budget (Compact):</Typography>
                  <ConstructionText type="currency" value={15000000} compact />
                </div>
              </div>
            </div>

            {/* Percentages */}
            <div className="space-y-4">
              <Typography variant="heading" size="lg" as="h3">Percentages</Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body">Project Completion:</Typography>
                  <ConstructionText type="percentage" value={87.5} precision={1} />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Budget Utilized:</Typography>
                  <ConstructionText type="percentage" value={75.25} />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Safety Score:</Typography>
                  <ConstructionText type="percentage" value={98.7} precision={1} />
                </div>
              </div>
            </div>

            {/* Measurements */}
            <div className="space-y-4">
              <Typography variant="heading" size="lg" as="h3">Measurements</Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body">Building Height:</Typography>
                  <ConstructionText type="measurement" value={125.5} unit="ft" />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Foundation Depth:</Typography>
                  <ConstructionText type="measurement" value={8.25} unit="ft" />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Lot Width:</Typography>
                  <ConstructionText type="measurement" value={200} unit="ft" />
                </div>
              </div>
            </div>

            {/* Areas and Volumes */}
            <div className="space-y-4">
              <Typography variant="heading" size="lg" as="h3">Areas & Volumes</Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body">Floor Area:</Typography>
                  <ConstructionText type="area" value={15000} unit="sq ft" />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Concrete Volume:</Typography>
                  <ConstructionText type="volume" value={250.5} unit="cu yd" />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Steel Weight:</Typography>
                  <ConstructionText type="weight" value={125000} unit="lbs" />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-4">
              <Typography variant="heading" size="lg" as="h3">Duration</Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body">Project Duration:</Typography>
                  <ConstructionText type="duration" value={7200} /> {/* 2h */}
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Daily Work:</Typography>
                  <ConstructionText type="duration" value={28800} /> {/* 8h */}
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Break Time:</Typography>
                  <ConstructionText type="duration" value={900} /> {/* 15m */}
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">Setup Time:</Typography>
                  <ConstructionText type="duration" value={45} /> {/* 45s */}
                </div>
              </div>
            </div>

            {/* International Formatting */}
            <div className="space-y-4">
              <Typography variant="heading" size="lg" as="h3">International Formatting</Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Typography variant="body">EUR (Germany):</Typography>
                  <ConstructionText type="currency" value={125000} locale="de-DE" currency="EUR" />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">GBP (UK):</Typography>
                  <ConstructionText type="currency" value={95000} locale="en-GB" currency="GBP" />
                </div>
                <div className="flex justify-between">
                  <Typography variant="body">JPY (Japan):</Typography>
                  <ConstructionText type="currency" value={15000000} locale="ja-JP" currency="JPY" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-world Example */}
        <section className="space-y-8">
          <Typography variant="heading" size="3xl" as="h2" className="border-b border-gray-200 pb-4">
            Real-world Example: Project Dashboard
          </Typography>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="space-y-6">
              
              {/* Project Header */}
              <div className="text-center space-y-2">
                <Typography variant="overline" color="muted">Construction Project</Typography>
                <Typography variant="display" size="3xl" gradient="primary">
                  Downtown Office Complex
                </Typography>
                <Typography variant="body" color="secondary">
                  Phase 2 - Foundation & Structural Work
                </Typography>
              </div>

              {/* Key Metrics */}
              <div className="grid md:grid-cols-4 gap-6 py-6 border-y border-gray-200 dark:border-gray-700">
                <div className="text-center space-y-2">
                  <Typography variant="caption" color="muted" uppercase>Total Budget</Typography>
                  <ConstructionText type="currency" value={8500000} />
                </div>
                <div className="text-center space-y-2">
                  <Typography variant="caption" color="muted" uppercase>Completion</Typography>
                  <ConstructionText type="percentage" value={42.8} precision={1} />
                </div>
                <div className="text-center space-y-2">
                  <Typography variant="caption" color="muted" uppercase>Floor Area</Typography>
                  <ConstructionText type="area" value={125000} unit="sq ft" />
                </div>
                <div className="text-center space-y-2">
                  <Typography variant="caption" color="muted" uppercase>Timeline</Typography>
                  <ConstructionText type="duration" value={5184000} /> {/* 60 days in seconds */}
                </div>
              </div>

              {/* Project Details */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Typography variant="heading" size="lg">Current Phase Details</Typography>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Typography variant="body">Concrete Poured:</Typography>
                      <ConstructionText type="volume" value={1250} unit="cu yd" />
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="body">Steel Installed:</Typography>
                      <ConstructionText type="weight" value={85000} unit="lbs" />
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="body">Foundation Area:</Typography>
                      <ConstructionText type="area" value={25000} unit="sq ft" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Typography variant="heading" size="lg">Financial Summary</Typography>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Typography variant="body">Spent to Date:</Typography>
                      <ConstructionText type="currency" value={3640000} />
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="body">Remaining Budget:</Typography>
                      <ConstructionText type="currency" value={4860000} />
                    </div>
                    <div className="flex justify-between">
                      <Typography variant="body">Budget Utilization:</Typography>
                      <ConstructionText type="percentage" value={42.8} precision={1} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <Typography variant="heading" size="md" className="mb-3">Latest Update</Typography>
                <Typography variant="body" color="secondary" className="mb-2">
                  Foundation work is progressing ahead of schedule. We have completed{' '}
                  <ConstructionText type="percentage" value={85} precision={0} />{' '}
                  of the concrete pour and expect to finish by end of week.
                </Typography>
                <Typography variant="caption" color="muted" italic>
                  Last updated: March 15, 2024 at 2:30 PM
                </Typography>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200">
          <Typography variant="caption" color="muted">
            Typography System Test Page - ConstructPro Design System
          </Typography>
        </footer>

      </div>
    </div>
  );
}