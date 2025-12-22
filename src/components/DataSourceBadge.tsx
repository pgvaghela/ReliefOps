import { Badge } from './ui/Badge';
import { StatusPill } from './ui/StatusPill';
import { formatRelativeTimeShort } from '../utils/time';

interface DataSourceBadgeProps {
  sourceName: 'FEMA' | 'NWS' | 'Sample';
  lastFetchedAt: string | null;
  status: 'idle' | 'loading' | 'ok' | 'error';
  count?: number;
  coverage?: string;
}

export function DataSourceBadge({
  sourceName,
  lastFetchedAt,
  status,
  count,
  coverage,
}: DataSourceBadgeProps) {
  const statusMap: Record<string, 'operational' | 'critical' | 'at-capacity' | 'overflow'> = {
    ok: 'operational',
    loading: 'at-capacity',
    error: 'critical',
    idle: 'at-capacity',
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-surface border border-border rounded-lg transition-all duration-200 ease-out">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm font-medium text-text">{sourceName}</span>
          <StatusPill status={statusMap[status]} />
        </div>
        {lastFetchedAt && status === 'ok' && (
          <p className="text-xs text-text-muted">
            Updated {formatRelativeTimeShort(lastFetchedAt)}
          </p>
        )}
        {status === 'loading' && <p className="text-xs text-text-muted">Fetching...</p>}
        {status === 'error' && <p className="text-xs text-danger">Error</p>}
        {count !== undefined && status === 'ok' && (
          <p className="text-xs text-text mt-1">{count} {sourceName === 'FEMA' ? 'shelters' : 'alerts'}</p>
        )}
        {coverage && (
          <p className="text-xs text-text-muted mt-1">{coverage}</p>
        )}
      </div>
    </div>
  );
}
