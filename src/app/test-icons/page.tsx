'use client';

import React, { useState } from 'react';

import {
  HardHatIcon,
  CraneIcon,
  BlueprintIcon,
  MaterialsIcon,
  SafetyIcon,
  ProgressIcon,
  ExcavatorIcon,
  ToolsIcon,
  BuildingIcon,
  CONSTRUCTION_ICON_CATEGORIES,
  type IconProps,
} from '@/components/design-system/atoms/Icon';

const SIZES: Array<IconProps['size']> = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const COLORS: Array<IconProps['color']> = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'muted', 'white'];
const ANIMATIONS: Array<IconProps['animation']> = ['none', 'spin', 'pulse', 'bounce', 'ping', 'wiggle'];

const CONSTRUCTION_ICONS = [
  { component: HardHatIcon, name: 'HardHatIcon', description: 'Safety helmet for construction workers' },
  { component: CraneIcon, name: 'CraneIcon', description: 'Tower crane for heavy lifting' },
  { component: BlueprintIcon, name: 'BlueprintIcon', description: 'Architectural plans and drawings' },
  { component: MaterialsIcon, name: 'MaterialsIcon', description: 'Construction materials like bricks and cement' },
  { component: SafetyIcon, name: 'SafetyIcon', description: 'Safety shield with checkmark' },
  { component: ProgressIcon, name: 'ProgressIcon', description: 'Construction progress tracking' },
  { component: ExcavatorIcon, name: 'ExcavatorIcon', description: 'Heavy excavation machinery' },
  { component: ToolsIcon, name: 'ToolsIcon', description: 'Construction tools and equipment' },
  { component: BuildingIcon, name: 'BuildingIcon', description: 'Building structures and architecture' },
];

export default function TestIconsPage() {
  const [selectedSize, setSelectedSize] = useState<IconProps['size']>('md');
  const [selectedColor, setSelectedColor] = useState<IconProps['color']>('default');
  const [selectedAnimation, setSelectedAnimation] = useState<IconProps['animation']>('none');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Construction Icon Library
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A comprehensive collection of construction industry-specific icons with accessibility features,
            multiple size variants, color options, and interactive animations.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Icon Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Size Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value as IconProps['size'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value as IconProps['color'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {/* Animation Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation
              </label>
              <select
                value={selectedAnimation}
                onChange={(e) => setSelectedAnimation(e.target.value as IconProps['animation'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ANIMATIONS.map((animation) => (
                  <option key={animation} value={animation}>
                    {animation}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Icon Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">All Construction Icons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CONSTRUCTION_ICONS.map(({ component: IconComponent, name, description }) => (
              <div
                key={name}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0">
                  <IconComponent
                    size={selectedSize}
                    color={selectedColor}
                    animation={selectedAnimation}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Icon Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(CONSTRUCTION_ICON_CATEGORIES).map(([category, iconNames]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {iconNames.map((iconName) => {
                    const iconData = CONSTRUCTION_ICONS.find(icon => icon.name === iconName);
                    if (!iconData) {return null;}
                    
                    const { component: IconComponent } = iconData;
                    return (
                      <div key={iconName} className="flex items-center space-x-2">
                        <IconComponent size="sm" color="primary" />
                        <span className="text-xs text-gray-600">{iconName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Showcase */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Size Variants</h2>
          <div className="flex flex-wrap items-end gap-6">
            {SIZES.map((size) => (
              <div key={size} className="text-center">
                <HardHatIcon size={size} color="primary" />
                <p className="text-xs text-gray-500 mt-2">{size}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Color Showcase */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Color Variants</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {COLORS.filter(color => color !== 'white').map((color) => (
              <div key={color} className="text-center">
                <SafetyIcon size="lg" color={color} />
                <p className="text-xs text-gray-500 mt-2 capitalize">{color}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Animation Showcase */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Animation Variants</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {ANIMATIONS.map((animation) => (
              <div key={animation} className="text-center">
                <CraneIcon size="xl" color="primary" animation={animation} />
                <p className="text-xs text-gray-500 mt-2 capitalize">{animation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Accessibility Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">ARIA Labels</h3>
              <p className="text-sm text-gray-600 mb-4">
                All icons include descriptive ARIA labels for screen readers.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <code className="text-sm">
                  aria-label="Hard hat safety helmet"
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Keyboard Navigation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Icons support focus states and can be navigated with keyboard.
              </p>
              <div className="flex space-x-2">
                <HardHatIcon 
                  size="lg" 
                  color="primary" 
                  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  tabIndex={0}
                />
                <SafetyIcon 
                  size="lg" 
                  color="success" 
                  className="focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
                  tabIndex={0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}