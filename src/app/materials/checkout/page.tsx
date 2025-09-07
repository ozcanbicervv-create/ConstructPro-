'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  Shield,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Plus,
  Minus,
  X
} from 'lucide-react';

// Mock cart data
const mockCartItems = [
  {
    id: '1',
    materialId: '1',
    name: 'Portland Cement Type I',
    category: 'Concrete & Masonry',
    supplier: 'BuildMart Supply Co.',
    quantity: 50,
    unitPrice: 12.50,
    totalPrice: 625.00,
    unit: 'bag',
    urgency: 'high' as const,
    deliveryDate: '2024-02-01',
    notes: 'For foundation work - Phase 1'
  },
  {
    id: '2',
    materialId: '2',
    name: 'Steel Rebar #4',
    category: 'Steel & Metal',
    supplier: 'Metro Steel Works',
    quantity: 100,
    unitPrice: 8.75,
    totalPrice: 875.00,
    unit: 'piece',
    urgency: 'medium' as const,
    deliveryDate: '2024-02-05',
    notes: 'Grade 60 steel for structural work'
  }
];

const mockProjects = [
  { id: 'proj1', name: 'Downtown Office Complex' },
  { id: 'proj2', name: 'Residential Development Phase 2' },
  { id: 'proj3', name: 'Highway Infrastructure Project' }
];

const mockApprovers = [
  { id: 'mgr1', name: 'Sarah Smith', role: 'Construction Manager' },
  { id: 'mgr2', name: 'Mike Johnson', role: 'Project Manager' },
  { id: 'mgr3', name: 'David Wilson', role: 'Site Supervisor' }
];

export default function MaterialCheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [orderDetails, setOrderDetails] = useState({
    projectId: '',
    requestedBy: 'current-user',
    priority: 'medium',
    notes: '',
    deliveryInstructions: ''
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '789 Construction Site Rd',
    city: 'Build City',
    state: 'CA',
    zipCode: '90211',
    country: 'USA',
    contactName: 'Site Supervisor',
    contactPhone: '(555) 987-6543',
    instructions: 'Deliver to main gate, contact site supervisor'
  });

  const [approvalSettings, setApprovalSettings] = useState({
    requiresApproval: true,
    approvers: ['mgr1'],
    autoApproveUnder: 1000
  });

  const [paymentMethod, setPaymentMethod] = useState('company-account');

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 1000 ? 0 : 75; // Free shipping over $1000
  const total = subtotal + tax + shipping;

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
        : item
    ));
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmitOrder = () => {
    console.log('Submitting order:', {
      items: cartItems,
      orderDetails,
      deliveryAddress,
      approvalSettings,
      paymentMethod,
      totals: { subtotal, tax, shipping, total }
    });
    
    // TODO: Submit order to API
    router.push('/materials/orders/success');
  };

  const getUrgencyColor = (urgency: string) => {
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

  const steps = [
    { id: 1, title: 'Review Order', icon: Package },
    { id: 2, title: 'Order Details', icon: FileText },
    { id: 3, title: 'Delivery & Payment', icon: Truck },
    { id: 4, title: 'Approval & Submit', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Materials
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Material Order Checkout
          </h1>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isActive ? "bg-blue-600 text-white" :
                        isCompleted ? "bg-green-600 text-white" :
                        "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium",
                          isActive ? "text-blue-600" :
                          isCompleted ? "text-green-600" :
                          "text-gray-600 dark:text-gray-400"
                        )}>
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-16 h-0.5 mx-4",
                        isCompleted ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Review Order */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </h4>
                          <Badge className={getUrgencyColor(item.urgency)}>
                            {item.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.supplier} • {item.category}
                        </p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Note: {item.notes}
                          </p>
                        )}
                        {item.deliveryDate && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Requested delivery: {item.deliveryDate}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
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
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            ${item.totalPrice.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${item.unitPrice.toFixed(2)}/{item.unit}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setCurrentStep(2)}>
                      Continue to Order Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Order Details */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="project">Project *</Label>
                      <Select value={orderDetails.projectId} onValueChange={(value) => setOrderDetails(prev => ({ ...prev, projectId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockProjects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Order Priority</Label>
                      <Select value={orderDetails.priority} onValueChange={(value) => setOrderDetails(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Order Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any special instructions or notes for this order..."
                      value={orderDetails.notes}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                    <Textarea
                      id="deliveryInstructions"
                      placeholder="Special delivery instructions, access codes, contact information..."
                      value={orderDetails.deliveryInstructions}
                      onChange={(e) => setOrderDetails(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(3)}>
                      Continue to Delivery & Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Delivery & Payment */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Delivery Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          value={deliveryAddress.street}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={deliveryAddress.state}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={deliveryAddress.zipCode}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          value={deliveryAddress.contactName}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, contactName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          value={deliveryAddress.contactPhone}
                          onChange={(e) => setDeliveryAddress(prev => ({ ...prev, contactPhone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="instructions">Delivery Instructions</Label>
                      <Textarea
                        id="instructions"
                        value={deliveryAddress.instructions}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Method</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <RadioGroupItem value="company-account" id="company-account" />
                        <Label htmlFor="company-account" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Company Account</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Bill to company account - Net 30 terms</p>
                            </div>
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <RadioGroupItem value="purchase-order" id="purchase-order" />
                        <Label htmlFor="purchase-order" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Purchase Order</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Pay with existing purchase order</p>
                            </div>
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label htmlFor="credit-card" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Credit Card</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Pay immediately with credit card</p>
                            </div>
                            <CreditCard className="h-5 w-5 text-gray-400" />
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep(4)}>
                    Continue to Approval
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Approval & Submit */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Approval Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresApproval"
                      checked={approvalSettings.requiresApproval}
                      onCheckedChange={(checked) => setApprovalSettings(prev => ({ ...prev, requiresApproval: checked as boolean }))}
                    />
                    <Label htmlFor="requiresApproval">This order requires approval</Label>
                  </div>

                  {approvalSettings.requiresApproval && (
                    <div className="space-y-4 pl-6 border-l-2 border-blue-200 dark:border-blue-800">
                      <div>
                        <Label>Select Approvers</Label>
                        <div className="space-y-2 mt-2">
                          {mockApprovers.map((approver) => (
                            <div key={approver.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={approver.id}
                                checked={approvalSettings.approvers.includes(approver.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setApprovalSettings(prev => ({ 
                                      ...prev, 
                                      approvers: [...prev.approvers, approver.id] 
                                    }));
                                  } else {
                                    setApprovalSettings(prev => ({ 
                                      ...prev, 
                                      approvers: prev.approvers.filter(id => id !== approver.id) 
                                    }));
                                  }
                                }}
                              />
                              <Label htmlFor={approver.id} className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{approver.name} - {approver.role}</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="autoApprove">Auto-approve orders under</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <Input
                            id="autoApprove"
                            type="number"
                            value={approvalSettings.autoApproveUnder}
                            onChange={(e) => setApprovalSettings(prev => ({ ...prev, autoApproveUnder: Number(e.target.value) }))}
                            className="w-32"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Summary Alert */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Order Review</h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                          {total >= (approvalSettings.autoApproveUnder || 0) && approvalSettings.requiresApproval
                            ? `This order requires approval as it exceeds the auto-approval limit of $${approvalSettings.autoApproveUnder?.toLocaleString()}.`
                            : approvalSettings.requiresApproval
                            ? 'This order will be auto-approved as it\'s under the approval threshold.'
                            : 'This order will be submitted immediately without approval.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      Back
                    </Button>
                    <Button onClick={handleSubmitOrder} size="lg" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal ({cartItems.length} items):</span>
                    <span className="font-medium">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax (8%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                {shipping === 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800 dark:text-green-200">
                        Free shipping on orders over $1,000
                      </span>
                    </div>
                  </div>
                )}

                {/* Estimated Delivery */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-sm">Estimated Delivery</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    February 1-5, 2024
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Based on supplier lead times
                  </p>
                </div>

                {/* Security Notice */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Secure Checkout
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Your order information is encrypted and secure
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}