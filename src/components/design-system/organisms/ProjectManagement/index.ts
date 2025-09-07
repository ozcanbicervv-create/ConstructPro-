/**
 * Project Management Organism Components
 * 
 * Comprehensive project management interface components including project grids,
 * detail views, creation forms, and timeline tracking components.
 */

// Project Grid with filtering, sorting, and search
export {
  ProjectGrid,
  type Project,
  type FilterOptions,
  type SortOptions,
  type ProjectGridProps
} from './ProjectGrid';

// Project Detail View with tabbed navigation
export {
  ProjectDetailView,
  type ProjectDetail,
  type ProjectDetailViewProps
} from './ProjectDetailView';

// Project Form Wizard for creation and editing
export {
  ProjectFormWizard,
  type ProjectFormWizardProps
} from './ProjectFormWizard';

// Default export with all components
export default {
  ProjectGrid,
  ProjectDetailView,
  ProjectFormWizard
};