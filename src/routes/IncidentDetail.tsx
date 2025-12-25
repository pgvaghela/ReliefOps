import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { StatusPill } from '../components/ui/StatusPill';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { formatRelativeTime, formatRelativeTimeShort } from '../utils/time';

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    incidents,
    nwsAlerts,
    sampleAlerts,
    assignIncident,
    addIncidentNote,
    updateRunbookStep,
    closeIncident,
  } = useAppStore();
  const [noteText, setNoteText] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'runbook' | 'notes' | 'audit'>('summary');

  const incident = incidents.find((i) => i.id === id);
  const allAlerts = [...nwsAlerts, ...sampleAlerts];
  const sourceAlert = incident?.sourceAlertId
    ? allAlerts.find((a) => a.id === incident.sourceAlertId)
    : null;

  if (!incident) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" onClick={() => navigate('/incidents')}>
          ← Back to Incidents
        </Button>
        <Card>
          <p className="text-sm text-text-muted">Incident not found</p>
        </Card>
      </div>
    );
  }

  const handleAssignToMe = () => {
    assignIncident(incident.id, 'You');
  };

  const handleAddNote = () => {
    if (noteText.trim()) {
      addIncidentNote(incident.id, noteText.trim());
      setNoteText('');
    }
  };

  const handleCloseIncident = () => {
    closeIncident(incident.id);
    setShowCloseModal(false);
    navigate('/incidents');
  };

  const getSeverityBadge = (severity: string) => {
    const variant =
      severity === 'critical'
        ? 'error'
        : severity === 'high'
        ? 'error'
        : severity === 'medium'
        ? 'warning'
        : 'default';
    return <Badge variant={variant}>{severity.toUpperCase()}</Badge>;
  };

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'runbook', label: 'Runbook' },
    { id: 'notes', label: 'Notes' },
    { id: 'audit', label: 'Audit Trail' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={() => navigate('/incidents')}>
            ← Back to Incidents
          </Button>
          <h1 className="mt-4 text-3xl font-bold text-text">{incident.title}</h1>
          <p className="mt-2 text-sm text-text-muted">
            Created {formatRelativeTime(incident.createdAt)} • Updated{' '}
            {formatRelativeTime(incident.updatedAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getSeverityBadge(incident.severity)}
          <StatusPill
            status={
              incident.status === 'open'
                ? 'operational'
                : incident.status === 'investigating'
                ? 'at-capacity'
                : 'critical'
            }
          />
        </div>
      </div>

      {/* Actions */}
      <Card>
        <div className="flex items-center space-x-2">
          {!incident.assignedTo && (
            <Button variant="primary" size="sm" onClick={handleAssignToMe}>
              Assign to Me
            </Button>
          )}
          {incident.status !== 'closed' && (
            <Button variant="secondary" size="sm" onClick={() => setShowCloseModal(true)}>
              Close Incident
            </Button>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)} />

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <Card title="Details">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-text-muted">Status</p>
                <p className="mt-1 text-sm text-text capitalize">{incident.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">Assigned To</p>
                <p className="mt-1 text-sm text-text">{incident.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">Severity</p>
                <p className="mt-1">{getSeverityBadge(incident.severity)}</p>
              </div>
            </div>
          </Card>

          {sourceAlert && (
            <Card title="Source Alert">
              <div className="space-y-2">
                <p className="text-sm font-medium text-text">{sourceAlert.title}</p>
                <p className="text-sm text-text-muted">{sourceAlert.signal}</p>
                <p className="text-xs text-text-muted">
                  Created {formatRelativeTime(sourceAlert.createdAt)}
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'runbook' && (
        <Card title="Runbook">
          <div className="space-y-3">
            {incident.runbook.map((step) => (
              <div
                key={step.id}
                className="flex items-center space-x-3 p-3 border border-border rounded-lg transition-all duration-200 ease-out"
              >
                <input
                  type="checkbox"
                  checked={step.status === 'done'}
                  onChange={(e) => {
                    const newStatus = e.target.checked ? 'done' : 'todo';
                    updateRunbookStep(incident.id, step.id, newStatus);
                  }}
                  className="w-4 h-4 text-accent border-border rounded focus-visible:ring-accent/40 focus-visible:outline-none transition-all duration-200 ease-out"
                />
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      step.status === 'done' ? 'line-through text-text-muted' : 'text-text'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                <Badge
                  variant={
                    step.status === 'done'
                      ? 'success'
                      : step.status === 'doing'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {step.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          <Card title="Add Note">
            <div className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 border border-border bg-surface-2 text-text rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 placeholder:text-text-muted transition-all duration-200 ease-out"
                rows={3}
              />
              <Button variant="primary" size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>
                Add Note
              </Button>
            </div>
          </Card>

          <Card title="Notes">
            {incident.notes.length === 0 ? (
              <p className="text-sm text-text-muted">No notes yet</p>
            ) : (
              <div className="space-y-4">
                {incident.notes
                  .sort((a, b) => b.ts.getTime() - a.ts.getTime())
                  .map((note) => (
                    <div key={note.id} className="border-l-4 border-accent pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-text">{note.author}</p>
                        <p className="text-xs text-text-muted">{formatRelativeTimeShort(note.ts)}</p>
                      </div>
                      <p className="text-sm text-text-muted">{note.text}</p>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'audit' && (
        <Card title="Audit Trail">
          {incident.auditTrail.length === 0 ? (
            <p className="text-sm text-text-muted">No audit entries yet</p>
          ) : (
            <div className="space-y-3">
              {incident.auditTrail
                .sort((a, b) => b.ts.getTime() - a.ts.getTime())
                .map((entry) => (
                  <div key={entry.id} className="border-l-4 border-border pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-text">{entry.actor}</p>
                      <p className="text-xs text-text-muted">{formatRelativeTimeShort(entry.ts)}</p>
                    </div>
                    <p className="text-sm text-text-muted">{entry.action}</p>
                    {entry.details && (
                      <p className="text-xs text-text-muted mt-1">{entry.details}</p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}

      {/* Close Confirmation Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Incident"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Are you sure you want to close this incident? This action will be recorded in the audit trail.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setShowCloseModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCloseIncident}>
              Close Incident
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
