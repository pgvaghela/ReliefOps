export interface Shelter {
  id: string;
  name: string;
  county: string;
  lat: number;
  lon: number;
  capacityTotal: number | null; // null if not available from data source
  capacityUsed: number | null; // null if not available from data source
  status: 'operational' | 'at-capacity' | 'overflow' | 'critical';
  hasPower: boolean | null; // null if not available
  hasWater: boolean | null; // null if not available
  medicalLevel: 'none' | 'basic' | 'advanced' | 'hospital' | null; // null if not available
  lastUpdated: Date;
  intakePerHour: number[]; // Empty array if not available
  supplies: {
    water: number | null; // gallons, null if not available
    food: number | null; // meals, null if not available
    meds: number | null; // units, null if not available
    fuel: number | null; // gallons, null if not available
  };
  issues: ShelterIssue[];
  // Optional FEMA-specific fields
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  address?: string | null;
  shelterStatus?: string | null; // Raw status from FEMA
}

export interface ShelterIssue {
  id: string;
  type: 'power' | 'water' | 'medical' | 'capacity' | 'supplies';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedAt: Date;
  resolvedAt?: Date;
}

export interface PipelineRun {
  id: string;
  pipelineName: string;
  datasetName: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: Date;
  durationSec: number;
  recordsProcessed: number;
  freshnessLagMin: number;
  owner: string;
  tasks: TaskRun[];
}

export interface TaskRun {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startedAt: Date;
  durationSec: number;
  logs: string[];
  retryCount: number;
}

export interface ModelVersion {
  id: string;
  modelName: string;
  version: string;
  stage: 'staging' | 'canary' | 'prod';
  lastTrainedAt: Date;
  metrics: {
    mae: number;
    f1: number;
    latencyP50: number; // ms
    latencyP95: number; // ms
    errorRate: number; // percentage
  };
  driftSignals: DriftSignal[];
}

export interface DriftSignal {
  featureName: string;
  psi: number; // Population Stability Index
  direction: 'up' | 'down';
  severity: 'low' | 'medium' | 'high' | 'critical';
  note: string;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  sourceType: 'shelter' | 'pipeline' | 'model';
  sourceId: string;
  title: string;
  signal: string;
  evidence: string[];
  impact: string;
  suggestedActions: string[];
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  snoozedUntil?: Date;
}

export interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: Date;
  assignedTo: string;
  alertIds: string[];
  timelineEvents: TimelineEvent[];
  notes: IncidentNote[];
  auditTrail: AuditEntry[];
}

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'alert' | 'action' | 'update' | 'note';
  description: string;
  actor?: string;
}

export interface IncidentNote {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  target: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

