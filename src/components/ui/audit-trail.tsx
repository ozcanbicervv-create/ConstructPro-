/**
 * Audit Trail Component
 * Displays security events and access logs
 */

"use client";

import { 
  Shield, 
  User, 
  Lock, 
  Unlock, 
  Eye, 
  Download, 
  Upload, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Filter,
  Search
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/lib/i18n';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'success' | 'failure' | 'warning';
  ipAddress: string;
  userAgent: string;
  location?: string;
  details?: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface AuditTrailProps {
  events: AuditEvent[];
  showFilters?: boolean;
  maxHeight?: string;
  onEventClick?: (event: AuditEvent) => void;
  className?: string;
}

const actionIcons: Record<string, React.ComponentType<any>> = {
  login: User,
  logout: User,
  view: Eye,
  create: Edit,
  update: Edit,
  delete: Trash2,
  download: Download,
  upload: Upload,
  lock: Lock,
  unlock: Unlock,
  access_granted: CheckCircle,
  access_denied: XCircle,
  security_alert: AlertTriangle,
};

const resultColors = {
  success: 'text-green-600 bg-green-50 border-green-200',
  failure: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
};

const riskColors = {
  low: 'text-blue-600 bg-blue-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50',
};

export function AuditTrail({
  events,
  showFilters = true,
  maxHeight = "400px",
  onEventClick,
  className,
}: AuditTrailProps) {
  const { formatDate, formatTime } = useI18n();
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [filters, setFilters] = useState({
    action: '',
    result: '',
    riskLevel: '',
    user: '',
  });

  React.useEffect(() => {
    let filtered = events;

    if (filters.action) {
      filtered = filtered.filter(event => 
        event.action.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    if (filters.result) {
      filtered = filtered.filter(event => event.result === filters.result);
    }

    if (filters.riskLevel) {
      filtered = filtered.filter(event => event.riskLevel === filters.riskLevel);
    }

    if (filters.user) {
      filtered = filtered.filter(event => 
        event.userName.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const formatUserAgent = (userAgent: string) => {
    // Simplified user agent parsing
    if (userAgent.includes('Chrome')) {return 'Chrome';}
    if (userAgent.includes('Firefox')) {return 'Firefox';}
    if (userAgent.includes('Safari')) {return 'Safari';}
    if (userAgent.includes('Edge')) {return 'Edge';}
    return 'Unknown Browser';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-4 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by action..."
                  className="pl-8 pr-3 py-2 text-sm border rounded-md w-full"
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                />
              </div>
              
              <select
                className="px-3 py-2 text-sm border rounded-md"
                value={filters.result}
                onChange={(e) => setFilters(prev => ({ ...prev, result: e.target.value }))}
              >
                <option value="">All Results</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
              
              <select
                className="px-3 py-2 text-sm border rounded-md"
                value={filters.riskLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
              >
                <option value="">All Risk Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter by user..."
                  className="pl-8 pr-3 py-2 text-sm border rounded-md w-full"
                  value={filters.user}
                  onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-3">
            {filteredEvents.map((event, index) => {
              const ActionIcon = actionIcons[event.action] || Shield;
              const DeviceIcon = getDeviceIcon(event.userAgent);
              
              return (
                <div key={event.id}>
                  <div
                    className={`p-3 rounded-lg border transition-colors ${
                      onEventClick ? 'cursor-pointer hover:bg-muted/50' : ''
                    }`}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">
                          <ActionIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {event.userName}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {event.action.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {event.resource}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              {formatDate(event.timestamp)} {formatTime(event.timestamp)}
                            </span>
                            
                            <Separator orientation="vertical" className="h-3" />
                            
                            <DeviceIcon className="h-3 w-3" />
                            <span>{formatUserAgent(event.userAgent)}</span>
                            
                            {event.location && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <MapPin className="h-3 w-3" />
                                <span>{event.location}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            IP: {event.ipAddress}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs ${riskColors[event.riskLevel]}`}
                        >
                          {event.riskLevel.toUpperCase()}
                        </Badge>
                        
                        <Badge
                          variant="outline"
                          className={`text-xs ${resultColors[event.result]}`}
                        >
                          {event.result.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    {event.details && Object.keys(event.details).length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View Details
                          </summary>
                          <div className="mt-1 space-y-1">
                            {Object.entries(event.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span className="text-muted-foreground">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                  
                  {index < filteredEvents.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              );
            })}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No audit events found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Hook for audit events
export function useAuditEvents() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const logEvent = React.useCallback((event: Omit<AuditEvent, 'id' | 'timestamp'>) => {
    const newEvent: AuditEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    
    setEvents(prev => [newEvent, ...prev]);
  }, []);

  const fetchEvents = React.useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      // This would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockEvents: AuditEvent[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          userId: 'user1',
          userName: 'John Doe',
          action: 'login',
          resource: 'system',
          result: 'success',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          location: 'New York, US',
          riskLevel: 'low',
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          userId: 'user2',
          userName: 'Jane Smith',
          action: 'access_denied',
          resource: 'admin_panel',
          result: 'failure',
          ipAddress: '10.0.0.50',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
          location: 'London, UK',
          riskLevel: 'high',
          details: {
            reason: 'Insufficient permissions',
            attempted_resource: '/admin/users',
          },
        },
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch audit events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    logEvent,
    fetchEvents,
  };
}