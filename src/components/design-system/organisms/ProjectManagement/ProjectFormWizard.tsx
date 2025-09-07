'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar as CalendarIcon,
  MapPin,
  DollarSign,
  Users,
  FileText,
  Settings,
  X,
  Plus,
  Search,
  Building,
  User
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';


import { Project } from './ProjectGrid';

// Form validation schemas for each step
const basicInfoSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  client: z.string().min(1, 'Client is required'),
  location: z.string().min(1, 'Location is required'),
});

const timelineSchema = z.object({
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  milestones: z.array(z.object({
    name: z.string().min(1, 'Milestone name is required'),
    date: z.date({ required_error: 'Milestone date is required' }),
    description: z.string().optional(),
  })).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

const budgetSchema = z.object({
  totalBudget: z.number().min(1000, 'Budget must be at least $1,000'),
  budgetBreakdown: z.array(z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.number().min(0, 'Amount must be positive'),
    percentage: z.number().min(0).max(100),
  })),
});

const teamSchema = z.object({
  managerId: z.string().min(1, 'Project manager is required'),
  teamMembers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    avatar: z.string().optional(),
  })),
});

const settingsSchema = z.object({
  tags: z.array(z.string()),
  isPublic: z.boolean().default(false),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    slack: z.boolean().default(false),
  }),
  customFields: z.array(z.object({
    name: z.string(),
    value: z.string(),
  })).optional(),
});

// Combined form schema
const projectFormSchema = basicInfoSchema
  .merge(timelineSchema)
  .merge(budgetSchema)
  .merge(teamSchema)
  .merge(settingsSchema);

type ProjectFormData = z.infer<typeof projectFormSchema>;

// Mock data for dropdowns
const mockCategories = [
  'Residential Construction',
  'Commercial Construction',
  'Infrastructure',
  'Renovation',
  'Industrial',
];

const mockUsers = [
  { id: '1', name: 'John Smith', role: 'Project Manager', avatar: '/avatars/john.jpg' },
  { id: '2', name: 'Sarah Johnson', role: 'Site Supervisor', avatar: '/avatars/sarah.jpg' },
  { id: '3', name: 'Mike Wilson', role: 'Engineer', avatar: '/avatars/mike.jpg' },
  { id: '4', name: 'Lisa Chen', role: 'Architect', avatar: '/avatars/lisa.jpg' },
  { id: '5', name: 'David Brown', role: 'Foreman', avatar: '/avatars/david.jpg' },
];

const budgetCategories = [
  'Labor',
  'Materials',
  'Equipment',
  'Permits',
  'Overhead',
  'Contingency',
];

// Step Components
interface StepProps {
  form: any;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

// Step 1: Basic Information
const BasicInfoStep: React.FC<StepProps> = ({ form, onNext, isFirst }) => {
  const { register, formState: { errors }, watch, setValue } = form;
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !customTags.includes(tagInput.trim())) {
      const newTags = [...customTags, tagInput.trim()];
      setCustomTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = customTags.filter(tag => tag !== tagToRemove);
    setCustomTags(newTags);
    setValue('tags', newTags);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Basic Information
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Let's start with the basic details of your project.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter project name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Client *</Label>
          <Input
            id="client"
            {...register('client')}
            placeholder="Enter client name"
            className={errors.client ? 'border-red-500' : ''}
          />
          {errors.client && (
            <p className="text-sm text-red-600">{errors.client.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe your project..."
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select onValueChange={(value) => setValue('category', value)}>
            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {mockCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select onValueChange={(value) => setValue('priority', value)}>
            <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            {...register('location')}
            placeholder="Project location"
            className={errors.location ? 'border-red-500' : ''}
          />
          {errors.location && (
            <p className="text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex items-center space-x-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {customTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

// Step 2: Timeline & Milestones
const TimelineStep: React.FC<StepProps> = ({ form, onNext, onPrev }) => {
  const { setValue, watch, formState: { errors } } = form;
  const [milestones, setMilestones] = useState<Array<{ name: string; date: Date | undefined; description: string }>>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const addMilestone = () => {
    setMilestones([...milestones, { name: '', date: undefined, description: '' }]);
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
    setValue('milestones', updated);
  };

  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated);
    setValue('milestones', updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Timeline & Milestones
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Set the project timeline and define key milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                  errors.startDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setValue('startDate', date);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && (
            <p className="text-sm text-red-600">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                  errors.endDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setValue('endDate', date);
                }}
                disabled={(date) => startDate ? date < startDate : false}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.endDate && (
            <p className="text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Milestones</Label>
          <Button type="button" onClick={addMilestone} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>

        {milestones.map((milestone, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Milestone Name</Label>
                  <Input
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                    placeholder="Enter milestone name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !milestone.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {milestone.date ? format(milestone.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={milestone.date}
                        onSelect={(date) => updateMilestone(index, 'date', date)}
                        disabled={(date) => {
                          if (startDate && date < startDate) {return true;}
                          if (endDate && date > endDate) {return true;}
                          return false;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMilestone(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={milestone.description}
                  onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                  placeholder="Describe this milestone..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

// Step 3: Budget Planning
const BudgetStep: React.FC<StepProps> = ({ form, onNext, onPrev }) => {
  const { setValue, watch, formState: { errors } } = form;
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [budgetBreakdown, setBudgetBreakdown] = useState<Array<{ category: string; amount: number; percentage: number }>>([]);

  const addBudgetCategory = () => {
    setBudgetBreakdown([...budgetBreakdown, { category: '', amount: 0, percentage: 0 }]);
  };

  const updateBudgetCategory = (index: number, field: string, value: any) => {
    const updated = [...budgetBreakdown];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'amount' && totalBudget > 0) {
      updated[index].percentage = (value / totalBudget) * 100;
    } else if (field === 'percentage' && totalBudget > 0) {
      updated[index].amount = (value / 100) * totalBudget;
    }
    
    setBudgetBreakdown(updated);
    setValue('budgetBreakdown', updated);
  };

  const removeBudgetCategory = (index: number) => {
    const updated = budgetBreakdown.filter((_, i) => i !== index);
    setBudgetBreakdown(updated);
    setValue('budgetBreakdown', updated);
  };

  const handleTotalBudgetChange = (value: number) => {
    setTotalBudget(value);
    setValue('totalBudget', value);
    
    // Recalculate percentages
    const updated = budgetBreakdown.map(item => ({
      ...item,
      percentage: value > 0 ? (item.amount / value) * 100 : 0
    }));
    setBudgetBreakdown(updated);
    setValue('budgetBreakdown', updated);
  };

  const totalAllocated = budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const remainingBudget = totalBudget - totalAllocated;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Budget Planning
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Set your project budget and allocate funds across categories.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totalBudget">Total Budget *</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="totalBudget"
            type="number"
            value={totalBudget || ''}
            onChange={(e) => handleTotalBudgetChange(Number(e.target.value))}
            placeholder="Enter total budget"
            className={cn("pl-10", errors.totalBudget && "border-red-500")}
          />
        </div>
        {errors.totalBudget && (
          <p className="text-sm text-red-600">{errors.totalBudget.message}</p>
        )}
      </div>

      {totalBudget > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Budget Breakdown</Label>
            <Button type="button" onClick={addBudgetCategory} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {budgetBreakdown.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={item.category}
                      onValueChange={(value) => updateBudgetCategory(index, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        value={item.amount || ''}
                        onChange={(e) => updateBudgetCategory(index, 'amount', Number(e.target.value))}
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Percentage</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={item.percentage.toFixed(1)}
                        onChange={(e) => updateBudgetCategory(index, 'percentage', Number(e.target.value))}
                        placeholder="0"
                        className="pr-8"
                        step="0.1"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeBudgetCategory(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {budgetBreakdown.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${totalBudget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Allocated</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ${totalAllocated.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      remainingBudget >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      ${remainingBudget.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {totalBudget > 0 && (
                  <div className="mt-4">
                    <Progress 
                      value={(totalAllocated / totalBudget) * 100} 
                      className="h-3"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                      {((totalAllocated / totalBudget) * 100).toFixed(1)}% allocated
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

// Step 4: Team Assignment
const TeamStep: React.FC<StepProps> = ({ form, onNext, onPrev }) => {
  const { setValue, watch, formState: { errors } } = form;
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<typeof mockUsers>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManagerSelect = (userId: string) => {
    setSelectedManager(userId);
    setValue('managerId', userId);
  };

  const handleTeamMemberToggle = (user: typeof mockUsers[0]) => {
    const isSelected = selectedTeamMembers.some(member => member.id === user.id);
    let updated;
    
    if (isSelected) {
      updated = selectedTeamMembers.filter(member => member.id !== user.id);
    } else {
      updated = [...selectedTeamMembers, user];
    }
    
    setSelectedTeamMembers(updated);
    setValue('teamMembers', updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Team Assignment
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Assign a project manager and select team members.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Project Manager *</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select the person who will manage this project.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mockUsers.filter(user => user.role.includes('Manager')).map((user) => (
              <Card
                key={user.id}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  selectedManager === user.id && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                )}
                onClick={() => handleManagerSelect(user.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.role}
                      </p>
                    </div>
                    {selectedManager === user.id && (
                      <Check className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {errors.managerId && (
            <p className="text-sm text-red-600 mt-2">{errors.managerId.message}</p>
          )}
        </div>

        <div>
          <Label>Team Members</Label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Select team members who will work on this project.
          </p>
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..."
                className="pl-10"
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-sm",
                    selectedTeamMembers.some(member => member.id === user.id) && 
                    "ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => handleTeamMemberToggle(user)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.role}
                        </p>
                      </div>
                      {selectedTeamMembers.some(member => member.id === user.id) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {selectedTeamMembers.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Selected team members ({selectedTeamMembers.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedTeamMembers.map((member) => (
                  <Badge key={member.id} variant="secondary" className="flex items-center space-x-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Next Step
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

// Step 5: Settings & Review
const SettingsStep: React.FC<StepProps & { onSubmit: () => void; isSubmitting: boolean }> = ({ 
  form, 
  onPrev, 
  onSubmit, 
  isSubmitting 
}) => {
  const { setValue, watch } = form;
  const formData = watch();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Settings & Review
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Configure project settings and review all information before creating.
        </p>
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Name</Label>
              <p className="text-gray-900 dark:text-white">{formData.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Client</Label>
              <p className="text-gray-900 dark:text-white">{formData.client}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</Label>
              <p className="text-gray-900 dark:text-white">{formData.category}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Priority</Label>
              <Badge variant="outline">{formData.priority}</Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</Label>
              <p className="text-gray-900 dark:text-white">
                {formData.startDate && formData.endDate && 
                  `${format(formData.startDate, "MMM dd, yyyy")} - ${format(formData.endDate, "MMM dd, yyyy")}`
                }
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</Label>
              <p className="text-gray-900 dark:text-white">
                ${formData.totalBudget?.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating Project...' : 'Create Project'}
        </Button>
      </div>
    </motion.div>
  );
};

// Main Project Form Wizard Component
export interface ProjectFormWizardProps {
  project?: Partial<Project>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export const ProjectFormWizard: React.FC<ProjectFormWizardProps> = ({
  project,
  onSubmit,
  onCancel,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      category: project?.category || '',
      priority: project?.priority || 'medium',
      client: project?.client || '',
      location: project?.location || '',
      tags: project?.tags || [],
      totalBudget: project?.budget || 0,
      budgetBreakdown: [],
      teamMembers: [],
      ...project
    }
  });

  const steps = [
    'Basic Information',
    'Timeline & Milestones',
    'Budget Planning',
    'Team Assignment',
    'Settings & Review'
  ];

  const handleNext = async () => {
    const stepSchemas = [basicInfoSchema, timelineSchema, budgetSchema, teamSchema, settingsSchema];
    const currentSchema = stepSchemas[currentStep];
    
    const isValid = await form.trigger(Object.keys(currentSchema.shape) as any);
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = form.getValues();
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {project ? 'Edit Project' : 'Create New Project'}
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
              </p>
            </div>
            <Button variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={cn(
                    "transition-colors",
                    index <= currentStep && "text-blue-600 dark:text-blue-400 font-medium"
                  )}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <BasicInfoStep
                key="basic"
                form={form}
                onNext={handleNext}
                onPrev={handlePrev}
                isFirst={true}
                isLast={false}
              />
            )}
            {currentStep === 1 && (
              <TimelineStep
                key="timeline"
                form={form}
                onNext={handleNext}
                onPrev={handlePrev}
                isFirst={false}
                isLast={false}
              />
            )}
            {currentStep === 2 && (
              <BudgetStep
                key="budget"
                form={form}
                onNext={handleNext}
                onPrev={handlePrev}
                isFirst={false}
                isLast={false}
              />
            )}
            {currentStep === 3 && (
              <TeamStep
                key="team"
                form={form}
                onNext={handleNext}
                onPrev={handlePrev}
                isFirst={false}
                isLast={false}
              />
            )}
            {currentStep === 4 && (
              <SettingsStep
                key="settings"
                form={form}
                onNext={handleNext}
                onPrev={handlePrev}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isFirst={false}
                isLast={true}
              />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectFormWizard;