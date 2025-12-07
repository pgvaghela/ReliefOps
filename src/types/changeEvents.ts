export type ChangeEventKind =
  | 'SHELTER_THRESHOLD'
  | 'SUPPLY_LOW'
  | 'PIPELINE_STALE'
  | 'PIPELINE_FAILED'
  | 'MODEL_DRIFT'
  | 'INCIDENT_CREATED'
  | 'INCIDENT_ASSIGNED'
  | 'INCIDENT_CLOSED'
  | 'NOTE_ADDED'
  | 'ALERT_CREATED'
  | 'ALERT_RESOLVED';

export type ChangeEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ChangeEventEntityType = 'shelter' | 'pipeline' | 'model' | 'incident' | 'alert';

export interface ChangeEvent {
  id: string;
  ts: string; // ISO string
  kind: ChangeEventKind;
  severity: ChangeEventSeverity;
  title: string;
  description: string;
  entityType: ChangeEventEntityType;
  entityId: string;
  link: string;
}

