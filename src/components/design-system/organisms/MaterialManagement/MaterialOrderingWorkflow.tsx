'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ShoppingCart,
  Plus,
  Minus,
  X,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  Send,
  Eye,
  Edit,
  Trash2,
  Package,
  Truck,
  DollarSign,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';
import { Material } from './MaterialComparisonTable';

// Types for ordering workflow
export interface OrderItem {
  materialId: string;
  material: Material;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deliveryDate?: string;
}

export interface MaterialOrder {
  id: string;
  orderNumber: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'ordered' | 'in-transit' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  supplier: {
    id: string;
    name: string;
    contact: {
      name: string;
      email: string;
      phone: string;
    };
  };
  project: {
    id: string;
    name: string;
  };
  requestedBy: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  approvals: Array<{
    id: string;
    approver: {
      id: string;
      name: string;
      role: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    date?: string;
    comments?: string;
  }>;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    instructions?: string;
  };
  createdAt: string;
  updatedAt: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  trackingNumber?: string;
}

// Shopping Cart Component
export interface ShoppingCartProps {
  items: OrderItem[];
  onUpdateQuantity: (materialId: string, quantity: number) => void;
  onRemoveItem: (materialId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  className?: string;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  className
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over $1000
  const total = subtotal + tax + shipping;

  const getUrgencyColor = (urgency: OrderItem['urgency']) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (items.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-8 text-center">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <ShoppingCart className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add materials to your cart to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Shopping Cart ({items.length})</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClearCart}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.materialId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {item.material.name}
                  </h4>
                  <Badge className={getUrgencyColor(item.urgency)}>
                    {item.urgency}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.material.supplier.name} • ${item.unitPrice.toFixed(2)}/{item.material.pricing.unit}
                </p>
                {item.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Note: {item.notes}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.materialId, Math.max(1, item.quantity - 1))}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-12 text-center font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.materialId, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${item.totalPrice.toLocaleString()}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.materialId)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <Separator />
        
        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax (8%):</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
            <span className="font-medium">
              {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Checkout Button */}
        <Button onClick={onCheckout} className="w-full" size="lg">
          Proceed to Checkout
          <ShoppingCart className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

// Order Status Component
interface OrderStatusProps {
  status: MaterialOrder['status'];
  className?: string;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status, className }) => {
  const getStatusConfig = (status: MaterialOrder['status']) => {
    switch (status) {
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: Edit };
      case 'pending-approval':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock };
      case 'approved':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle };
      case 'ordered':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: Send };
      case 'in-transit':
        return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400', icon: Truck };
      case 'delivered':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: Package };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={cn(config.color, "flex items-center space-x-1", className)}>
      <Icon className="h-3 w-3" />
      <span>{status.replace('-', ' ')}</span>
    </Badge>
  );
};

// Order List Component
export interface OrderListProps {
  orders: MaterialOrder[];
  onOrderView: (order: MaterialOrder) => void;
  onOrderEdit: (order: MaterialOrder) => void;
  onOrderCancel: (order: MaterialOrder) => void;
  loading?: boolean;
  className?: string;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onOrderView,
  onOrderEdit,
  onOrderCancel,
  loading = false,
  className
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.grandTotal - a.grandTotal;
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [orders, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Material Orders ({filteredOrders.length})
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your material orders
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending-approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Order #{order.orderNumber}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {order.supplier.name} • {order.project.name}
                        </p>
                      </div>
                      <OrderStatus status={order.status} />
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${order.grandTotal.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span>Requested by {order.requestedBy.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    {order.expectedDelivery && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Truck className="h-4 w-4" />
                        <span>Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Approval Status */}
                  {order.approvals.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Approvals
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {order.approvals.map((approval) => (
                          <Badge
                            key={approval.id}
                            variant={
                              approval.status === 'approved' ? 'default' :
                              approval.status === 'rejected' ? 'destructive' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {approval.approver.name}: {approval.status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onOrderView(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {(order.status === 'draft' || order.status === 'pending-approval') && (
                        <Button variant="outline" size="sm" onClick={() => onOrderEdit(order)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOrderCancel(order)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Orders */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No orders found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {statusFilter === 'all' 
              ? "You haven't created any orders yet"
              : `No orders with status "${statusFilter}"`
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Main Material Ordering Workflow Component
export interface MaterialOrderingWorkflowProps {
  cartItems: OrderItem[];
  orders: MaterialOrder[];
  onUpdateCartQuantity: (materialId: string, quantity: number) => void;
  onRemoveFromCart: (materialId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onOrderView: (order: MaterialOrder) => void;
  onOrderEdit: (order: MaterialOrder) => void;
  onOrderCancel: (order: MaterialOrder) => void;
  className?: string;
}

export const MaterialOrderingWorkflow: React.FC<MaterialOrderingWorkflowProps> = ({
  cartItems,
  orders,
  onUpdateCartQuantity,
  onRemoveFromCart,
  onClearCart,
  onCheckout,
  onOrderView,
  onOrderEdit,
  onOrderCancel,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Material Ordering
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your material orders and track deliveries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shopping Cart */}
        <div className="lg:col-span-1">
          <ShoppingCart
            items={cartItems}
            onUpdateQuantity={onUpdateCartQuantity}
            onRemoveItem={onRemoveFromCart}
            onClearCart={onClearCart}
            onCheckout={onCheckout}
          />
        </div>
        
        {/* Orders List */}
        <div className="lg:col-span-2">
          <OrderList
            orders={orders}
            onOrderView={onOrderView}
            onOrderEdit={onOrderEdit}
            onOrderCancel={onOrderCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default MaterialOrderingWorkflow;