import { create } from 'zustand';
import type { Alert, Shelter } from '../types';
import type { Incident, Note, AuditEntry, RunbookStep } from '../types/incidents';
import type { ChangeEvent } from '../types/changeEvents';
import { fetchNWSAlerts } from '../integrations/nws';
import { fetchFemaOpenShelters } from '../integrations/femaShelters';
import { generateSeedData } from '../mocks/seed';
import { config } from '../config';

interface AppState {
  // Theme
  theme: 'dark' | 'light';
  
  // Unified live data control
  liveDataEnabled: boolean;
  selectedState: string;

  // Sample data (for when live data is off)
  sampleShelters: Shelter[];
  sampleAlerts: Alert[];

  // Real data entities (live data)
  shelters: Shelter[];

  // NWS Live Alerts (internal state, driven by liveDataEnabled)
  liveNwsEnabled: boolean;
  nwsLastFetchedAt: string | null;
  nwsStatus: 'idle' | 'loading' | 'ok' | 'error';
  nwsError?: string;
  nwsAlerts: Alert[];

  // FEMA Live Shelters (internal state, driven by liveDataEnabled)
  liveFemaEnabled: boolean;
  femaLastFetchedAt: string | null;
  femaStatus: 'idle' | 'loading' | 'ok' | 'error';
  femaError?: string;
  femaShelters: Shelter[];

  // Incidents (workflow tracking)
  incidents: Incident[];
  activityLog: ChangeEvent[];

  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setLiveDataEnabled: (enabled: boolean) => void;
  setSelectedState: (state: string) => void;
  fetchAndMergeNwsAlerts: () => Promise<void>;
  fetchFemaShelters: () => Promise<void>;
  clearLiveData: () => void;

  // Helpers
  getSheltersForView: () => Shelter[];
  getAlertsForView: () => Alert[];
  getShelterDataCoverage: (shelter: Shelter) => { locationStatus: 'Live' | 'Sample'; capacity: 'Reported' | 'N/A' };

  // Incident actions
  createIncidentFromAlert: (alertId: string) => string; // Returns incident ID
  assignIncident: (incidentId: string, assignee: string) => void;
  addIncidentNote: (incidentId: string, text: string, author?: string) => void;
  updateRunbookStep: (incidentId: string, stepId: string, status: RunbookStep['status']) => void;
  closeIncident: (incidentId: string) => void;
  recordChangeEvent: (event: Omit<ChangeEvent, 'id' | 'ts'>) => void;
}

const seedData = generateSeedData();

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get initial theme from localStorage or system preference
function getInitialTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
  if (stored) return stored;
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

// Apply theme to document
function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

const initialState = {
  theme: getInitialTheme(),
};

// Apply initial theme
applyTheme(initialState.theme);

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  theme: initialState.theme,

  // Unified control
  liveDataEnabled: false,
  selectedState: config.DEFAULT_NWS_STATE,

  // Sample data
  sampleShelters: seedData.shelters,
  sampleAlerts: seedData.alerts,

  // Real data entities
  shelters: seedData.shelters, // Start with sample data

  // NWS state (internal, driven by liveDataEnabled)
  liveNwsEnabled: false,
  nwsLastFetchedAt: null,
  nwsStatus: 'idle',
  nwsError: undefined,
  nwsAlerts: [],

  // FEMA state (internal, driven by liveDataEnabled)
  liveFemaEnabled: false,
  femaLastFetchedAt: null,
  femaStatus: 'idle',
  femaError: undefined,
  femaShelters: [],

  // Incidents
  incidents: [],
  activityLog: [],

  // Theme Actions
  // Theme Actions
  setTheme: (theme: 'dark' | 'light') => {
    set({ theme });
    applyTheme(theme);
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  // Unified Actions
  setLiveDataEnabled: (enabled: boolean) => {
    if (enabled) {
      // Enable both NWS and FEMA
      set({
        liveDataEnabled: true,
        liveNwsEnabled: true,
        liveFemaEnabled: true,
        nwsStatus: 'loading',
        femaStatus: 'loading',
      });
      // Trigger immediate fetches
      get().fetchAndMergeNwsAlerts();
      get().fetchFemaShelters();
    } else {
      // Disable both and clear live data
      get().clearLiveData();
    }
  },

  setSelectedState: (state: string) => {
    set({ selectedState: state });
    if (get().liveDataEnabled) {
      // Refetch both sources with new state
      get().fetchAndMergeNwsAlerts();
      get().fetchFemaShelters();
    }
  },

  clearLiveData: () => {
    set({
      liveDataEnabled: false,
      liveNwsEnabled: false,
      liveFemaEnabled: false,
      nwsAlerts: [],
      femaShelters: [],
      shelters: get().sampleShelters, // Switch back to sample data
      nwsStatus: 'idle',
      femaStatus: 'idle',
      nwsLastFetchedAt: null,
      femaLastFetchedAt: null,
      nwsError: undefined,
      femaError: undefined,
    });
  },

  fetchAndMergeNwsAlerts: async () => {
    const state = get();
    if (!state.liveDataEnabled || !state.liveNwsEnabled) return;

    set({ nwsStatus: 'loading', nwsError: undefined });

    try {
      const newAlerts = await fetchNWSAlerts(state.selectedState);
      
      set({
        nwsAlerts: newAlerts,
        nwsStatus: 'ok',
        nwsLastFetchedAt: new Date().toISOString(),
        nwsError: undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({
        nwsStatus: 'error',
        nwsError: errorMessage,
      });
      if (errorMessage.includes('rate-limit') || errorMessage.includes('429')) {
        console.warn('NWS API rate limit reached. Consider increasing poll interval.');
      }
    }
  },

  fetchFemaShelters: async () => {
    const state = get();
    if (!state.liveDataEnabled || !state.liveFemaEnabled) return;

    set({ femaStatus: 'loading', femaError: undefined });

    try {
      const shelters = await fetchFemaOpenShelters(state.selectedState);
      
      set({
        shelters: shelters, // Replace with live FEMA shelters (removes sample data)
        femaShelters: shelters,
        femaStatus: 'ok',
        femaLastFetchedAt: new Date().toISOString(),
        femaError: undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({
        femaStatus: 'error',
        femaError: errorMessage,
      });
    }
  },

  // Helpers
  getSheltersForView: () => {
    const state = get();
    return state.liveDataEnabled ? state.femaShelters : state.sampleShelters;
  },

  getAlertsForView: () => {
    const state = get();
    return state.liveDataEnabled ? state.nwsAlerts : state.sampleAlerts;
  },

  getShelterDataCoverage: (shelter: Shelter) => {
    const state = get();
    const locationStatus: 'Live' | 'Sample' = 
      state.liveDataEnabled && shelter.id.startsWith('fema-') ? 'Live' : 'Sample';
    const capacity: 'Reported' | 'N/A' = 
      (shelter.capacityTotal !== null && shelter.capacityTotal > 0) ||
      (shelter.capacityUsed !== null && shelter.capacityUsed > 0)
        ? 'Reported'
        : 'N/A';
    return { locationStatus, capacity };
  },

  // Incident actions
  createIncidentFromAlert: (alertId: string) => {
    const state = get();
    const alert = [...state.nwsAlerts, ...state.sampleAlerts].find((a) => a.id === alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    // Check if incident already exists
    const existing = state.incidents.find((i) => i.sourceAlertId === alertId);
    if (existing) {
      return existing.id;
    }

    const incidentId = generateId();
    const now = new Date();
    const severityMap: Record<Alert['severity'], Incident['severity']> = {
      critical: 'critical',
      error: 'high',
      warning: 'medium',
      info: 'low',
    };

    const defaultRunbook: RunbookStep[] = [
      { id: generateId(), title: 'Verify alert scope & counties', status: 'todo' },
      { id: generateId(), title: 'Notify shelter coordinators in affected areas', status: 'todo' },
      { id: generateId(), title: 'Review open shelters list for affected counties', status: 'todo' },
      { id: generateId(), title: 'Prepare overflow site plan', status: 'todo' },
      { id: generateId(), title: 'Post update & next check-in time', status: 'todo' },
    ];

    const incident: Incident = {
      id: incidentId,
      title: `Weather Incident: ${alert.title} (${state.selectedState})`,
      severity: severityMap[alert.severity],
      status: 'open',
      createdAt: now,
      updatedAt: now,
      assignedTo: null,
      sourceAlertId: alertId,
      notes: [],
      auditTrail: [
        {
          id: generateId(),
          ts: now,
          actor: 'System',
          action: 'incident_created',
          details: `Created from alert: ${alert.title}`,
        },
      ],
      runbook: defaultRunbook,
    };

    set((prev) => ({
      incidents: [...prev.incidents, incident],
    }));

    // Record change event
    get().recordChangeEvent({
      kind: 'INCIDENT_CREATED',
      severity: incident.severity,
      title: `Incident created: ${incident.title}`,
      description: `Created from NWS alert`,
      entityType: 'incident',
      entityId: incidentId,
      link: `/incidents/${incidentId}`,
    });

    return incidentId;
  },

  assignIncident: (incidentId: string, assignee: string) => {
    const now = new Date();
    set((prev) => ({
      incidents: prev.incidents.map((inc) => {
        if (inc.id === incidentId) {
          const auditEntry: AuditEntry = {
            id: generateId(),
            ts: now,
            actor: assignee,
            action: 'incident_assigned',
            details: `Assigned to ${assignee}`,
          };
          return {
            ...inc,
            assignedTo: assignee,
            status: inc.status === 'open' ? 'investigating' : inc.status,
            updatedAt: now,
            auditTrail: [...inc.auditTrail, auditEntry],
          };
        }
        return inc;
      }),
    }));

    // Record change event
    get().recordChangeEvent({
      kind: 'INCIDENT_ASSIGNED',
      severity: 'medium',
      title: `Incident assigned to ${assignee}`,
      description: `Incident assigned`,
      entityType: 'incident',
      entityId: incidentId,
      link: `/incidents/${incidentId}`,
    });
  },

  addIncidentNote: (incidentId: string, text: string, author: string = 'You') => {
    const now = new Date();
    const note: Note = {
      id: generateId(),
      ts: now,
      author,
      text,
    };

    set((prev) => ({
      incidents: prev.incidents.map((inc) => {
        if (inc.id === incidentId) {
          const auditEntry: AuditEntry = {
            id: generateId(),
            ts: now,
            actor: author,
            action: 'note_added',
            details: `Added note: ${text.substring(0, 50)}...`,
          };
          return {
            ...inc,
            notes: [...inc.notes, note],
            updatedAt: now,
            auditTrail: [...inc.auditTrail, auditEntry],
          };
        }
        return inc;
      }),
    }));

    // Record change event
    get().recordChangeEvent({
      kind: 'NOTE_ADDED',
      severity: 'low',
      title: `Note added to incident`,
      description: `Note added`,
      entityType: 'incident',
      entityId: incidentId,
      link: `/incidents/${incidentId}`,
    });
  },

  updateRunbookStep: (incidentId: string, stepId: string, status: RunbookStep['status']) => {
    const now = new Date();
    set((prev) => ({
      incidents: prev.incidents.map((inc) => {
        if (inc.id === incidentId) {
          const auditEntry: AuditEntry = {
            id: generateId(),
            ts: now,
            actor: 'You',
            action: 'runbook_step_updated',
            details: `Updated step status to ${status}`,
          };
          return {
            ...inc,
            runbook: inc.runbook.map((step) =>
              step.id === stepId ? { ...step, status } : step
            ),
            updatedAt: now,
            auditTrail: [...inc.auditTrail, auditEntry],
          };
        }
        return inc;
      }),
    }));
  },

  closeIncident: (incidentId: string) => {
    const now = new Date();
    set((prev) => ({
      incidents: prev.incidents.map((inc) => {
        if (inc.id === incidentId) {
          const auditEntry: AuditEntry = {
            id: generateId(),
            ts: now,
            actor: 'You',
            action: 'incident_closed',
            details: 'Incident closed',
          };
          return {
            ...inc,
            status: 'closed',
            updatedAt: now,
            auditTrail: [...inc.auditTrail, auditEntry],
          };
        }
        return inc;
      }),
    }));

    // Record change event
    get().recordChangeEvent({
      kind: 'INCIDENT_CLOSED',
      severity: 'low',
      title: `Incident closed`,
      description: `Incident closed`,
      entityType: 'incident',
      entityId: incidentId,
      link: `/incidents/${incidentId}`,
    });
  },

  recordChangeEvent: (event: Omit<ChangeEvent, 'id' | 'ts'>) => {
    const changeEvent: ChangeEvent = {
      ...event,
      id: generateId(),
      ts: new Date().toISOString(),
    };
    set((prev) => ({
      activityLog: [changeEvent, ...prev.activityLog].slice(0, 50), // Keep last 50
    }));
  },
}));
