'use client';

import React from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import TextareaField from './TextareaField';
import { Icon } from '../../atoms/Icon';

// Project-specific form field components
export const ProjectNameField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <FormField
    label="Project Name"
    placeholder="Enter project name (e.g., Downtown Office Complex)"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    icon={<Icon name="building" size="sm" />}
    maxLength={100}
  />
);

export const ProjectDescriptionField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => (
  <TextareaField
    label="Project Description"
    description="Provide a detailed description of the construction project"
    placeholder="Describe the project scope, objectives, and key features..."
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    minRows={4}
    maxRows={8}
    showCharCount
    maxLength={1000}
  />
);

export const ProjectTypeField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <SelectField
    label="Project Type"
    placeholder="Select project type"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'residential', label: 'Residential', group: 'Building Types' },
      { value: 'commercial', label: 'Commercial', group: 'Building Types' },
      { value: 'industrial', label: 'Industrial', group: 'Building Types' },
      { value: 'institutional', label: 'Institutional', group: 'Building Types' },
      { value: 'infrastructure', label: 'Infrastructure', group: 'Civil Works' },
      { value: 'transportation', label: 'Transportation', group: 'Civil Works' },
      { value: 'utilities', label: 'Utilities', group: 'Civil Works' },
      { value: 'renovation', label: 'Renovation', group: 'Specialty' },
      { value: 'demolition', label: 'Demolition', group: 'Specialty' },
    ]}
  />
);

export const ProjectLocationField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <FormField
    label="Project Location"
    placeholder="Enter project address or location"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    icon={<Icon name="map-pin" size="sm" />}
  />
);

export const ProjectBudgetField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <FormField
    label="Project Budget"
    placeholder="0.00"
    type="number"
    min="0"
    step="0.01"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    prefix={<span className="text-gray-500">$</span>}
    suffix={<span className="text-gray-500 text-sm">USD</span>}
  />
);

export const ProjectStartDateField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <FormField
    label="Start Date"
    type="date"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    icon={<Icon name="calendar" size="sm" />}
  />
);

export const ProjectEndDateField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <FormField
    label="Expected End Date"
    type="date"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    icon={<Icon name="calendar" size="sm" />}
  />
);

export const ProjectPriorityField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => (
  <SelectField
    label="Priority Level"
    placeholder="Select priority"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'low', label: '🟢 Low Priority' },
      { value: 'medium', label: '🟡 Medium Priority' },
      { value: 'high', label: '🟠 High Priority' },
      { value: 'critical', label: '🔴 Critical Priority' },
    ]}
  />
);

export const ProjectManagerField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  managers?: Array<{ id: string; name: string; email: string }>;
}> = ({ value, onChange, error, required = true, managers = [] }) => (
  <SelectField
    label="Project Manager"
    placeholder="Select project manager"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={managers.map(manager => ({
      value: manager.id,
      label: `${manager.name} (${manager.email})`,
    }))}
  />
);

export const ProjectStatusField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => (
  <SelectField
    label="Project Status"
    placeholder="Select status"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'planning', label: '📋 Planning Phase' },
      { value: 'active', label: '🚧 Active Construction' },
      { value: 'on-hold', label: '⏸️ On Hold' },
      { value: 'completed', label: '✅ Completed' },
      { value: 'delayed', label: '⚠️ Delayed' },
      { value: 'cancelled', label: '❌ Cancelled' },
    ]}
  />
);