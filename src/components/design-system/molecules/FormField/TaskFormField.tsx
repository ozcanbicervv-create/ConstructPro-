'use client';

import React from 'react';
import FormField from './FormField';
import SelectField from './SelectField';
import TextareaField from './TextareaField';
import { Icon } from '../../atoms/Icon';

// Task-specific form field components
export const TaskTitleField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <FormField
    label="Task Title"
    placeholder="Enter task title (e.g., Foundation Inspection)"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    icon={<Icon name="check-square" size="sm" />}
    maxLength={100}
  />
);

export const TaskDescriptionField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => (
  <TextareaField
    label="Task Description"
    description="Provide detailed instructions and requirements for this task"
    placeholder="Describe what needs to be done, any special requirements, safety considerations..."
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

export const TaskCategoryField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <SelectField
    label="Task Category"
    placeholder="Select task category"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'site-prep', label: 'Site Preparation', group: 'Pre-Construction' },
      { value: 'excavation', label: 'Excavation', group: 'Pre-Construction' },
      { value: 'foundation', label: 'Foundation Work', group: 'Structural' },
      { value: 'framing', label: 'Framing', group: 'Structural' },
      { value: 'concrete', label: 'Concrete Work', group: 'Structural' },
      { value: 'steel', label: 'Steel Work', group: 'Structural' },
      { value: 'electrical', label: 'Electrical', group: 'MEP' },
      { value: 'plumbing', label: 'Plumbing', group: 'MEP' },
      { value: 'hvac', label: 'HVAC', group: 'MEP' },
      { value: 'roofing', label: 'Roofing', group: 'Exterior' },
      { value: 'siding', label: 'Siding', group: 'Exterior' },
      { value: 'windows', label: 'Windows & Doors', group: 'Exterior' },
      { value: 'drywall', label: 'Drywall', group: 'Interior' },
      { value: 'flooring', label: 'Flooring', group: 'Interior' },
      { value: 'painting', label: 'Painting', group: 'Finishing' },
      { value: 'fixtures', label: 'Fixtures', group: 'Finishing' },
      { value: 'inspection', label: 'Inspection', group: 'Quality Control' },
      { value: 'testing', label: 'Testing', group: 'Quality Control' },
      { value: 'cleanup', label: 'Cleanup', group: 'Final' },
    ]}
  />
);

export const TaskPriorityField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = true }) => (
  <SelectField
    label="Priority"
    placeholder="Select priority level"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'low', label: '🟢 Low - Can be delayed if needed' },
      { value: 'medium', label: '🟡 Medium - Standard priority' },
      { value: 'high', label: '🟠 High - Important for timeline' },
      { value: 'critical', label: '🔴 Critical - Blocks other tasks' },
    ]}
  />
);

export const TaskStatusField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => (
  <SelectField
    label="Status"
    placeholder="Select current status"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={[
      { value: 'todo', label: '📝 To Do - Not started' },
      { value: 'in-progress', label: '🚧 In Progress - Currently working' },
      { value: 'review', label: '👀 Under Review - Awaiting approval' },
      { value: 'completed', label: '✅ Completed - Finished' },
      { value: 'blocked', label: '🚫 Blocked - Cannot proceed' },
    ]}
  />
);

export const TaskAssigneeField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  workers?: Array<{ id: string; name: string; role: string; available: boolean }>;
}> = ({ value, onChange, error, required = true, workers = [] }) => (
  <SelectField
    label="Assigned To"
    placeholder="Select team member"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    options={workers.map(worker => ({
      value: worker.id,
      label: `${worker.name} - ${worker.role}${!worker.available ? ' (Busy)' : ''}`,
      disabled: !worker.available,
    }))}
  />
);

export const TaskDueDateField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  minDate?: string;
}> = ({ value, onChange, error, required = true, minDate }) => (
  <FormField
    label="Due Date"
    type="date"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    min={minDate}
    icon={<Icon name="calendar" size="sm" />}
  />
);

export const TaskEstimatedHoursField: React.FC<{
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}> = ({ value, onChange, error, required = false }) => (
  <FormField
    label="Estimated Hours"
    placeholder="0"
    type="number"
    min="0"
    step="0.5"
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    suffix={<span className="text-gray-500 text-sm">hrs</span>}
    icon={<Icon name="clock" size="sm" />}
  />
);

export const TaskDependenciesField: React.FC<{
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  required?: boolean;
  availableTasks?: Array<{ id: string; title: string; status: string }>;
}> = ({ value = [], onChange, error, required = false, availableTasks = [] }) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue && !value.includes(selectedValue)) {
      onChange?.([...value, selectedValue]);
    }
  };

  const removeDependency = (taskId: string) => {
    onChange?.(value.filter(id => id !== taskId));
  };

  return (
    <div>
      <SelectField
        label="Task Dependencies"
        description="Select tasks that must be completed before this task can start"
        placeholder="Select dependent tasks"
        onChange={handleSelectChange}
        error={error}
        required={required}
        options={[
          { value: '', label: 'Select a task to add dependency' },
          ...availableTasks
            .filter(task => !value.includes(task.id))
            .map(task => ({
              value: task.id,
              label: `${task.title} (${task.status})`,
              disabled: task.status === 'completed',
            }))
        ]}
      />
      
      {/* Selected Dependencies */}
      {value.length > 0 && (
        <div className="mt-2 space-y-2">
          {value.map(taskId => {
            const task = availableTasks.find(t => t.id === taskId);
            return task ? (
              <div
                key={taskId}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-gray-900 dark:text-white">
                  {task.title} ({task.status})
                </span>
                <button
                  type="button"
                  onClick={() => removeDependency(taskId)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <Icon name="x" size="xs" />
                </button>
              </div>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
);

export const TaskTagsField: React.FC<{
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  required?: boolean;
  suggestions?: string[];
}> = ({ value = [], onChange, error, required = false, suggestions = [] }) => {
  const [inputValue, setInputValue] = React.useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange?.([...value, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange?.(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div>
      <FormField
        label="Tags"
        description="Add tags to categorize and filter tasks. Press Enter or comma to add."
        placeholder="Type tags and press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        error={error}
        required={required}
        icon={<Icon name="tag" size="sm" />}
      />
      
      {/* Suggestions */}
      {suggestions.length > 0 && inputValue && (
        <div className="mt-2 flex flex-wrap gap-1">
          {suggestions
            .filter(suggestion => 
              suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
              !value.includes(suggestion.toLowerCase())
            )
            .slice(0, 5)
            .map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {suggestion}
              </button>
            ))
          }
        </div>
      )}
      
      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map(tag => (
            <div
              key={tag}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded dark:bg-gray-800 dark:text-gray-200"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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