'use client';

import React, { useState } from 'react';
import {
  FormField,
  TextareaField,
  SelectField,
  ProjectNameField,
  ProjectDescriptionField,
  ProjectTypeField,
  ProjectLocationField,
  ProjectBudgetField,
  ProjectStartDateField,
  ProjectEndDateField,
  ProjectPriorityField,
  TaskTitleField,
  TaskDescriptionField,
  TaskCategoryField,
  TaskPriorityField,
  TaskDueDateField,
  MaterialNameField,
  MaterialCategoryField,
  MaterialPriceField,
  MaterialUnitField,
  MaterialSpecificationsField,
  MaterialCertificationsField,
} from '@/components/design-system/molecules/FormField';
import { Typography } from '@/components/design-system/atoms/Typography';
import { Button } from '@/components/design-system/atoms/Button';
import { Icon } from '@/components/design-system/atoms/Icon';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/design-system/molecules/Card';

export default function TestFormsPage() {
  const [formData, setFormData] = useState({
    // Basic form fields
    basicText: '',
    basicEmail: '',
    basicPassword: '',
    basicTextarea: '',
    basicSelect: '',
    
    // Project form
    projectName: '',
    projectDescription: '',
    projectType: '',
    projectLocation: '',
    projectBudget: '',
    projectStartDate: '',
    projectEndDate: '',
    projectPriority: '',
    
    // Task form
    taskTitle: '',
    taskDescription: '',
    taskCategory: '',
    taskPriority: '',
    taskDueDate: '',
    
    // Material form
    materialName: '',
    materialCategory: '',
    materialPrice: '',
    materialUnit: '',
    materialSpecs: {},
    materialCerts: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show success for valid fields
    if (value.length > 0) {
      setShowSuccess(prev => ({ ...prev, [field]: true }));
    } else {
      setShowSuccess(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateRequired = (value: string, fieldName: string) => {
    if (!value.trim()) return `${fieldName} is required`;
    return '';
  };

  const handleBlur = (field: string, validator?: (value: string) => string) => () => {
    if (validator) {
      const error = validator(formData[field as keyof typeof formData] as string);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const selectOptions = [
    { value: '', label: 'Choose an option' },
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
    { value: 'group1-opt1', label: 'Group 1 Option 1', group: 'Group 1' },
    { value: 'group1-opt2', label: 'Group 1 Option 2', group: 'Group 1' },
    { value: 'group2-opt1', label: 'Group 2 Option 1', group: 'Group 2' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="heading-xl" className="font-bold text-gray-900 mb-2">
            Form Field Components Demo
          </Typography>
          <Typography variant="body" className="text-gray-600">
            Comprehensive form field system with validation and construction-specific patterns.
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Form Fields */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Basic Form Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Input */}
              <FormField
                label="Text Input"
                placeholder="Enter text"
                value={formData.basicText}
                onChange={handleInputChange('basicText')}
                icon={<Icon name="type" size="sm" />}
                description="Basic text input with icon"
              />

              {/* Email with Validation */}
              <FormField
                label="Email Address"
                type="email"
                placeholder="Enter email"
                value={formData.basicEmail}
                onChange={handleInputChange('basicEmail')}
                onBlur={handleBlur('basicEmail', validateEmail)}
                error={errors.basicEmail}
                success={formData.basicEmail && !errors.basicEmail ? 'Email is valid' : undefined}
                icon={<Icon name="mail" size="sm" />}
                required
              />

              {/* Password */}
              <FormField
                label="Password"
                type="password"
                placeholder="Enter password"
                value={formData.basicPassword}
                onChange={handleInputChange('basicPassword')}
                icon={<Icon name="lock" size="sm" />}
                required
              />

              {/* Textarea */}
              <TextareaField
                label="Description"
                placeholder="Enter description..."
                value={formData.basicTextarea}
                onChange={handleInputChange('basicTextarea')}
                description="Multi-line text input with character count"
                showCharCount
                maxLength={200}
                minRows={3}
                maxRows={6}
              />

              {/* Select */}
              <SelectField
                label="Select Option"
                placeholder="Choose an option"
                value={formData.basicSelect}
                onChange={handleInputChange('basicSelect')}
                options={selectOptions}
                description="Dropdown with grouped options"
              />
            </CardContent>
          </Card>

          {/* Variants Demo */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Field Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Variant */}
              <FormField
                label="Default Variant"
                placeholder="Default styling"
                variant="default"
                icon={<Icon name="circle" size="sm" />}
              />

              {/* Glass Variant */}
              <FormField
                label="Glass Variant"
                placeholder="Glassmorphism effect"
                variant="glass"
                icon={<Icon name="sparkles" size="sm" />}
              />

              {/* Filled Variant */}
              <FormField
                label="Filled Variant"
                placeholder="Filled background"
                variant="filled"
                icon={<Icon name="square" size="sm" />}
              />

              {/* With Prefix/Suffix */}
              <FormField
                label="Price Field"
                placeholder="0.00"
                type="number"
                prefix={<span className="text-gray-500">$</span>}
                suffix={<span className="text-gray-500 text-sm">USD</span>}
              />

              {/* Loading State */}
              <FormField
                label="Loading State"
                placeholder="Processing..."
                loading
                disabled
              />

              {/* Error State */}
              <FormField
                label="Error State"
                placeholder="This field has an error"
                error="This field is required and must be filled out"
                value=""
              />

              {/* Success State */}
              <FormField
                label="Success State"
                placeholder="This field is valid"
                success="Field validation passed successfully"
                value="Valid input"
              />
            </CardContent>
          </Card>
        </div>

        {/* Construction-Specific Forms */}
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Project Form */}
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Project Form Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProjectNameField
                value={formData.projectName}
                onChange={handleInputChange('projectName')}
                error={errors.projectName}
                required
              />

              <ProjectTypeField
                value={formData.projectType}
                onChange={handleInputChange('projectType')}
                required
              />

              <ProjectLocationField
                value={formData.projectLocation}
                onChange={handleInputChange('projectLocation')}
                required
              />

              <ProjectBudgetField
                value={formData.projectBudget}
                onChange={handleInputChange('projectBudget')}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <ProjectStartDateField
                  value={formData.projectStartDate}
                  onChange={handleInputChange('projectStartDate')}
                  required
                />

                <ProjectEndDateField
                  value={formData.projectEndDate}
                  onChange={handleInputChange('projectEndDate')}
                  required
                />
              </div>

              <ProjectPriorityField
                value={formData.projectPriority}
                onChange={handleInputChange('projectPriority')}
              />

              <ProjectDescriptionField
                value={formData.projectDescription}
                onChange={handleInputChange('projectDescription')}
              />
            </CardContent>
          </Card>

          {/* Task Form */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Task Form Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TaskTitleField
                value={formData.taskTitle}
                onChange={handleInputChange('taskTitle')}
                required
              />

              <TaskCategoryField
                value={formData.taskCategory}
                onChange={handleInputChange('taskCategory')}
                required
              />

              <TaskPriorityField
                value={formData.taskPriority}
                onChange={handleInputChange('taskPriority')}
                required
              />

              <TaskDueDateField
                value={formData.taskDueDate}
                onChange={handleInputChange('taskDueDate')}
                minDate={new Date().toISOString().split('T')[0]}
                required
              />

              <TaskDescriptionField
                value={formData.taskDescription}
                onChange={handleInputChange('taskDescription')}
              />

              {/* Simulated complex fields */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400 mb-2">
                  Advanced Task Fields
                </Typography>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• Task Dependencies (Multi-select)</div>
                  <div>• Task Tags (Dynamic input)</div>
                  <div>• Estimated Hours (Numeric)</div>
                  <div>• Assignee Selection (User picker)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Material Form */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>Material Form Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MaterialNameField
                value={formData.materialName}
                onChange={handleInputChange('materialName')}
                required
              />

              <MaterialCategoryField
                value={formData.materialCategory}
                onChange={handleInputChange('materialCategory')}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <MaterialPriceField
                  value={formData.materialPrice}
                  onChange={handleInputChange('materialPrice')}
                  required
                />

                <MaterialUnitField
                  value={formData.materialUnit}
                  onChange={handleInputChange('materialUnit')}
                  required
                />
              </div>

              <MaterialSpecificationsField
                value={formData.materialSpecs}
                onChange={(specs) => setFormData(prev => ({ ...prev, materialSpecs: specs }))}
              />

              <MaterialCertificationsField
                value={formData.materialCerts}
                onChange={(certs) => setFormData(prev => ({ ...prev, materialCerts: certs }))}
              />

              {/* Simulated complex fields */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Typography variant="body-sm" className="text-gray-600 dark:text-gray-400 mb-2">
                  Additional Material Fields
                </Typography>
                <div className="space-y-2 text-sm text-gray-500">
                  <div>• Supplier Selection (Dropdown with ratings)</div>
                  <div>• Availability Status (Status selector)</div>
                  <div>• Lead Time (Numeric with units)</div>
                  <div>• Minimum Order Quantity</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Features */}
        <div className="mt-8">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Form Field Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <Icon name="check-circle" size="lg" className="mx-auto mb-3 text-green-600" />
                  <Typography variant="heading-sm" className="mb-2">Real-time Validation</Typography>
                  <Typography variant="body-sm" className="text-gray-600">
                    Smooth error state transitions with helpful messages
                  </Typography>
                </div>

                <div className="text-center">
                  <Icon name="accessibility" size="lg" className="mx-auto mb-3 text-blue-600" />
                  <Typography variant="heading-sm" className="mb-2">Accessibility</Typography>
                  <Typography variant="body-sm" className="text-gray-600">
                    WCAG 2.1 AA compliant with proper ARIA attributes
                  </Typography>
                </div>

                <div className="text-center">
                  <Icon name="building" size="lg" className="mx-auto mb-3 text-orange-600" />
                  <Typography variant="heading-sm" className="mb-2">Industry-Specific</Typography>
                  <Typography variant="body-sm" className="text-gray-600">
                    Pre-built patterns for construction workflows
                  </Typography>
                </div>

                <div className="text-center">
                  <Icon name="palette" size="lg" className="mx-auto mb-3 text-purple-600" />
                  <Typography variant="heading-sm" className="mb-2">Multiple Variants</Typography>
                  <Typography variant="body-sm" className="text-gray-600">
                    Glass, filled, and default styling options
                  </Typography>
                </div>

                <div className="text-center">
                  <Icon name="zap" size="lg" className="mx-auto mb-3 text-yellow-600" />
                  <Typography variant="heading-sm" className="mb-2">Smooth Animations</Typography>
                  <Typography variant="body-sm" className="text-gray-600">
                    Framer Motion powered transitions and effects
                  </Typography>
                </div>

                <div className="text-center">
                  <Icon name="smartphone" size="lg" className="mx-auto mb-3 text-gray-600" />
                  <Typography variant="heading-sm" className="mb-2">Mobile Optimized</Typography>
                  <Typography variant="body-sm" className="text-gray-600">
                    Touch-friendly inputs with responsive design
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setFormData({
                basicText: '',
                basicEmail: '',
                basicPassword: '',
                basicTextarea: '',
                basicSelect: '',
                projectName: '',
                projectDescription: '',
                projectType: '',
                projectLocation: '',
                projectBudget: '',
                projectStartDate: '',
                projectEndDate: '',
                projectPriority: '',
                taskTitle: '',
                taskDescription: '',
                taskCategory: '',
                taskPriority: '',
                taskDueDate: '',
                materialName: '',
                materialCategory: '',
                materialPrice: '',
                materialUnit: '',
                materialSpecs: {},
                materialCerts: [],
              });
              setErrors({});
              setShowSuccess({});
            }}
          >
            <Icon name="refresh-cw" size="sm" className="mr-2" />
            Reset Forms
          </Button>
          
          <Button
            variant="primary"
            onClick={() => {
              console.log('Form Data:', formData);
              alert('Check console for form data');
            }}
          >
            <Icon name="save" size="sm" className="mr-2" />
            Submit Forms
          </Button>
        </div>
      </div>
    </div>
  );
}