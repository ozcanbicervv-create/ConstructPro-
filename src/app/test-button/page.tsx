/**
 * Button Component Test Page
 * 
 * Visual testing page for the modern Button component
 * Shows all variants, sizes, and states
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/design-system/atoms/Button';
import { 
  PlusIcon, 
  ArrowRightIcon, 
  DownloadIcon, 
  TrashIcon,
  SaveIcon,
  EditIcon,
  SearchIcon,
  HeartIcon
} from 'lucide-react';

export default function ButtonTestPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleLoadingTest = (buttonId: string) => {
    setLoading(buttonId);
    setTimeout(() => setLoading(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Modern Button Component Test
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive testing of all button variants, sizes, and states
          </p>
        </div>

        {/* Variants Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Primary</h3>
              <Button variant="primary">Primary Button</Button>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Secondary</h3>
              <Button variant="secondary">Secondary Button</Button>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Outline</h3>
              <Button variant="outline">Outline Button</Button>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Ghost</h3>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Destructive</h3>
              <Button variant="destructive">Destructive Button</Button>
            </div>
          </div>
        </section>

        {/* Sizes Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Button Sizes</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Extra Small (xs)</p>
              <Button size="xs" variant="primary">XS Button</Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Small (sm)</p>
              <Button size="sm" variant="primary">SM Button</Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Medium (md)</p>
              <Button size="md" variant="primary">MD Button</Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Large (lg)</p>
              <Button size="lg" variant="primary">LG Button</Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Extra Large (xl)</p>
              <Button size="xl" variant="primary">XL Button</Button>
            </div>
          </div>
        </section>

        {/* Icons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Buttons with Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button icon={<PlusIcon />} variant="primary">
              Add Item
            </Button>
            <Button icon={<ArrowRightIcon />} iconPosition="right" variant="secondary">
              Next Step
            </Button>
            <Button icon={<DownloadIcon />} variant="outline">
              Download
            </Button>
            <Button icon={<SearchIcon />} variant="ghost">
              Search
            </Button>
          </div>
        </section>

        {/* Loading States Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="primary" 
              loading={loading === 'save'}
              onClick={() => handleLoadingTest('save')}
            >
              Save Changes
            </Button>
            <Button 
              variant="secondary" 
              loading={loading === 'upload'}
              onClick={() => handleLoadingTest('upload')}
              icon={<DownloadIcon />}
            >
              Upload File
            </Button>
            <Button 
              variant="outline" 
              loading={loading === 'process'}
              onClick={() => handleLoadingTest('process')}
            >
              Process Data
            </Button>
          </div>
        </section>

        {/* States Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Button States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Normal</h3>
              <Button variant="primary">Normal Button</Button>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Disabled</h3>
              <Button variant="primary" disabled>Disabled Button</Button>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Loading</h3>
              <Button variant="primary" loading>Loading Button</Button>
            </div>
          </div>
        </section>

        {/* Full Width Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Full Width Buttons</h2>
          <div className="space-y-4 max-w-md">
            <Button variant="primary" fullWidth>
              Full Width Primary
            </Button>
            <Button variant="secondary" fullWidth icon={<SaveIcon />}>
              Full Width with Icon
            </Button>
            <Button variant="outline" fullWidth loading={loading === 'fullwidth'} onClick={() => handleLoadingTest('fullwidth')}>
              Full Width Loading
            </Button>
          </div>
        </section>

        {/* Construction Industry Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Construction Industry Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="primary" icon={<PlusIcon />}>
              Create Project
            </Button>
            <Button variant="secondary" icon={<EditIcon />}>
              Edit Blueprint
            </Button>
            <Button variant="outline" icon={<DownloadIcon />}>
              Export Report
            </Button>
            <Button variant="ghost" icon={<SearchIcon />}>
              Find Materials
            </Button>
            <Button variant="destructive" icon={<TrashIcon />}>
              Delete Task
            </Button>
            <Button variant="primary" icon={<HeartIcon />} size="lg">
              Mark Favorite
            </Button>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Interactive Demo</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">
              Click the buttons below to test interactions and animations:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="primary" 
                onClick={() => alert('Primary button clicked!')}
              >
                Click Me
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => console.log('Secondary button clicked')}
              >
                Log to Console
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleLoadingTest('demo')}
                loading={loading === 'demo'}
              >
                Test Loading
              </Button>
            </div>
          </div>
        </section>

        {/* Accessibility Demo */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Accessibility Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Keyboard Navigation</h3>
              <p className="text-sm text-gray-600">Use Tab to navigate between buttons, Enter/Space to activate</p>
              <div className="space-y-2">
                <Button variant="primary">First Button</Button>
                <Button variant="secondary">Second Button</Button>
                <Button variant="outline">Third Button</Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Screen Reader Support</h3>
              <p className="text-sm text-gray-600">Buttons with proper ARIA labels and descriptions</p>
              <div className="space-y-2">
                <Button variant="primary" aria-label="Save document">
                  💾
                </Button>
                <Button variant="secondary" aria-describedby="help-text">
                  Help
                </Button>
                <p id="help-text" className="text-xs text-gray-500">
                  This button opens the help documentation
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}