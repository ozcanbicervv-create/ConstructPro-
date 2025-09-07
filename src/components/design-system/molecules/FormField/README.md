# FormField System

A comprehensive form field system with validation, construction-specific patterns, and full accessibility support.

## Features

- **Comprehensive Validation**: Real-time validation with smooth error state transitions
- **Construction-Specific**: Specialized form patterns for projects, tasks, and materials
- **Accessible**: Full WCAG 2.1 AA compliance with proper labeling and error announcements
- **Multiple Variants**: Glass, filled, and default styling options
- **Rich Components**: Input, textarea, select, and specialized field combinations
- **Animation**: Smooth transitions for error/success states

## Core Components

### FormField
The base input field component with comprehensive validation and styling options.

```tsx
import { FormField } from '@/components/design-system/molecules/FormField';

<FormField
  label="Project Name"
  placeholder="Enter project name"
  required
  error="This field is required"
  icon={<Icon name="building" />}
  variant="glass"
/>
```

### TextareaField
Multi-line text input with character counting and resize options.

```tsx
import { TextareaField } from '@/components/design-system/molecules/FormField';

<TextareaField
  label="Description"
  description="Provide detailed project description"
  placeholder="Enter description..."
  minRows={4}
  maxRows={8}
  showCharCount
  maxLength={500}
  resize="vertical"
/>
```

### SelectField
Dropdown selection with grouping and loading states.

```tsx
import { SelectField } from '@/components/design-system/molecules/FormField';

<SelectField
  label="Project Type"
  placeholder="Select type"
  options={[
    { value: 'residential', label: 'Residential', group: 'Building Types' },
    { value: 'commercial', label: 'Commercial', group: 'Building Types' },
    { value: 'infrastructure', label: 'Infrastructure', group: 'Civil Works' },
  ]}
  required
/>
```

## Construction-Specific Components

### Project Form Fields
Pre-configured form fields optimized for construction project management.

```tsx
import {
  ProjectNameField,
  ProjectDescriptionField,
  ProjectTypeField,
  ProjectLocationField,
  ProjectBudgetField,
  ProjectStartDateField,
  ProjectEndDateField,
  ProjectPriorityField,
  ProjectManagerField,
  ProjectStatusField,
} from '@/components/design-system/molecules/FormField';

// Project Creation Form
function ProjectForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    priority: '',
    managerId: '',
    status: 'planning',
  });

  return (
    <form className="space-y-6">
      <ProjectNameField
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />
      
      <ProjectDescriptionField
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectTypeField
          value={formData.type}
          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
          required
        />
        
        <ProjectPriorityField
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
        />
      </div>
      
      <ProjectLocationField
        value={formData.location}
        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
        required
      />
      
      <ProjectBudgetField
        value={formData.budget}
        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
        required
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectStartDateField
          value={formData.startDate}
          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          required
        />
        
        <ProjectEndDateField
          value={formData.endDate}
          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          required
        />
      </div>
    </form>
  );
}
```

### Task Form Fields
Specialized components for construction task management.

```tsx
import {
  TaskTitleField,
  TaskDescriptionField,
  TaskCategoryField,
  TaskPriorityField,
  TaskStatusField,
  TaskAssigneeField,
  TaskDueDateField,
  TaskEstimatedHoursField,
  TaskDependenciesField,
  TaskTagsField,
} from '@/components/design-system/molecules/FormField';

// Task Creation Form
function TaskForm() {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'todo',
    assigneeId: '',
    dueDate: '',
    estimatedHours: '',
    dependencies: [],
    tags: [],
  });

  return (
    <form className="space-y-6">
      <TaskTitleField
        value={taskData.title}
        onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
        required
      />
      
      <TaskDescriptionField
        value={taskData.description}
        onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaskCategoryField
          value={taskData.category}
          onChange={(e) => setTaskData(prev => ({ ...prev, category: e.target.value }))}
          required
        />
        
        <TaskPriorityField
          value={taskData.priority}
          onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value }))}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaskAssigneeField
          value={taskData.assigneeId}
          onChange={(e) => setTaskData(prev => ({ ...prev, assigneeId: e.target.value }))}
          workers={availableWorkers}
          required
        />
        
        <TaskDueDateField
          value={taskData.dueDate}
          onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
          minDate={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      
      <TaskDependenciesField
        value={taskData.dependencies}
        onChange={(deps) => setTaskData(prev => ({ ...prev, dependencies: deps }))}
        availableTasks={availableTasks}
      />
      
      <TaskTagsField
        value={taskData.tags}
        onChange={(tags) => setTaskData(prev => ({ ...prev, tags }))}
        suggestions={['foundation', 'electrical', 'plumbing', 'inspection', 'safety']}
      />
    </form>
  );
}
```

### Material Form Fields
Components for material and supplier management.

```tsx
import {
  MaterialNameField,
  MaterialDescriptionField,
  MaterialCategoryField,
  MaterialSupplierField,
  MaterialPriceField,
  MaterialUnitField,
  MaterialQuantityField,
  MaterialAvailabilityField,
  MaterialLeadTimeField,
  MaterialMinOrderField,
  MaterialSpecificationsField,
  MaterialCertificationsField,
} from '@/components/design-system/molecules/FormField';

// Material Entry Form
function MaterialForm() {
  const [materialData, setMaterialData] = useState({
    name: '',
    description: '',
    category: '',
    supplierId: '',
    price: '',
    unit: '',
    quantity: '',
    availability: 'in-stock',
    leadTime: '',
    minOrder: '',
    specifications: {},
    certifications: [],
  });

  return (
    <form className="space-y-6">
      <MaterialNameField
        value={materialData.name}
        onChange={(e) => setMaterialData(prev => ({ ...prev, name: e.target.value }))}
        required
      />
      
      <MaterialDescriptionField
        value={materialData.description}
        onChange={(e) => setMaterialData(prev => ({ ...prev, description: e.target.value }))}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MaterialCategoryField
          value={materialData.category}
          onChange={(e) => setMaterialData(prev => ({ ...prev, category: e.target.value }))}
          required
        />
        
        <MaterialSupplierField
          value={materialData.supplierId}
          onChange={(e) => setMaterialData(prev => ({ ...prev, supplierId: e.target.value }))}
          suppliers={availableSuppliers}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MaterialPriceField
          value={materialData.price}
          onChange={(e) => setMaterialData(prev => ({ ...prev, price: e.target.value }))}
          required
        />
        
        <MaterialUnitField
          value={materialData.unit}
          onChange={(e) => setMaterialData(prev => ({ ...prev, unit: e.target.value }))}
          required
        />
        
        <MaterialQuantityField
          value={materialData.quantity}
          onChange={(e) => setMaterialData(prev => ({ ...prev, quantity: e.target.value }))}
          unit={materialData.unit}
          required
        />
      </div>
      
      <MaterialSpecificationsField
        value={materialData.specifications}
        onChange={(specs) => setMaterialData(prev => ({ ...prev, specifications: specs }))}
      />
      
      <MaterialCertificationsField
        value={materialData.certifications}
        onChange={(certs) => setMaterialData(prev => ({ ...prev, certifications: certs }))}
      />
    </form>
  );
}
```

## Variants

### Default
Standard styling with clean borders and backgrounds.

```tsx
<FormField variant="default" label="Standard Field" />
```

### Glass
Modern glassmorphism effect with backdrop blur.

```tsx
<FormField variant="glass" label="Glass Field" />
```

### Filled
Filled background style for subtle emphasis.

```tsx
<FormField variant="filled" label="Filled Field" />
```

## Validation Patterns

### Real-time Validation
Implement real-time validation with smooth error transitions.

```tsx
function ValidatedForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <FormField
      label="Email Address"
      type="email"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        validateEmail(e.target.value);
      }}
      error={emailError}
      success={email && !emailError ? 'Email is valid' : undefined}
      required
    />
  );
}
```

### Form Integration with React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Project type is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

function ProjectForm() {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(projectSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <ProjectNameField
            {...field}
            error={errors.name?.message}
            required
          />
        )}
      />
      
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <ProjectTypeField
            {...field}
            error={errors.type?.message}
            required
          />
        )}
      />
      
      <Controller
        name="budget"
        control={control}
        render={({ field }) => (
          <ProjectBudgetField
            {...field}
            error={errors.budget?.message}
            required
          />
        )}
      />
    </form>
  );
}
```

## Accessibility Features

- **Semantic HTML**: Proper form elements and labeling
- **ARIA Attributes**: Comprehensive ARIA support for screen readers
- **Keyboard Navigation**: Full keyboard accessibility
- **Error Announcements**: Screen reader announcements for validation errors
- **Focus Management**: Proper focus indicators and tab order

### ARIA Implementation

```tsx
<FormField
  label="Project Name"
  description="Enter a descriptive name for your construction project"
  error="Project name must be at least 3 characters long"
  required
  // Automatically generates:
  // aria-describedby="field-description field-error"
  // aria-invalid="true"
  // aria-required="true"
/>
```

## Animation Features

- **Smooth Transitions**: Error and success message animations
- **Loading States**: Animated loading spinners
- **Focus Effects**: Subtle focus animations
- **State Changes**: Smooth transitions between validation states

## Best Practices

### Construction Industry Usage

1. **Consistent Terminology**: Use industry-standard terms and categories
2. **Logical Grouping**: Group related fields together
3. **Progressive Disclosure**: Show advanced options only when needed
4. **Validation Timing**: Validate on blur for better UX
5. **Clear Instructions**: Provide helpful descriptions and examples

### Performance

1. **Debounced Validation**: Avoid excessive validation calls
2. **Memoization**: Prevent unnecessary re-renders
3. **Lazy Loading**: Load options dynamically when needed
4. **Efficient Updates**: Use controlled components appropriately

### UX Guidelines

1. **Clear Labels**: Use descriptive, action-oriented labels
2. **Helpful Errors**: Provide specific, actionable error messages
3. **Visual Hierarchy**: Use consistent spacing and typography
4. **Mobile Optimization**: Ensure touch-friendly interactions

## Styling

The form field system uses Tailwind CSS classes and can be customized:

```tsx
// Custom styling
<FormField
  label="Custom Field"
  className="my-custom-field"
  labelClassName="text-blue-600"
  inputClassName="border-blue-300"
  errorClassName="text-red-500"
/>

// CSS custom properties
.my-custom-field {
  --field-border: #3b82f6;
  --field-focus: #1d4ed8;
  --field-error: #dc2626;
}
```

## Integration Examples

### Multi-step Forms

```tsx
function MultiStepProjectForm() {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({});

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2>Basic Information</h2>
            <ProjectNameField {...projectNameProps} />
            <ProjectDescriptionField {...projectDescProps} />
            <ProjectTypeField {...projectTypeProps} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2>Timeline & Budget</h2>
            <ProjectBudgetField {...budgetProps} />
            <ProjectStartDateField {...startDateProps} />
            <ProjectEndDateField {...endDateProps} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2>Team & Settings</h2>
            <ProjectManagerField {...managerProps} />
            <ProjectPriorityField {...priorityProps} />
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {renderStep()}
      <div className="flex justify-between mt-8">
        <Button onClick={() => setStep(step - 1)} disabled={step === 1}>
          Previous
        </Button>
        <Button onClick={() => setStep(step + 1)} disabled={step === 3}>
          Next
        </Button>
      </div>
    </div>
  );
}
```

### Dynamic Forms

```tsx
function DynamicTaskForm() {
  const [taskType, setTaskType] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form className="space-y-6">
      <TaskCategoryField
        value={taskType}
        onChange={(e) => setTaskType(e.target.value)}
        required
      />
      
      {taskType === 'inspection' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <SelectField
            label="Inspection Type"
            options={inspectionTypes}
            required
          />
          <TextareaField
            label="Inspection Checklist"
            placeholder="Enter inspection items..."
          />
        </motion.div>
      )}
      
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </Button>
      
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <TaskEstimatedHoursField />
            <TaskDependenciesField />
            <TaskTagsField />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
```