'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { 
  FolderOpen, 
  Search, 
  Users, 
  FileText, 
  Package, 
  Calendar,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InteractiveButton } from './micro-interactions';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'search' | 'error' | 'offline';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = 'default'
}: EmptyStateProps) {
  const variantStyles = {
    default: 'text-gray-400',
    search: 'text-blue-400',
    error: 'text-red-400',
    offline: 'text-orange-400',
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <motion.div
        variants={staggerItem}
        className={cn('mb-4', variantStyles[variant])}
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {icon}
        </motion.div>
      </motion.div>

      <motion.h3
        variants={staggerItem}
        className="text-lg font-semibold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        variants={staggerItem}
        className="text-gray-600 mb-6 max-w-sm"
      >
        {description}
      </motion.p>

      {action && (
        <motion.div variants={staggerItem}>
          <InteractiveButton
            onClick={action.onClick}
            variant="primary"
          >
            {action.label}
          </InteractiveButton>
        </motion.div>
      )}
    </motion.div>
  );
}

// Predefined empty states for common scenarios
export function NoProjectsEmpty({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="w-16 h-16" />}
      title="No projects yet"
      description="Get started by creating your first construction project. You can add team members, tasks, and materials once it's created."
      action={{
        label: "Create Project",
        onClick: onCreateProject
      }}
    />
  );
}

export function NoSearchResultsEmpty({ query, onClearSearch }: { 
  query: string; 
  onClearSearch: () => void; 
}) {
  return (
    <EmptyState
      icon={<Search className="w-16 h-16" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search terms or browse all items.`}
      action={{
        label: "Clear Search",
        onClick: onClearSearch
      }}
      variant="search"
    />
  );
}

export function NoTeamMembersEmpty({ onInviteMembers }: { onInviteMembers: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-16 h-16" />}
      title="No team members"
      description="Invite team members to collaborate on this project. You can assign roles and permissions to control access."
      action={{
        label: "Invite Members",
        onClick: onInviteMembers
      }}
    />
  );
}

export function NoDocumentsEmpty({ onUploadDocument }: { onUploadDocument: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-16 h-16" />}
      title="No documents uploaded"
      description="Upload blueprints, contracts, and other project documents to keep everything organized in one place."
      action={{
        label: "Upload Document",
        onClick: onUploadDocument
      }}
    />
  );
}

export function NoMaterialsEmpty({ onAddMaterial }: { onAddMaterial: () => void }) {
  return (
    <EmptyState
      icon={<Package className="w-16 h-16" />}
      title="No materials added"
      description="Add materials to track inventory, costs, and supplier information for your construction project."
      action={{
        label: "Add Material",
        onClick: onAddMaterial
      }}
    />
  );
}

export function NoTasksEmpty({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-16 h-16" />}
      title="No tasks scheduled"
      description="Create tasks to organize work, set deadlines, and track progress on your construction project."
      action={{
        label: "Create Task",
        onClick: onCreateTask
      }}
    />
  );
}

export function ErrorEmpty({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-16 h-16" />}
      title="Something went wrong"
      description="We encountered an error while loading this content. Please try again or contact support if the problem persists."
      action={{
        label: "Try Again",
        onClick: onRetry
      }}
      variant="error"
    />
  );
}

export function OfflineEmpty({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<WifiOff className="w-16 h-16" />}
      title="You're offline"
      description="Check your internet connection and try again. Some features may be limited while offline."
      action={{
        label: "Retry",
        onClick: onRetry
      }}
      variant="offline"
    />
  );
}

// Loading empty state with skeleton animation
export function LoadingEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-gray-600"
      >
        Loading...
      </motion.div>
    </motion.div>
  );
}

// Success confirmation with celebration animation
interface SuccessStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function SuccessState({ title, description, action }: SuccessStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.2,
          type: 'spring',
          stiffness: 500,
          damping: 15
        }}
        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-lg font-semibold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-gray-600 mb-6 max-w-sm"
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <InteractiveButton
            onClick={action.onClick}
            variant="primary"
          >
            {action.label}
          </InteractiveButton>
        </motion.div>
      )}
    </motion.div>
  );
}