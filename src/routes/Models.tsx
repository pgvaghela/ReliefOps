import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { StatusPill } from '../components/ui/StatusPill';
import { Card } from '../components/ui/Card';
import { formatDistanceToNow } from 'date-fns';

export function Models() {
  const { models } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Model Registry</h1>
        <p className="mt-2 text-sm text-gray-600">Monitor ML model versions and performance</p>
      </div>

      {models.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500">No models found</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Last Trained</TableHead>
                <TableHead>MAE</TableHead>
                <TableHead>F1 Score</TableHead>
                <TableHead>Latency P95</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Drift Signals</TableHead>
              </TableRow>
            </TableHeader>
            <tbody className="bg-white divide-y divide-gray-200">
              {models.map((model) => (
                <TableRow key={model.id} onClick={() => navigate(`/models/${model.id}`)}>
                  <TableCell className="font-medium">{model.modelName}</TableCell>
                  <TableCell className="font-mono text-sm">{model.version}</TableCell>
                  <TableCell>
                    <StatusPill status={model.stage} />
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {formatDistanceToNow(model.lastTrainedAt, { addSuffix: true })}
                  </TableCell>
                  <TableCell>{model.metrics.mae.toFixed(2)}</TableCell>
                  <TableCell>{model.metrics.f1.toFixed(3)}</TableCell>
                  <TableCell>{model.metrics.latencyP95}ms</TableCell>
                  <TableCell>
                    {model.metrics.errorRate > 1 ? (
                      <span className="text-red-600 font-medium">
                        {model.metrics.errorRate.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-gray-600">{model.metrics.errorRate.toFixed(2)}%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {model.driftSignals.length > 0 ? (
                      <span className="text-red-600 font-medium">
                        {model.driftSignals.length} signal{model.driftSignals.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-gray-500">None</span>
                    )}
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

