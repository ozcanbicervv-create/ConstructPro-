/**
 * Simple Design System Test Page
 */

'use client';

import React from 'react';
import { SimpleButton } from '@/components/design-system/atoms/Button/SimpleButton';

export default function TestDesign() {
  return (
    <div className="min-h-screen bg-brand-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-brand-gray-900">
          Design System Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-brand-blue-600 mb-4">
              Colors Working
            </h2>
            <div className="space-y-2">
              <div className="w-full h-8 bg-brand-blue-600 rounded"></div>
              <div className="w-full h-8 bg-brand-orange-600 rounded"></div>
              <div className="w-full h-8 bg-success-600 rounded"></div>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-brand-blue-600 mb-4">
              Shadows Working
            </h2>
            <p className="text-brand-gray-700">
              This card has shadow-lg applied
            </p>
          </div>
          
          <div className="p-6 bg-gradient-primary rounded-lg text-white">
            <h2 className="text-xl font-semibold mb-4">
              Gradients Working
            </h2>
            <p>
              This card uses bg-gradient-primary
            </p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-brand-gray-900 mb-4">
            Typography Scale
          </h2>
          <div className="space-y-2">
            <p className="text-xs text-brand-gray-600">Extra Small Text (xs)</p>
            <p className="text-sm text-brand-gray-600">Small Text (sm)</p>
            <p className="text-base text-brand-gray-700">Base Text (base)</p>
            <p className="text-lg text-brand-gray-800">Large Text (lg)</p>
            <p className="text-xl text-brand-gray-900">Extra Large Text (xl)</p>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Simple Buttons Test
          </h2>
          <div className="flex flex-wrap gap-4">
            <SimpleButton variant="primary">Primary Button</SimpleButton>
            <SimpleButton variant="secondary">Secondary Button</SimpleButton>
            <SimpleButton variant="outline">Outline Button</SimpleButton>
          </div>
        </div>
      </div>
    </div>
  );
}