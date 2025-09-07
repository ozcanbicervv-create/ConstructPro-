'use client';

import React from 'react';

import { cn } from '@/lib/utils';

import { Avatar } from '../../atoms/Avatar';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';
import { Typography } from '../../atoms/Typography';

import Card from './Card';
import CardContent from './CardContent';
import CardDescription from './CardDescription';
import CardFooter from './CardFooter';
import CardHeader from './CardHeader';
import CardTitle from './CardTitle';

export interface DocumentData {
  id: string;
  name: string;
  description?: string;
  type: 'blueprint' | 'contract' | 'permit' | 'inspection' | 'report' | 'photo' | 'video' | 'other';
  fileType: 'pdf' | 'dwg' | 'jpg' | 'png' | 'mp4' | 'doc' | 'xls' | 'other';
  size: number; // in bytes
  uploadedBy: {
    name: string;
    avatar?: string;
  };
  uploadedAt: string;
  lastModified: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'archived';
  project: string;
  tags: string[];
  isShared: boolean;
  downloadCount: number;
}

export interface DocumentCardProps {
  document: DocumentData;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  onSelect?: (document: DocumentData) => void;
  onDownload?: (document: DocumentData) => void;
  onShare?: (document: DocumentData) => void;
  onEdit?: (document: DocumentData) => void;
  onDelete?: (document: DocumentData) => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  variant = 'default',
  onSelect,
  onDownload,
  onShare,
  onEdit,
  onDelete,
  className,
  showActions = true,
  compact = false,
}) => {
  const getFileTypeIcon = (fileType: DocumentData['fileType']) => {
    switch (fileType) {
      case 'pdf':
        return 'file-text';
      case 'dwg':
        return 'drafting-compass';
      case 'jpg':
      case 'png':
        return 'image';
      case 'mp4':
        return 'video';
      case 'doc':
        return 'file-text';
      case 'xls':
        return 'table';
      default:
        return 'file';
    }
  };

  const getDocumentTypeIcon = (type: DocumentData['type']) => {
    switch (type) {
      case 'blueprint':
        return 'drafting-compass';
      case 'contract':
        return 'file-signature';
      case 'permit':
        return 'shield-check';
      case 'inspection':
        return 'search';
      case 'report':
        return 'bar-chart';
      case 'photo':
        return 'camera';
      case 'video':
        return 'video';
      default:
        return 'file';
    }
  };

  const getStatusColor = (status: DocumentData['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (compact) {
    return (
      <Card
        variant={variant}
        padding="sm"
        hover
        interactive={!!onSelect}
        onClick={() => onSelect?.(document)}
        className={cn('w-full', className)}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Icon name={getFileTypeIcon(document.fileType)} size="sm" className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <Typography variant="body-sm" className="font-medium truncate">
              {document.name}
            </Typography>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={cn('text-xs', getStatusColor(document.status))}
              >
                {document.status}
              </Badge>
              <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
                {formatFileSize(document.size)}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {document.isShared && (
              <Icon name="share" size="xs" className="text-blue-600 dark:text-blue-400" />
            )}
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(document);
                }}
                aria-label="Download document"
              >
                <Icon name="download" size="xs" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant={variant}
      hover
      interactive={!!onSelect}
      onClick={() => onSelect?.(document)}
      className={cn('w-full max-w-sm', className)}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Icon name={getFileTypeIcon(document.fileType)} size="md" className="text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle size="sm" className="truncate">
              {document.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={cn('text-xs', getStatusColor(document.status))}
              >
                {document.status}
              </Badge>
              <Icon name={getDocumentTypeIcon(document.type)} size="xs" className="text-gray-500" />
              <Typography variant="caption" className="text-gray-600 dark:text-gray-400 capitalize">
                {document.type}
              </Typography>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(document);
                  }}
                  aria-label="Edit document"
                >
                  <Icon name="edit" size="xs" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document);
                  }}
                  aria-label="Delete document"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Icon name="trash" size="xs" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent padding="md">
        {document.description && (
          <CardDescription className="mb-4 line-clamp-2">
            {document.description}
          </CardDescription>
        )}

        {/* Document Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              File Size
            </Typography>
            <Typography variant="caption" className="font-medium">
              {formatFileSize(document.size)}
            </Typography>
          </div>
          
          <div className="flex items-center justify-between">
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Version
            </Typography>
            <Typography variant="caption" className="font-medium">
              {document.version}
            </Typography>
          </div>
          
          <div className="flex items-center justify-between">
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Downloads
            </Typography>
            <Typography variant="caption" className="font-medium">
              {document.downloadCount}
            </Typography>
          </div>
        </div>

        {/* Project and Dates */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Icon name="folder" size="xs" className="text-gray-500" />
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400 truncate">
              {document.project}
            </Typography>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="calendar" size="xs" className="text-gray-500" />
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Modified {formatDate(document.lastModified)}
            </Typography>
          </div>
          
          {document.isShared && (
            <div className="flex items-center gap-2">
              <Icon name="share" size="xs" className="text-blue-600 dark:text-blue-400" />
              <Typography variant="caption" className="text-blue-600 dark:text-blue-400">
                Shared document
              </Typography>
            </div>
          )}
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  +{document.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter divider justify="between">
        <div className="flex items-center gap-2">
          <Avatar
            src={document.uploadedBy.avatar}
            alt={document.uploadedBy.name}
            size="sm"
            fallback={document.uploadedBy.name.split(' ').map(n => n[0]).join('')}
          />
          <div>
            <Typography variant="caption" className="text-gray-600 dark:text-gray-400">
              Uploaded by
            </Typography>
            <Typography variant="body-sm" className="font-medium text-gray-900 dark:text-white">
              {document.uploadedBy.name}
            </Typography>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(document);
                }}
              >
                <Icon name="share" size="xs" />
              </Button>
            )}
            {onDownload && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(document);
                }}
              >
                <Icon name="download" size="xs" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;