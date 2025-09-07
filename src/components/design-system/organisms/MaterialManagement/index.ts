/**
 * Material Management Organism Components
 * 
 * Comprehensive material management interface components including comparison tables,
 * supplier directories, cost analysis, and ordering workflows with approval processes.
 */

// Material Comparison Table with sorting and filtering
export {
  MaterialComparisonTable,
  type Material,
  type MaterialFilterOptions,
  type MaterialSortOptions,
  type MaterialComparisonTableProps
} from './MaterialComparisonTable';

// Supplier Directory with rating systems
export {
  SupplierDirectory,
  type Supplier,
  type SupplierFilterOptions,
  type SupplierSortOptions,
  type SupplierDirectoryProps
} from './SupplierDirectory';

// Material Cost Analysis with trend visualizations
export {
  MaterialCostAnalysis,
  MaterialPriceTrends,
  CostCategoryBreakdown,
  SupplierCostAnalysis,
  type MaterialPriceHistory,
  type CostTrendData,
  type CategoryCostData,
  type SupplierCostData,
  type CostForecast,
  type MaterialCostAnalysisProps,
  type MaterialPriceTrendsProps,
  type CostCategoryBreakdownProps,
  type SupplierCostAnalysisProps
} from './MaterialCostAnalysis';

// Material Ordering Workflow with approval processes
export {
  MaterialOrderingWorkflow,
  ShoppingCart,
  OrderList,
  type OrderItem,
  type MaterialOrder,
  type ShoppingCartProps,
  type OrderListProps,
  type MaterialOrderingWorkflowProps
} from './MaterialOrderingWorkflow';

// Import components for default export
import { MaterialComparisonTable } from './MaterialComparisonTable';
import { SupplierDirectory } from './SupplierDirectory';
import { 
  MaterialCostAnalysis,
  MaterialPriceTrends,
  CostCategoryBreakdown,
  SupplierCostAnalysis
} from './MaterialCostAnalysis';
import { 
  MaterialOrderingWorkflow,
  ShoppingCart,
  OrderList
} from './MaterialOrderingWorkflow';

// Default export with all components
const MaterialManagementComponents = {
  MaterialComparisonTable,
  SupplierDirectory,
  MaterialCostAnalysis,
  MaterialPriceTrends,
  CostCategoryBreakdown,
  SupplierCostAnalysis,
  MaterialOrderingWorkflow,
  ShoppingCart,
  OrderList
};

export default MaterialManagementComponents;