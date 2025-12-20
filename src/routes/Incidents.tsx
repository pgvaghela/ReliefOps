import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { StatusPill } from '../components/ui/StatusPill';
import { Card } from '../components/ui/Card';
import { formatDistanceToNow } from 'date-fns';

export function Incidents() {
  const navigate = useNavigate();
  const { incidents } = useAppStore();

  const sortedIncidents = [...incidents].sort((a, b) => {
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Incidents</h1>
        <p className="mt-2 text-sm text-gray-600">
          Workflow tracking for weather alerts and response actions
        </p>
      </div>

      {incidents.length === 0 ? (
        <Card>
          <p className="text-sm text-text-muted">
            No incidents yet. Create an incident from an NWS alert in live mode.
          </p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <tbody className="bg-surface divide-y divide-border">
              {sortedIncidents.map((incident) => (
                <TableRow
                  key={incident.id}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  className="cursor-pointer hover:bg-surface-2 transition-colors duration-200 ease-out"
                >
                  <TableCell className="font-medium">{incident.title}</TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell>
                    <StatusPill
                      status={
                        incident.status === 'open'
                          ? 'operational'
                          : incident.status === 'investigating'
                          ? 'at-capacity'
                          : 'critical'
                      }
                    />
                  </TableCell>
                  <TableCell>{incident.assignedTo || 'Unassigned'}</TableCell>
                  <TableCell className="text-text-muted">
                    {formatDistanceToNow(incident.updatedAt, { addSuffix: true })}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
}
