'use client';

import React from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import TextareaField from './TextareaField';
import { Icon } from '../../atoms/Icon';

// Material-specific form field components
export const MaterialNameField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <FormField
    label="Material Name"
    placeholder="Enter material name (e.g., High-Strength Concrete Mix)"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    icon={<Icon name="package" size="sm" />}
    maxLength={100}
  />
);

export const MaterialDescriptionField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => (
  <TextareaField
    label="Material Description"
    description="Provide detailed specifications and characteristics"
    placeholder="Describe the material properties, applications, and specifications..."
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    minRows={3}
    maxRows={6}
    showCharCount
    maxLength={500}
  />
);

export const MaterialCategoryField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <SelectField
    label="Material Category"
    placeholder="Select material category"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'concrete', label: 'Concrete & Cement', group: 'Structural Materials' },
      { value: 'steel', label: 'Steel & Metal', group: 'Structural Materials' },
      { value: 'lumber', label: 'Lumber & Wood', group: 'Structural Materials' },
      { value: 'masonry', label: 'Masonry & Stone', group: 'Structural Materials' },
      { value: 'electrical', label: 'Electrical Components', group: 'MEP Materials' },
      { value: 'plumbing', label: 'Plumbing & Pipes', group: 'MEP Materials' },
      { value: 'hvac', label: 'HVAC Equipment', group: 'MEP Materials' },
      { value: 'insulation', label: 'Insulation', group: 'Building Envelope' },
      { value: 'roofing', label: 'Roofing Materials', group: 'Building Envelope' },
      { value: 'siding', label: 'Siding & Cladding', group: 'Building Envelope' },
      { value: 'windows', label: 'Windows & Doors', group: 'Building Envelope' },
      { value: 'flooring', label: 'Flooring Materials', group: 'Interior Finishes' },
      { value: 'drywall', label: 'Drywall & Panels', group: 'Interior Finishes' },
      { value: 'paint', label: 'Paint & Coatings', group: 'Interior Finishes' },
      { value: 'fixtures', label: 'Fixtures & Hardware', group: 'Interior Finishes' },
      { value: 'safety', label: 'Safety Equipment', group: 'Safety & Tools' },
      { value: 'tools', label: 'Tools & Equipment', group: 'Safety & Tools' },
    ]}
  />
);

export const MaterialSupplierField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  suppliers?: Array<{ id: string; name: string; rating: number; verified: boolean }>;
}> = ({ value, onChange, error, required = true, suppliers = [] }) => (
  <SelectField
    label="Supplier"
    placeholder="Select supplier"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={suppliers.map(supplier => ({
      value: supplier.id,
      label: `${supplier.name} ${supplier.verified ? '✓' : ''} (${supplier.rating.toFixed(1)}★)`,
    }))}
  />
);

export const MaterialPriceField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <FormField
    label="Unit Price"
    placeholder="0.00"
    type="number"
    min="0"
    step="0.01"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    prefix={<span className="text-gray-500">$</span>}
    icon={<Icon name="dollar-sign" size="sm" />}
  />
);

export const MaterialUnitField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <SelectField
    label="Unit of Measurement"
    placeholder="Select unit"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'piece', label: 'Piece (pc)', group: 'Count' },
      { value: 'dozen', label: 'Dozen (dz)', group: 'Count' },
      { value: 'hundred', label: 'Hundred (100)', group: 'Count' },
      { value: 'pound', label: 'Pound (lb)', group: 'Weight' },
      { value: 'ton', label: 'Ton (t)', group: 'Weight' },
      { value: 'kilogram', label: 'Kilogram (kg)', group: 'Weight' },
      { value: 'foot', label: 'Linear Foot (ft)', group: 'Length' },
      { value: 'meter', label: 'Meter (m)', group: 'Length' },
      { value: 'yard', label: 'Yard (yd)', group: 'Length' },
      { value: 'square-foot', label: 'Square Foot (sq ft)', group: 'Area' },
      { value: 'square-meter', label: 'Square Meter (sq m)', group: 'Area' },
      { value: 'cubic-foot', label: 'Cubic Foot (cu ft)', group: 'Volume' },
      { value: 'cubic-meter', label: 'Cubic Meter (cu m)', group: 'Volume' },
      { value: 'cubic-yard', label: 'Cubic Yard (cu yd)', group: 'Volume' },
      { value: 'gallon', label: 'Gallon (gal)', group: 'Liquid' },
      { value: 'liter', label: 'Liter (L)', group: 'Liquid' },
    ]}
  />
);

export const MaterialQuantityField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  unit?: string;
}> = ({ value, onChange, error, required = true, unit }) => (
  <FormField
    label="Available Quantity"
    placeholder="0"
    type="number"
    min="0"
    step="1"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    suffix={unit ? <span className="text-gray-500 text-sm">{unit}</span> : undefined}
    icon={<Icon name="package" size="sm" />}
  />
);

export const MaterialAvailabilityField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <SelectField
    label="Availability Status"
    placeholder="Select availability"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'in-stock', label: '✅ In Stock - Available now' },
      { value: 'low-stock', label: '⚠️ Low Stock - Limited quantity' },
      { value: 'out-of-stock', label: '❌ Out of Stock - Not available' },
      { value: 'pre-order', label: '📅 Pre-order - Available for future delivery' },
    ]}
  />
);

export const MaterialLeadTimeField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => (
  <FormField
    label="Lead Time"
    placeholder="0"
    type="number"
    min="0"
    step="1"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    suffix={<span className="text-gray-500 text-sm">days</span>}
    icon={<Icon name="clock" size="sm" />}
  />
);

export const MaterialMinOrderField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  unit?: string;
}> = ({ value, onChange, error, required = false, unit }) => (
  <FormField
    label="Minimum Order Quantity"
    placeholder="1"
    type="number"
    min="1"
    step="1"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    suffix={unit ? <span className="text-gray-500 text-sm">{unit}</span> : undefined}
    icon={<Icon name="shopping-cart" size="sm" />}
  />
);

export const MaterialSpecificationsField: React.FC<{
  value?: Record<string, string>;
  onChange?: (value: Record<string, string>) => void;
  error?: string;
  required?: boolean;
}> = ({ value = {}, onChange, error, required = false }) => {
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');

  const addSpecification = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange?.({
        ...value,
        [newKey.trim()]: newValue.trim(),
      });
      setNewKey('');
      setNewValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...value };
    delete newSpecs[key];
    onChange?.(newSpecs);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecification();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
        Technical Specifications
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Add New Specification */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <FormField
          placeholder="Property (e.g., Grade)"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex gap-2">
          <FormField
            placeholder="Value (e.g., C40/50)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={addSpecification}
            disabled={!newKey.trim() || !newValue.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="plus" size="sm" />
          </button>
        </div>
      </div>

      {/* Existing Specifications */}
      {Object.entries(value).length > 0 && (
        <div className="space-y-2">
          {Object.entries(value).map(([key, val]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2"
            >
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">{key}:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{val}</span>
              </div>
              <button
                type="button"
                onClick={() => removeSpecification(key)}
                className="text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Icon name="x" size="xs" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2">
          <Icon name="alert-circle" size="xs" className="text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
};

export const MaterialCertificationsField: React.FC<{
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  required?: boolean;
}> = ({ value = [], onChange, error, required = false }) => {
  const [inputValue, setInputValue] = React.useState('');

  const commonCertifications = [
    'ISO 9001', 'ASTM C94', 'EN 206', 'ACI 318', 'AISC', 'AWS D1.1',
    'UL Listed', 'CSA Approved', 'ENERGY STAR', 'GREENGUARD',
    'FSC Certified', 'SFI Certified', 'LEED Compliant'
  ];

  const addCertification = (cert: string) => {
    const trimmedCert = cert.trim();
    if (trimmedCert && !value.includes(trimmedCert)) {
      onChange?.([...value, trimmedCert]);
    }
    setInputValue('');
  };

  const removeCertification = (certToRemove: string) => {
    onChange?.(value.filter(cert => cert !== certToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCertification(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeCertification(value[value.length - 1]);
    }
  };

  return (
    <div>
      <FormField
        label="Certifications"
        description="Add relevant certifications and standards. Press Enter or comma to add."
        placeholder="Type certification and press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        error={error}
        required={required}
        icon={<Icon name="shield-check" size="sm" />}
      />
      
      {/* Common Certifications */}
      {commonCertifications.length > 0 && inputValue && (
        <div className="mt-2 flex flex-wrap gap-1">
          {commonCertifications
            .filter(cert => 
              cert.toLowerCase().includes(inputValue.toLowerCase()) &&
              !value.includes(cert)
            )
            .slice(0, 5)
            .map(cert => (
              <button
                key={cert}
                type="button"
                onClick={() => addCertification(cert)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {cert}
              </button>
            ))
          }
        </div>
      )}
      
      {/* Selected Certifications */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map(cert => (
            <div
              key={cert}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded dark:bg-green-900/20 dark:text-green-400"
            >
              <Icon name="shield-check" size="xs" />
              <span>{cert}</span>
              <button
                type="button"
                onClick={() => removeCertification(cert)}
                className="text-green-600 hover:text-green-700 dark:text-green-400"
              >
                <Icon name="x" size="xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};