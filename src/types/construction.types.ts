// Construction industry specific type definitions

export interface ConstructionProject extends Project {
  constructionType: ConstructionType;
  permits: Permit[];
  inspections: Inspection[];
  safety: SafetyRecord;
  equipment: Equipment[];
  subcontractors: Subcontractor[];
  qualityChecks: QualityCheck[];
  progressReports: ProgressReport[];
  weatherImpact: WeatherImpact[];
  environmentalFactors: EnvironmentalFactor[];
}

export type ConstructionType = 
  | 'residential' 
  | 'commercial' 
  | 'industrial' 
  | 'infrastructure' 
  | 'renovation'
  | 'maintenance'
  | 'demolition';

// Permit Management
export interface Permit {
  id: string;
  type: PermitType;
  number: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  status: PermitStatus;
  cost: number;
  documents: PermitDocument[];
  conditions: string[];
  renewalRequired: boolean;
  renewalDate?: Date;
  projectId: string;
  appliedBy: string;
  approvedBy?: string;
}

export type PermitType = 
  | 'building' 
  | 'electrical' 
  | 'plumbing' 
  | 'mechanical' 
  | 'demolition' 
  | 'excavation'
  | 'environmental'
  | 'fire-safety'
  | 'zoning'
  | 'occupancy';

export type PermitStatus = 
  | 'pending' 
  | 'under-review'
  | 'approved' 
  | 'expired' 
  | 'rejected'
  | 'suspended'
  | 'renewed';

export interface PermitDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  required: boolean;
  approved: boolean;
}

// Inspection Management
export interface Inspection {
  id: string;
  type: InspectionType;
  phase: string;
  scheduledDate: Date;
  completedDate?: Date;
  inspector: InspectorInfo;
  status: InspectionStatus;
  score?: number;
  notes: string;
  photos: InspectionPhoto[];
  checklist: InspectionItem[];
  defects: InspectionDefect[];
  followUpRequired: boolean;
  followUpDate?: Date;
  cost: number;
  projectId: string;
  permitId?: string;
}

export type InspectionType = 
  | 'foundation' 
  | 'framing' 
  | 'electrical' 
  | 'plumbing' 
  | 'mechanical'
  | 'insulation'
  | 'drywall'
  | 'flooring'
  | 'roofing'
  | 'final'
  | 'safety'
  | 'environmental';

export type InspectionStatus = 
  | 'scheduled' 
  | 'in-progress'
  | 'passed' 
  | 'failed' 
  | 'conditional'
  | 'cancelled'
  | 'rescheduled';

export interface InspectorInfo {
  id: string;
  name: string;
  license: string;
  company: string;
  phone: string;
  email: string;
  specializations: string[];
  rating: number;
}

export interface InspectionItem {
  id: string;
  category: string;
  description: string;
  status: 'pass' | 'fail' | 'na' | 'conditional';
  notes?: string;
  photos?: string[];
  required: boolean;
  weight: number; // for scoring
}

export interface InspectionDefect {
  id: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  location: string;
  category: string;
  assignedTo: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved' | 'deferred';
  resolution?: string;
  resolutionDate?: Date;
  photos: string[];
  cost?: number;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  caption: string;
  location: string;
  timestamp: Date;
  tags: string[];
}

// Safety Management
export interface SafetyRecord {
  incidents: SafetyIncident[];
  meetings: SafetyMeeting[];
  training: SafetyTraining[];
  equipment: SafetyEquipment[];
  audits: SafetyAudit[];
  statistics: SafetyStatistics;
}

export interface SafetyIncident {
  id: string;
  date: Date;
  time: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location: string;
  involvedPersons: IncidentPerson[];
  witnesses: IncidentPerson[];
  actions: IncidentAction[];
  reportedBy: string;
  investigatedBy?: string;
  status: IncidentStatus;
  rootCause?: string;
  preventiveMeasures: string[];
  cost?: number;
  lostTime?: number; // hours
  photos: string[];
  documents: string[];
  followUpDate?: Date;
}

export type IncidentType = 
  | 'injury' 
  | 'near-miss' 
  | 'property-damage' 
  | 'environmental'
  | 'equipment-failure'
  | 'fire'
  | 'chemical-spill'
  | 'fall'
  | 'struck-by'
  | 'caught-in';

export type IncidentSeverity = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical'
  | 'fatality';

export type IncidentStatus = 
  | 'reported'
  | 'investigating' 
  | 'resolved'
  | 'closed'
  | 'pending-review';

export interface IncidentPerson {
  id: string;
  name: string;
  role: string;
  company: string;
  injuryType?: string;
  medicalAttention?: boolean;
  hospitalTransport?: boolean;
}

export interface IncidentAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface SafetyMeeting {
  id: string;
  date: Date;
  duration: number; // minutes
  type: 'toolbox' | 'safety-briefing' | 'training' | 'incident-review';
  attendees: SafetyAttendee[];
  topics: SafetyTopic[];
  notes: string;
  conductedBy: string;
  location: string;
  photos?: string[];
  documents?: string[];
  followUpActions: string[];
}

export interface SafetyAttendee {
  id: string;
  name: string;
  role: string;
  company: string;
  signature?: string;
  present: boolean;
}

export interface SafetyTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number; // minutes
  presenter: string;
}

export interface SafetyTraining {
  id: string;
  title: string;
  type: SafetyTrainingType;
  date: Date;
  duration: number; // hours
  attendees: SafetyAttendee[];
  instructor: InstructorInfo;
  location: string;
  materials: string[];
  certificateIssued: boolean;
  expiryDate?: Date;
  cost: number;
  effectiveness: number; // 1-10 rating
  feedback: TrainingFeedback[];
}

export type SafetyTrainingType = 
  | 'orientation'
  | 'hazcom'
  | 'fall-protection'
  | 'confined-space'
  | 'lockout-tagout'
  | 'first-aid'
  | 'fire-safety'
  | 'equipment-operation'
  | 'emergency-response';

export interface InstructorInfo {
  id: string;
  name: string;
  certifications: string[];
  company: string;
  experience: number; // years
  rating: number;
}

export interface TrainingFeedback {
  attendeeId: string;
  rating: number; // 1-5
  comments: string;
  suggestions: string;
}

export interface SafetyEquipment {
  id: string;
  type: SafetyEquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  assignedTo: string;
  issuedDate: Date;
  returnDate?: Date;
  condition: EquipmentCondition;
  lastInspection: Date;
  nextInspection: Date;
  certificationExpiry?: Date;
  cost: number;
  location: string;
  notes: string;
}

export type SafetyEquipmentType = 
  | 'hard-hat'
  | 'safety-glasses'
  | 'hearing-protection'
  | 'respirator'
  | 'fall-harness'
  | 'safety-boots'
  | 'high-vis-vest'
  | 'gloves'
  | 'face-shield'
  | 'safety-net';

export interface SafetyAudit {
  id: string;
  date: Date;
  auditor: string;
  type: 'internal' | 'external' | 'regulatory';
  scope: string[];
  findings: AuditFinding[];
  score: number;
  recommendations: string[];
  followUpDate: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'follow-up';
}

export interface AuditFinding {
  id: string;
  category: string;
  description: string;
  severity: 'observation' | 'minor' | 'major' | 'critical';
  requirement: string;
  evidence: string[];
  correctiveAction: string;
  assignedTo: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'closed';
}

export interface SafetyStatistics {
  totalIncidents: number;
  lostTimeIncidents: number;
  nearMisses: number;
  daysWithoutIncident: number;
  incidentRate: number; // per 100 workers
  severityRate: number;
  trainingHours: number;
  complianceScore: number;
  period: {
    start: Date;
    end: Date;
  };
}

// Equipment Management
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  category: EquipmentCategory;
  brand: string;
  model: string;
  serialNumber: string;
  year: number;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  location: string;
  operator?: EquipmentOperator;
  maintenance: MaintenanceRecord[];
  rental?: RentalInfo;
  ownership: 'owned' | 'rented' | 'leased';
  purchaseDate?: Date;
  purchasePrice?: number;
  currentValue?: number;
  specifications: EquipmentSpecifications;
  certifications: EquipmentCertification[];
  insurance: EquipmentInsurance;
  fuelType?: string;
  fuelConsumption?: number;
  operatingHours: number;
  lastServiceHours: number;
  nextServiceHours: number;
}

export type EquipmentType = 
  | 'excavator' 
  | 'crane' 
  | 'bulldozer' 
  | 'loader' 
  | 'truck' 
  | 'generator' 
  | 'compressor' 
  | 'concrete-mixer'
  | 'forklift'
  | 'scaffolding'
  | 'tools'
  | 'safety-equipment';

export type EquipmentCategory = 
  | 'heavy-machinery'
  | 'light-equipment'
  | 'hand-tools'
  | 'power-tools'
  | 'safety-equipment'
  | 'measuring-instruments'
  | 'vehicles';

export type EquipmentStatus = 
  | 'available' 
  | 'in-use' 
  | 'maintenance' 
  | 'out-of-service'
  | 'reserved'
  | 'retired';

export type EquipmentCondition = 
  | 'excellent'
  | 'good' 
  | 'fair' 
  | 'poor' 
  | 'needs-replacement';

export interface EquipmentOperator {
  id: string;
  name: string;
  license: string;
  certifications: string[];
  experience: number; // years
  rating: number;
  assignedDate: Date;
}

export interface EquipmentSpecifications {
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  capacity?: number;
  powerRating?: number;
  maxSpeed?: number;
  fuelCapacity?: number;
  operatingPressure?: number;
  voltage?: number;
  [key: string]: any;
}

export interface EquipmentCertification {
  id: string;
  type: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  certificateNumber: string;
  status: 'valid' | 'expired' | 'suspended';
}

export interface EquipmentInsurance {
  provider: string;
  policyNumber: string;
  coverage: number;
  deductible: number;
  startDate: Date;
  endDate: Date;
  premiumAmount: number;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: MaintenanceType;
  description: string;
  cost: number;
  laborHours: number;
  parts: MaintenancePart[];
  performedBy: string;
  serviceProvider?: string;
  nextDue?: Date;
  nextDueHours?: number;
  warranty?: MaintenanceWarranty;
  photos?: string[];
  documents?: string[];
  downtime: number; // hours
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}

export type MaintenanceType = 
  | 'routine' 
  | 'preventive'
  | 'repair' 
  | 'inspection'
  | 'calibration'
  | 'overhaul'
  | 'emergency';

export interface MaintenancePart {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  warranty?: number; // months
}

export interface MaintenanceWarranty {
  provider: string;
  startDate: Date;
  endDate: Date;
  coverage: string;
  terms: string;
}

export interface RentalInfo {
  supplier: RentalSupplier;
  startDate: Date;
  endDate: Date;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  totalCost: number;
  deposit: number;
  terms: string;
  deliveryFee?: number;
  pickupFee?: number;
  insurance?: number;
  fuelIncluded: boolean;
  operatorIncluded: boolean;
}

export interface RentalSupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  terms: string;
}

// Subcontractor Management
export interface Subcontractor {
  id: string;
  companyName: string;
  businessType: 'sole-proprietorship' | 'partnership' | 'corporation' | 'llc';
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  specialization: string[];
  license: ContractorLicense;
  insurance: ContractorInsurance;
  bonding?: ContractorBonding;
  certifications: string[];
  rating: number;
  reviewCount: number;
  projects: SubcontractorProject[];
  financialInfo: SubcontractorFinancials;
  safetyRecord: SubcontractorSafety;
  qualityScore: number;
  onTimePerformance: number;
  budgetPerformance: number;
  communicationRating: number;
  wouldRecommend: boolean;
  blacklisted: boolean;
  blacklistReason?: string;
  prequalified: boolean;
  prequalificationDate?: Date;
  prequalificationExpiry?: Date;
}

export interface ContractorLicense {
  number: string;
  type: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  classifications: string[];
  monetaryLimit?: number;
}

export interface ContractorInsurance {
  generalLiability: InsurancePolicy;
  workersCompensation: InsurancePolicy;
  professionalLiability?: InsurancePolicy;
  commercialAuto?: InsurancePolicy;
  umbrella?: InsurancePolicy;
}

export interface InsurancePolicy {
  provider: string;
  policyNumber: string;
  coverage: number;
  deductible: number;
  startDate: Date;
  endDate: Date;
  verified: boolean;
  verificationDate?: Date;
  certificate?: string;
}

export interface ContractorBonding {
  provider: string;
  bondNumber: string;
  amount: number;
  type: 'bid' | 'performance' | 'payment' | 'maintenance';
  startDate: Date;
  endDate: Date;
  verified: boolean;
}

export interface SubcontractorProject {
  projectId: string;
  projectName: string;
  role: string;
  startDate: Date;
  endDate: Date;
  contractValue: number;
  actualCost: number;
  performance: ProjectPerformance;
  reference: ProjectReference;
}

export interface ProjectPerformance {
  qualityScore: number;
  timelineScore: number;
  budgetScore: number;
  safetyScore: number;
  communicationScore: number;
  overallScore: number;
  issues: string[];
  strengths: string[];
}

export interface ProjectReference {
  contactName: string;
  contactTitle: string;
  contactPhone: string;
  contactEmail: string;
  wouldHireAgain: boolean;
  comments: string;
  verificationDate: Date;
}

export interface SubcontractorFinancials {
  annualRevenue?: number;
  creditRating?: string;
  bondingCapacity?: number;
  bankReferences: BankReference[];
  tradeReferences: TradeReference[];
  paymentTerms: string;
  taxId: string;
  dunsNumber?: string;
}

export interface BankReference {
  bankName: string;
  contactName: string;
  contactPhone: string;
  accountType: string;
  yearsWithBank: number;
  creditLine?: number;
}

export interface TradeReference {
  companyName: string;
  contactName: string;
  contactPhone: string;
  relationship: string;
  yearsOfBusiness: number;
  creditLimit?: number;
  paymentHistory: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface SubcontractorSafety {
  emr: number; // Experience Modification Rate
  totalRecordableIncidentRate: number;
  lostTimeIncidentRate: number;
  safetyProgram: boolean;
  safetyOfficer: string;
  osha10: boolean;
  osha30: boolean;
  safetyTrainingProgram: boolean;
  lastSafetyAudit?: Date;
  safetyAuditScore?: number;
}

// Quality Control
export interface QualityCheck {
  id: string;
  projectId: string;
  area: string;
  phase: string;
  checkDate: Date;
  inspector: QualityInspector;
  status: QualityStatus;
  score?: number;
  defects: QualityDefect[];
  photos: string[];
  notes: string;
  checklist: QualityChecklistItem[];
  followUpRequired: boolean;
  followUpDate?: Date;
  approvedBy?: string;
  approvalDate?: Date;
}

export type QualityStatus = 
  | 'pass' 
  | 'fail' 
  | 'conditional'
  | 'pending'
  | 'in-progress';

export interface QualityInspector {
  id: string;
  name: string;
  certifications: string[];
  experience: number;
  specializations: string[];
  rating: number;
}

export interface QualityChecklistItem {
  id: string;
  category: string;
  description: string;
  requirement: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
  photos?: string[];
  weight: number;
}

export interface QualityDefect {
  id: string;
  description: string;
  severity: DefectSeverity;
  category: string;
  location: string;
  assignedTo: string;
  dueDate: Date;
  status: DefectStatus;
  resolution?: string;
  resolutionDate?: Date;
  resolutionCost?: number;
  photos: string[];
  rootCause?: string;
  preventiveMeasures: string[];
}

export type DefectSeverity = 
  | 'cosmetic'
  | 'minor' 
  | 'major' 
  | 'critical'
  | 'safety-related';

export type DefectStatus = 
  | 'open' 
  | 'in-progress' 
  | 'resolved' 
  | 'verified'
  | 'deferred'
  | 'rejected';

// Progress Tracking
export interface ProgressReport {
  id: string;
  projectId: string;
  date: Date;
  reportingPeriod: {
    start: Date;
    end: Date;
  };
  phase: string;
  percentComplete: number;
  workCompleted: WorkItem[];
  workPlanned: WorkItem[];
  workInProgress: WorkItem[];
  issues: ProjectIssue[];
  risks: ProjectRisk[];
  photos: ProgressPhoto[];
  weather: WeatherCondition[];
  laborHours: LaborHours;
  materialUsage: MaterialUsage[];
  equipmentUsage: EquipmentUsage[];
  reportedBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  nextReportDate: Date;
}

export interface WorkItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  percentComplete: number;
  startDate?: Date;
  endDate?: Date;
  assignedTo: string[];
  notes?: string;
}

export interface ProjectIssue {
  id: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  assignedTo: string;
  dueDate: Date;
  resolution?: string;
  resolutionDate?: Date;
  impact: IssueImpact;
}

export type IssueCategory = 
  | 'technical'
  | 'schedule'
  | 'budget'
  | 'quality'
  | 'safety'
  | 'environmental'
  | 'regulatory'
  | 'communication';

export type IssueSeverity = 
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type IssueStatus = 
  | 'open'
  | 'in-progress'
  | 'resolved'
  | 'closed'
  | 'escalated';

export interface IssueImpact {
  schedule: number; // days
  budget: number; // cost
  quality: string;
  safety: string;
}

export interface ProjectRisk {
  id: string;
  description: string;
  category: string;
  probability: RiskProbability;
  impact: RiskImpact;
  riskScore: number;
  mitigation: string;
  contingency: string;
  owner: string;
  status: RiskStatus;
  reviewDate: Date;
}

export type RiskProbability = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type RiskImpact = 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
export type RiskStatus = 'identified' | 'assessed' | 'mitigated' | 'closed' | 'occurred';

export interface ProgressPhoto {
  id: string;
  url: string;
  caption: string;
  location: string;
  angle: string;
  timestamp: Date;
  tags: string[];
  comparison?: {
    previousPhotoId: string;
    changeDescription: string;
  };
}

export interface WeatherCondition {
  date: Date;
  temperature: {
    high: number;
    low: number;
  };
  precipitation: number;
  windSpeed: number;
  humidity: number;
  conditions: string;
  workImpact: WeatherImpact;
}

export interface WeatherImpact {
  workStopped: boolean;
  hoursLost: number;
  activitiesAffected: string[];
  safetyMeasures: string[];
  productivityImpact: number; // percentage
}

export interface LaborHours {
  regular: number;
  overtime: number;
  total: number;
  byTrade: TradeHours[];
  productivity: number; // percentage of planned
}

export interface TradeHours {
  trade: string;
  workers: number;
  hours: number;
  productivity: number;
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantityUsed: number;
  quantityWasted: number;
  unit: string;
  cost: number;
  supplier: string;
  deliveryDate: Date;
  location: string;
}

export interface EquipmentUsage {
  equipmentId: string;
  equipmentName: string;
  hoursUsed: number;
  fuelConsumed?: number;
  operator: string;
  location: string;
  productivity: number;
  downtime?: number;
  downtimeReason?: string;
}

// Environmental Factors
export interface EnvironmentalFactor {
  id: string;
  type: EnvironmentalType;
  description: string;
  impact: EnvironmentalImpact;
  mitigation: string[];
  monitoring: EnvironmentalMonitoring;
  compliance: ComplianceStatus;
  reportingRequired: boolean;
  lastReported?: Date;
}

export type EnvironmentalType = 
  | 'air-quality'
  | 'water-quality'
  | 'noise-pollution'
  | 'soil-contamination'
  | 'waste-management'
  | 'energy-consumption'
  | 'carbon-emissions'
  | 'wildlife-protection';

export interface EnvironmentalImpact {
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: 'temporary' | 'short-term' | 'long-term' | 'permanent';
  scope: 'local' | 'regional' | 'widespread';
  reversibility: 'reversible' | 'partially-reversible' | 'irreversible';
}

export interface EnvironmentalMonitoring {
  frequency: string;
  parameters: string[];
  methods: string[];
  equipment: string[];
  responsible: string;
  reportingSchedule: string;
}

export interface ComplianceStatus {
  regulations: string[];
  permits: string[];
  status: 'compliant' | 'non-compliant' | 'pending' | 'under-review';
  lastAudit?: Date;
  nextAudit?: Date;
  violations: ComplianceViolation[];
}

export interface ComplianceViolation {
  id: string;
  regulation: string;
  description: string;
  severity: 'minor' | 'major' | 'critical';
  fineAmount?: number;
  correctiveAction: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'resolved';
  resolutionDate?: Date;
}

// KYC/KYB Verification System (for admin panel)
export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userType: UserType;
  profession?: string;
  company?: string;
  submittedAt: Date;
  status: VerificationStatus;
  riskScore: number;
  complianceScore: number;
  documents: VerificationDocument[];
  reviewer?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  verificationLevel: VerificationLevel;
  expiryDate?: Date;
  renewalRequired: boolean;
}

export type UserType = 'individual' | 'professional' | 'corporate';

export type VerificationStatus = 
  | 'pending' 
  | 'in_review' 
  | 'approved' 
  | 'rejected'
  | 'expired'
  | 'suspended';

export type VerificationLevel = 'basic' | 'standard' | 'enhanced' | 'premium';

export interface VerificationDocument {
  id: string;
  name: string;
  type: DocumentVerificationType;
  status: DocumentVerificationStatus;
  uploadedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  fileUrl?: string;
  expiryDate?: Date;
  verificationMethod: string;
  confidence: number; // 0-100
}

export type DocumentVerificationType = 
  | 'identity'
  | 'address'
  | 'income'
  | 'employment'
  | 'education'
  | 'license'
  | 'certification'
  | 'insurance'
  | 'tax'
  | 'bank-statement'
  | 'business-registration'
  | 'articles-of-incorporation';

export type DocumentVerificationStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected'
  | 'expired'
  | 'requires-update';

export interface AdminStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageProcessingTime: number; // hours
  highRiskCases: number;
  complianceRate: number; // percentage
  automationRate: number; // percentage
  fraudDetected: number;
  appealsCases: number;
}

// Import base types
import type { Project } from './project.types';