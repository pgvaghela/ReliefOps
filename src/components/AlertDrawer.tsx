import { Drawer } from './ui/Drawer';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import type { Alert } from '../types';
import { useAppStore } from '../store/useAppStore';
import { formatRelativeTime } from '../utils/time';

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
}

export function AlertDrawer({ isOpen, onClose, alert }: AlertDrawerProps) {
  const navigate = useNavigate();
  const { liveDataEnabled, createIncidentFromAlert, incidents } = useAppStore();

  if (!alert) return null;

  const isNwsAlert = alert.id.startsWith('nws-') || alert.sourceId === 'nws';
  const canCreateIncident = liveDataEnabled && isNwsAlert;
  const existingIncident = incidents.find((inc) => inc.sourceAlertId === alert.id);

  const handleCreateIncident = () => {
    try {
      const incidentId = createIncidentFromAlert(alert.id);
      onClose();
      navigate(`/incidents/${incidentId}`);
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
  };

  const handleViewIncident = () => {
    if (existingIncident) {
      onClose();
      navigate(`/incidents/${existingIncident.id}`);
    }
  };

  const severityLabel =
    alert.severity === 'critical'
      ? 'SEV-1'
      : alert.severity === 'error'
      ? 'SEV-2'
      : alert.severity === 'warning'
      ? 'SEV-3'
      : 'INFO';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Alert: ${alert.title}`} side="right">
      <div className="space-y-6">
        {/* Severity and Status */}
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              alert.severity === 'critical'
                ? 'error'
                : alert.severity === 'error'
                ? 'error'
                : 'warning'
            }
          >
            {severityLabel}
          </Badge>
          <Badge variant="info">{alert.sourceType}</Badge>
          {isNwsAlert && liveDataEnabled && <Badge variant="success">LIVE (NWS)</Badge>}
          {alert.acknowledgedAt && <Badge variant="success">Acknowledged</Badge>}
          {alert.resolvedAt && <Badge variant="success">Resolved</Badge>}
        </div>

        {/* Create Incident Button (for NWS alerts in live mode) */}
        {canCreateIncident && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
            {existingIncident ? (
              <div>
                <p className="text-sm text-text mb-2">
                  An incident has been created from this alert.
                </p>
                <Button variant="primary" size="sm" onClick={handleViewIncident} className="w-full">
                  View Incident
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-text mb-2">
                  Create a workflow incident to track response actions for this alert.
                </p>
                <Button variant="primary" size="sm" onClick={handleCreateIncident} className="w-full">
                  Create Incident
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Signal */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Signal</h3>
          <p className="text-sm text-text">{alert.signal}</p>
        </div>

        {/* Evidence */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Evidence</h3>
          <ul className="list-disc list-inside space-y-1">
            {alert.evidence.map((item, idx) => (
              <li key={idx} className="text-sm text-text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Impact */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Impact</h3>
          <p className="text-sm text-text">{alert.impact}</p>
        </div>

        {/* Suggested Actions */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Suggested Actions</h3>
          <div className="space-y-2">
            {alert.suggestedActions.map((action, idx) => (
              <Button key={idx} variant="secondary" size="sm" className="w-full text-left">
                {action}
              </Button>
            ))}
          </div>
        </div>

        {/* Related Entity Link - Skip for NWS alerts */}
        {alert.sourceId !== 'nws' && !isNwsAlert && (
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-text-muted mb-2">Related Entity</h3>
            <Link
              to={`/${alert.sourceType}s/${alert.sourceId}`}
              className="text-sm text-accent hover:text-accent-hover transition-colors duration-200 ease-out"
              onClick={onClose}
            >
              View {alert.sourceType} details →
            </Link>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-border pt-4 text-xs text-text-muted">
          <p>Created {formatRelativeTime(alert.createdAt)}</p>
          {alert.acknowledgedAt && <p>Acknowledged {formatRelativeTime(alert.acknowledgedAt)}</p>}
          {alert.resolvedAt && <p>Resolved {formatRelativeTime(alert.resolvedAt)}</p>}
        </div>
      </div>
    </Drawer>
  );
}
