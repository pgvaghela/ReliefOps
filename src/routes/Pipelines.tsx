import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { StatusPill } from '../components/ui/StatusPill';
import { Card } from '../components/ui/Card';
import { formatDistanceToNow } from 'date-fns';

export function Pipelines() {
  const { pipelineRuns } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Filter based on query params
  const filterParam = searchParams.get('filter');
  let filteredRuns = pipelineRuns;

  if (filterParam === 'failed_or_stale') {
    filteredRuns = pipelineRuns.filter(
      (run) => run.status === 'failed' || run.freshnessLagMin > 60,
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pipeline Runs</h1>
        <p className="mt-2 text-sm text-gray-600">Monitor data pipeline execution and status</p>
      </div>

      {filteredRuns.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No pipeline runs found</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Pipeline</TableHead>
                <TableHead>Dataset</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Freshness Lag</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Started</TableHead>
              </TableRow>
            </TableHeader>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRuns.map((run) => (
                <TableRow key={run.id} onClick={() => navigate(`/pipelines/${run.id}`)}>
                  <TableCell className="font-mono text-sm">{run.id}</TableCell>
                  <TableCell className="font-medium">{run.pipelineName}</TableCell>
                  <TableCell>{run.datasetName}</TableCell>
                  <TableCell>
                    <StatusPill status={run.status} />
                  </TableCell>
                  <TableCell>{run.durationSec}s</TableCell>
                  <TableCell>{run.recordsProcessed.toLocaleString()}</TableCell>
                  <TableCell>
                    {run.freshnessLagMin > 60 ? (
                      <span className="text-red-600 font-medium">
                        {Math.floor(run.freshnessLagMin / 60)}h {run.freshnessLagMin % 60}m
                      </span>
                    ) : (
                      <span className="text-gray-600">{run.freshnessLagMin}m</span>
                    )}
                  </TableCell>
                  <TableCell>{run.owner}</TableCell>
                  <TableCell className="text-gray-500">
                    {formatDistanceToNow(run.startedAt, { addSuffix: true })}
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

