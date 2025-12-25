import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { AlertDrawer } from '../components/AlertDrawer';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { formatRelativeTime, formatRelativeTimeShort } from '../utils/time';
import type { Alert } from '../types';

export function Overview() {
  const navigate = useNavigate();
  const {
    liveDataEnabled,
    selectedState,
    sampleShelters,
    sampleAlerts,
    nwsAlerts,
    nwsStatus,
    nwsLastFetchedAt,
    femaShelters,
    femaStatus,
    femaLastFetchedAt,
    activityLog,
  } = useAppStore();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Switch data source based on mode
  const displayShelters = liveDataEnabled ? femaShelters : sampleShelters;
  const displayAlerts = liveDataEnabled ? nwsAlerts : sampleAlerts;

  // Filter active alerts
  const activeAlerts = displayAlerts.filter(
    (a) => !a.resolvedAt && (!a.snoozedUntil || new Date(a.snoozedUntil) < new Date()),
  );

  // Sort alerts by severity
  const sortedAlerts = [...activeAlerts].sort((a, b) => {
    const severityOrder: Record<string, number> = { critical: 0, error: 1, warning: 2, info: 3 };
    const aSeverity = severityOrder[a.severity] ?? 4;
    const bSeverity = severityOrder[b.severity] ?? 4;
    if (aSeverity !== bSeverity) {
      return aSeverity - bSeverity;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // Shelter stats
  const openShelters = displayShelters.filter((s) => s.status === 'operational');
  const closedShelters = displayShelters.filter((s) => s.status === 'critical');
  
  // Calculate capacity stats only if data is available
  const sheltersWithCapacity = displayShelters.filter(
    (s) => s.capacityTotal !== null && s.capacityTotal > 0,
  );
  const totalCapacity = sheltersWithCapacity.reduce((sum, s) => sum + (s.capacityTotal || 0), 0);
  const totalUsed = sheltersWithCapacity.reduce((sum, s) => sum + (s.capacityUsed || 0), 0);
  const capacityPercent = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : null;

  // Alerts by severity
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical').length;
  const errorAlerts = activeAlerts.filter((a) => a.severity === 'error').length;
  const warningAlerts = activeAlerts.filter((a) => a.severity === 'warning').length;

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDrawerOpen(true);
  };

  const getSeverityLabel = (severity: Alert['severity']) => {
    return severity === 'critical'
      ? 'SEV-1'
      : severity === 'error'
      ? 'SEV-2'
      : severity === 'warning'
      ? 'SEV-3'
      : 'INFO';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Mission Control Dashboard</h1>
        <p className="mt-2 text-sm text-text-muted">Real-time monitoring of hurricane response operations</p>
        <p className="mt-1 text-xs text-text-muted italic">
          {liveDataEnabled
            ? 'Live mode uses public FEMA shelter locations/status and NWS alerts. Some metrics may be unavailable and shown as N/A.'
            : 'Sample mode uses simulated data for demonstration. Enable "Live Data" to use FEMA + NWS feeds.'}
        </p>
      </div>

      {/* Data Sources */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DataSourceBadge
          sourceName={liveDataEnabled ? 'FEMA' : 'Sample'}
          lastFetchedAt={liveDataEnabled ? femaLastFetchedAt : null}
          status={liveDataEnabled ? femaStatus : 'ok'}
          count={displayShelters.length}
          coverage={
            liveDataEnabled
              ? 'Location/Status: Live • Capacity: N/A'
              : 'Location/Status: Sample • Capacity: Reported'
          }
        />
        <DataSourceBadge
          sourceName={liveDataEnabled ? 'NWS' : 'Sample'}
          lastFetchedAt={liveDataEnabled ? nwsLastFetchedAt : null}
          status={liveDataEnabled ? nwsStatus : 'ok'}
          count={activeAlerts.length}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Shelters Card */}
        <Card>
          <button
            onClick={() => navigate('/shelters')}
            className="w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">
                  {liveDataEnabled ? 'FEMA Shelters' : 'Shelters'}
                </p>
                <p className="mt-2 text-3xl font-semibold text-text">{displayShelters.length}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {openShelters.length} open • {closedShelters.length} closed
                </p>
              </div>
              <div className="p-3 bg-accent/20 rounded-full">
                <span className="text-2xl">🏠</span>
              </div>
            </div>
          </button>
        </Card>

        {/* Capacity Card */}
        {capacityPercent !== null && sheltersWithCapacity.length > 0 ? (
          <Card>
            <button
              onClick={() => navigate('/shelters')}
              className="w-full text-left hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted">Capacity (with data)</p>
                  <p className="mt-2 text-3xl font-semibold text-text">
                    {Math.round(capacityPercent)}%
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    {totalUsed.toLocaleString()} / {totalCapacity.toLocaleString()} people
                  </p>
                </div>
                <div className="p-3 bg-success/20 rounded-full">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </button>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">Capacity</p>
                <p className="mt-2 text-3xl font-semibold text-text">N/A</p>
                <p className="mt-1 text-sm text-text-muted">
                  {liveDataEnabled
                    ? 'Capacity data not provided by FEMA'
                    : 'Sample data mode'}
                </p>
              </div>
              <div className="p-3 bg-surface-2 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </Card>
        )}

        {/* Alerts Card */}
        <Card>
          <button
            onClick={() => navigate('/alerts')}
            className="w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-muted">
                  {liveDataEnabled ? 'NWS Alerts' : 'Alerts'}
                </p>
                <p className="mt-2 text-3xl font-semibold text-text">{activeAlerts.length}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {criticalAlerts} critical • {errorAlerts} error • {warningAlerts} warning
                </p>
              </div>
              <div className="p-3 bg-danger/20 rounded-full">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </button>
        </Card>

        {/* Data Sources Status Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Data Mode</p>
              <p className="mt-2 text-sm text-text">
                {liveDataEnabled ? (
                  <>
                    {femaStatus === 'ok' ? '✓ FEMA' : femaStatus === 'loading' ? '⏳ FEMA' : '○ FEMA'}
                    {' • '}
                    {nwsStatus === 'ok' ? '✓ NWS' : nwsStatus === 'loading' ? '⏳ NWS' : '○ NWS'}
                  </>
                ) : (
                  'Sample Data'
                )}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {liveDataEnabled ? `State: ${selectedState}` : 'Toggle Live Data to enable'}
              </p>
            </div>
            <div className="p-3 bg-warning/20 rounded-full">
              <span className="text-2xl">⚙️</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Shelters Panel */}
      {displayShelters.length > 0 && (
        <Card title={liveDataEnabled ? 'Live FEMA Shelters' : 'Shelters'}>
          <div className="space-y-3">
            {displayShelters.slice(0, 5).map((shelter) => (
              <button
                key={shelter.id}
                onClick={() => navigate(`/shelters/${shelter.id}`)}
                className="w-full text-left block p-4 border border-border rounded-lg hover:bg-surface-2 transition-all duration-200 ease-out"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text">{shelter.name}</p>
                    <p className="text-sm text-text-muted">
                      {shelter.city || shelter.county || 'N/A'}, {shelter.state || 'N/A'}
                    </p>
                    {shelter.address && (
                      <p className="text-xs text-text-muted mt-1">{shelter.address}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <StatusPill status={shelter.status} />
                    {shelter.capacityTotal !== null && shelter.capacityTotal > 0 ? (
                      <p className="mt-1 text-sm text-text-muted">
                        {shelter.capacityUsed !== null
                          ? `${shelter.capacityUsed}/${shelter.capacityTotal}`
                          : `0/${shelter.capacityTotal}`}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-text-muted">Capacity: N/A</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {displayShelters.length > 5 && (
              <button
                onClick={() => navigate('/shelters')}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                View all {displayShelters.length} shelters →
              </button>
            )}
          </div>
          {liveDataEnabled && sheltersWithCapacity.length === 0 && (
            <p className="mt-4 text-xs text-text-muted italic">
              Capacity data not provided by FEMA; showing status only.
            </p>
          )}
        </Card>
      )}

      {/* Alerts */}
      <Card title={liveDataEnabled ? 'Live NWS Alerts' : 'Alerts'}>
        {!liveDataEnabled ? (
          <div className="space-y-3">
            {sortedAlerts.length === 0 ? (
              <p className="text-sm text-text-muted">No active alerts</p>
            ) : (
              sortedAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className="w-full text-left border-l-4 border-danger pl-4 py-2 hover:bg-surface-2 rounded-r transition-all duration-200 ease-out"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
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
                          {getSeverityLabel(alert.severity)}
                        </Badge>
                        <Badge variant="info">{alert.sourceType}</Badge>
                        <span className="font-medium text-text">{alert.title}</span>
                      </div>
                      <p className="mt-1 text-sm text-text-muted">{alert.signal}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        Created {formatRelativeTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : nwsStatus === 'loading' ? (
          <p className="text-sm text-text-muted">Fetching NWS alerts...</p>
        ) : nwsStatus === 'error' ? (
          <p className="text-sm text-danger">Error fetching NWS alerts</p>
        ) : sortedAlerts.length === 0 ? (
          <p className="text-sm text-text-muted">
            No active NWS alerts for {selectedState} right now.
            {nwsLastFetchedAt && (
              <span className="text-xs text-text-muted block mt-1">
                Last updated: {formatRelativeTimeShort(nwsLastFetchedAt)}
              </span>
            )}
          </p>
        ) : (
          <div className="space-y-3">
            {sortedAlerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                  className="w-full text-left border-l-4 border-accent pl-4 py-2 hover:bg-surface-2 rounded-r transition-all duration-200 ease-out"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
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
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                      <Badge variant="success">LIVE (NWS)</Badge>
                      <span className="font-medium text-text">{alert.title}</span>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">{alert.signal}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Created {formatRelativeTime(alert.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            {nwsLastFetchedAt && (
              <p className="text-xs text-text-muted mt-2">
                Last updated: {formatRelativeTimeShort(nwsLastFetchedAt)}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Top Changes */}
      {activityLog.length > 0 && (
        <Card title="Top Changes">
          <div className="space-y-3">
            {activityLog.slice(0, 5).map((event) => (
              <button
                key={event.id}
                onClick={() => navigate(event.link)}
                  className="w-full text-left border-l-4 border-accent pl-4 py-2 hover:bg-surface-2 rounded-r transition-all duration-200 ease-out"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          event.severity === 'critical'
                            ? 'error'
                            : event.severity === 'high'
                            ? 'error'
                            : event.severity === 'medium'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {event.kind}
                      </Badge>
                      <span className="font-medium text-text">{event.title}</span>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">{event.description}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {formatRelativeTimeShort(event.ts)}
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
