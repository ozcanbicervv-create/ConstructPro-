// Construction industry specific constants

export const CONSTRUCTION_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
  INFRASTRUCTURE: 'infrastructure',
  RENOVATION: 'renovation',
} as const;

export const PROJECT_STATUSES = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
} as const;

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const MATERIAL_STATUSES = {
  ORDERED: 'ordered',
  DELIVERED: 'delivered',
  IN_USE: 'in-use',
  COMPLETED: 'completed',
} as const;

export const DOCUMENT_TYPES = {
  BLUEPRINT: 'blueprint',
  CONTRACT: 'contract',
  PERMIT: 'permit',
  PHOTO: 'photo',
  REPORT: 'report',
  OTHER: 'other',
} as const;

export const PERMIT_TYPES = {
  BUILDING: 'building',
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  MECHANICAL: 'mechanical',
  DEMOLITION: 'demolition',
  EXCAVATION: 'excavation',
} as const;

export const INSPECTION_TYPES = {
  FOUNDATION: 'foundation',
  FRAMING: 'framing',
  ELECTRICAL: 'electrical',
  PLUMBING: 'plumbing',
  FINAL: 'final',
} as const;

export const EQUIPMENT_TYPES = {
  EXCAVATOR: 'excavator',
  CRANE: 'crane',
  BULLDOZER: 'bulldozer',
  LOADER: 'loader',
  TRUCK: 'truck',
  GENERATOR: 'generator',
  COMPRESSOR: 'compressor',
  TOOLS: 'tools',
} as const;

export const SAFETY_INCIDENT_TYPES = {
  INJURY: 'injury',
  NEAR_MISS: 'near-miss',
  PROPERTY_DAMAGE: 'property-damage',
  ENVIRONMENTAL: 'environmental',
} as const;

export const CONSTRUCTION_ROLES = {
  PROJECT_MANAGER: 'Project Manager',
  SITE_SUPERVISOR: 'Site Supervisor',
  FOREMAN: 'Foreman',
  ENGINEER: 'Engineer',
  ARCHITECT: 'Architect',
  CONTRACTOR: 'Contractor',
  SUBCONTRACTOR: 'Subcontractor',
  WORKER: 'Worker',
  INSPECTOR: 'Inspector',
  SAFETY_OFFICER: 'Safety Officer',
} as const;

export const MATERIAL_UNITS = {
  PIECES: 'pcs',
  METERS: 'm',
  SQUARE_METERS: 'm²',
  CUBIC_METERS: 'm³',
  KILOGRAMS: 'kg',
  TONS: 't',
  LITERS: 'l',
  HOURS: 'hrs',
  DAYS: 'days',
} as const;

export const QUALITY_STATUSES = {
  PASS: 'pass',
  FAIL: 'fail',
  CONDITIONAL: 'conditional',
} as const;

export const DEFECT_SEVERITIES = {
  MINOR: 'minor',
  MAJOR: 'major',
  CRITICAL: 'critical',
} as const;