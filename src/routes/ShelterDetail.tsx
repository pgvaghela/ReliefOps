import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { formatRelativeTimeShort } from '../utils/time';

export function ShelterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { shelters, liveDataEnabled, femaLastFetchedAt, getShelterDataCoverage } = useAppStore();

  const shelter = shelters.find((s) => s.id === id);

  if (!shelter) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="secondary" onClick={() => navigate('/shelters')}>
            ← Back to Shelters
          </Button>
        </div>
        <Card>
          <p className="text-sm text-text-muted">Shelter not found</p>
        </Card>
      </div>
    );
  }

  const capacityPercent =
    shelter.capacityTotal !== null && shelter.capacityTotal > 0
      ? ((shelter.capacityUsed || 0) / shelter.capacityTotal) * 100
      : null;

  const isFemaShelter = shelter.id.startsWith('fema-');

  // Google Maps link
  const mapsUrl = `https://www.google.com/maps?q=${shelter.lat},${shelter.lon}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={() => navigate('/shelters')}>
            ← Back to Shelters
          </Button>
          <h1 className="mt-4 text-3xl font-bold text-text">{shelter.name}</h1>
          <p className="mt-2 text-sm text-text-muted">
            {shelter.city || 'N/A'}, {shelter.state || 'N/A'}
            {shelter.zip && ` ${shelter.zip}`}
          </p>
        </div>
        <StatusPill status={shelter.status} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-text-muted">Capacity</p>
          {capacityPercent !== null ? (
            <>
              <p className="mt-2 text-3xl font-semibold text-text">
                {shelter.capacityUsed !== null ? shelter.capacityUsed : 0} /{' '}
                {shelter.capacityTotal}
              </p>
              <p className="mt-1 text-sm text-text-muted">{Math.round(capacityPercent)}% utilized</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-3xl font-semibold text-text">N/A</p>
              <p className="mt-1 text-sm text-text-muted">Capacity data not available</p>
            </>
          )}
        </Card>
        <Card>
          <p className="text-sm font-medium text-text-muted">Location</p>
          <p className="mt-2 text-sm text-text">
            {shelter.lat.toFixed(4)}, {shelter.lon.toFixed(4)}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-sm text-blue-600 hover:text-blue-800"
          >
            Open in Maps →
          </a>
        </Card>
        <Card>
          <p className="text-sm font-medium text-text-muted">Status</p>
          <p className="mt-2">
            <StatusPill status={shelter.status} />
          </p>
          {shelter.shelterStatus && (
            <p className="mt-1 text-xs text-text-muted">FEMA: {shelter.shelterStatus}</p>
          )}
        </Card>
      </div>

      {/* Address */}
      {shelter.address && (
        <Card title="Address">
          <p className="text-sm text-text">{shelter.address}</p>
          {shelter.city && shelter.state && (
            <p className="mt-1 text-sm text-text-muted">
              {shelter.city}, {shelter.state} {shelter.zip || ''}
            </p>
          )}
        </Card>
      )}

      {/* Utilities - Only show if data available */}
      {(shelter.hasPower !== null || shelter.hasWater !== null || shelter.medicalLevel !== null) && (
        <Card title="Utilities & Services">
          <div className="flex space-x-2">
            {shelter.hasPower !== null && (
              shelter.hasPower ? (
                <Badge variant="success">Power</Badge>
              ) : (
                <Badge variant="error">No Power</Badge>
              )
            )}
            {shelter.hasWater !== null && (
              shelter.hasWater ? (
                <Badge variant="success">Water</Badge>
              ) : (
                <Badge variant="error">No Water</Badge>
              )
            )}
            {shelter.medicalLevel !== null && (
              <Badge variant="info">{shelter.medicalLevel}</Badge>
            )}
          </div>
        </Card>
      )}

      {/* Supplies - Only show if data available */}
      {shelter.supplies.water !== null ||
      shelter.supplies.food !== null ||
      shelter.supplies.meds !== null ||
      shelter.supplies.fuel !== null ? (
        <Card title="Supplies">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-text-muted">Water</p>
              <p className="mt-1 text-lg font-semibold">
                {shelter.supplies.water !== null ? `${shelter.supplies.water} gal` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Food</p>
              <p className="mt-1 text-lg font-semibold">
                {shelter.supplies.food !== null ? `${shelter.supplies.food} meals` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Medical</p>
              <p className="mt-1 text-lg font-semibold">
                {shelter.supplies.meds !== null ? `${shelter.supplies.meds} units` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Fuel</p>
              <p className="mt-1 text-lg font-semibold">
                {shelter.supplies.fuel !== null ? `${shelter.supplies.fuel} gal` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Supplies">
          <p className="text-sm text-text-muted">
            Supply data not available from FEMA. This information is not provided in the public dataset.
          </p>
        </Card>
      )}

      {/* Intake Trend - Only show if data available */}
      {shelter.intakePerHour.length > 0 ? (
        <Card title="Intake Trend">
          <p className="text-sm text-text-muted">
            Intake data: {shelter.intakePerHour.filter((v) => v > 0).length} hours with data
          </p>
        </Card>
      ) : (
        <Card title="Intake Trend">
          <p className="text-sm text-text-muted">
            Intake trend data not available from FEMA. This information is not provided in the public dataset.
          </p>
        </Card>
      )}

      {/* Issues Log */}
      {shelter.issues.length > 0 ? (
        <Card title="Issues Log">
          <div className="space-y-3">
            {shelter.issues.map((issue) => (
              <div key={issue.id} className="border-l-4 border-warning pl-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          issue.severity === 'critical'
                            ? 'error'
                            : issue.severity === 'high'
                            ? 'error'
                            : issue.severity === 'medium'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {issue.severity}
                      </Badge>
                      <span className="font-medium text-text">{issue.type}</span>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">{issue.description}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      Reported {formatDistanceToNow(issue.reportedAt, { addSuffix: true })}
                    </p>
                  </div>
                  {issue.resolvedAt && <Badge variant="success">Resolved</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card title="Issues Log">
          <p className="text-sm text-text-muted">No issues reported</p>
        </Card>
      )}

      {/* Data Source Info */}
      <Card title="Data Sources">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-text-muted">Source</p>
            <p className="mt-1 text-sm text-text">
              {liveDataEnabled && isFemaShelter
                ? 'FEMA Open Shelters'
                : 'Sample Data'}
            </p>
          </div>
          {liveDataEnabled && isFemaShelter && femaLastFetchedAt && (
            <div>
              <p className="text-sm font-medium text-text-muted">Last Fetched</p>
              <p className="mt-1 text-sm text-text">
                {formatRelativeTimeShort(femaLastFetchedAt)}
              </p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-text-muted">Coverage</p>
            <p className="mt-1 text-sm text-text">
              Location/Status: {getShelterDataCoverage(shelter).locationStatus} • Capacity:{' '}
              {getShelterDataCoverage(shelter).capacity}
            </p>
            <p className="mt-2 text-xs text-text-muted italic">
              {liveDataEnabled && isFemaShelter
                ? 'FEMA provides location and status data. Capacity, supplies, and intake metrics are not available in the public dataset and are shown as N/A.'
                : 'Sample data includes all fields for demonstration purposes.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
