export interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  assignedTo: string | null;
  sourceAlertId: string | null; // ID of the alert that triggered this incident
  notes: Note[];
  auditTrail: AuditEntry[];
  runbook: RunbookStep[];
}

export interface Note {
  id: string;
  ts: Date;
  author: string;
  text: string;
}

export interface AuditEntry {
  id: string;
  ts: Date;
  actor: string;
  action: string;
  details?: string;
}

export interface RunbookStep {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
}

