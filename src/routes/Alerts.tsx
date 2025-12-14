import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AlertDrawer } from '../components/AlertDrawer';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { formatRelativeTime } from '../utils/time';
import { useState } from 'react';
import type { Alert } from '../types';

export function Alerts() {
  const navigate = useNavigate();
  const {
    liveDataEnabled,
    selectedState,
    nwsAlerts,
    sampleAlerts,
    nwsStatus,
    nwsLastFetchedAt,
  } = useAppStore();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Switch data source based on mode
  const displayAlerts = liveDataEnabled ? nwsAlerts : sampleAlerts;

  const activeAlerts = displayAlerts.filter(
    (a) => !a.resolvedAt && (!a.snoozedUntil || new Date(a.snoozedUntil || 0) < new Date()),
  );

  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    const severityOrder: Record<string, number> = { critical: 0, error: 1, warning: 2, info: 3 };
    const aSeverity = severityOrder[a.severity] ?? 4;
    const bSeverity = severityOrder[b.severity] ?? 4;
    if (aSeverity !== bSeverity) {
      return aSeverity - bSeverity;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const getSeverityLabel = (severity: Alert['severity']) => {
    return severity === 'critical'
      ? 'SEV-1'
      : severity === 'error'
      ? 'SEV-2'
      : severity === 'warning'
      ? 'SEV-3'
      : 'INFO';
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Alerts</h1>
        <p className="mt-2 text-sm text-text-muted">
          {liveDataEnabled
            ? 'Live weather alerts from National Weather Service'
            : 'Sample alerts - Enable "Live Data" to see real NWS alerts'}
        </p>
      </div>

      {/* Data Source Badge */}
      <DataSourceBadge
        sourceName={liveDataEnabled ? 'NWS' : 'Sample'}
        lastFetchedAt={liveDataEnabled ? nwsLastFetchedAt : null}
        status={liveDataEnabled ? nwsStatus : 'ok'}
        count={activeAlerts.length}
      />

      {!liveDataEnabled ? (
        <Card>
          <div className="space-y-4">
            {sortedAlerts.length === 0 ? (
              <p className="text-sm text-text-muted">No active alerts</p>
            ) : (
              sortedAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className="w-full text-left border-l-4 border-danger pl-4 py-3 hover:bg-surface-2 rounded-r transition-all duration-200 ease-out"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          variant={
                            alert.severity === 'critical'
                              ? 'error'
                              : alert.severity === 'error'
                              ? 'error'
                              : 'warning'
                          }
                        >
                          {getSeverityLabel(alert.severity)}
                        </Badge>
                        <Badge variant="info">{alert.sourceType}</Badge>
                        <span className="font-medium text-text">{alert.title}</span>
                      </div>
                      <p className="text-sm text-text-muted mb-1">{alert.signal}</p>
                      <p className="text-xs text-text-muted">
                        Created {formatRelativeTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      ) : nwsStatus === 'loading' ? (
        <Card>
          <p className="text-sm text-text-muted">Fetching alerts...</p>
        </Card>
      ) : nwsStatus === 'error' ? (
        <Card>
          <p className="text-sm text-danger">Error fetching alerts. Please try again later.</p>
        </Card>
      ) : sortedAlerts.length === 0 ? (
        <Card>
          <p className="text-sm text-text-muted">
            No active alerts for {selectedState} right now.
          </p>
        </Card>
      ) : (
        <Card>
          <div className="space-y-4">
            {sortedAlerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className="w-full text-left border-l-4 border-accent pl-4 py-3 hover:bg-surface-2 rounded-r transition-all duration-200 ease-out"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant={
                          alert.severity === 'critical'
                            ? 'error'
                            : alert.severity === 'error'
                            ? 'error'
                            : 'warning'
                        }
                      >
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                      <Badge variant="success">LIVE (NWS)</Badge>
                      <span className="font-medium text-text">{alert.title}</span>
                    </div>
                    <p className="text-sm text-text-muted mb-1">{alert.signal}</p>
                    <p className="text-xs text-text-muted">
                      Created {formatRelativeTime(alert.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      <AlertDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedAlert(null);
        }}
        alert={selectedAlert}
      />
    </div>
  );
}
