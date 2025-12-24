import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

export function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { models } = useAppStore();

  const model = models.find((m) => m.id === id);

  if (!model) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="secondary" onClick={() => navigate('/models')}>
            ← Back to Models
          </Button>
        </div>
        <Card>
          <p className="text-sm text-gray-500">Model not found</p>
        </Card>
      </div>
    );
  }

  // Generate mock time series data for charts
  const latencyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    p50: model.metrics.latencyP50 + Math.random() * 20 - 10,
    p95: model.metrics.latencyP95 + Math.random() * 50 - 25,
  }));

  const errorRateData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    errorRate: Math.max(0, model.metrics.errorRate + Math.random() * 0.5 - 0.25),
  }));

  const offlineMetricData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    mae: model.metrics.mae + Math.random() * 2 - 1,
    f1: Math.max(0, Math.min(1, model.metrics.f1 + Math.random() * 0.1 - 0.05)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={() => navigate('/models')}>
            ← Back to Models
          </Button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{model.modelName}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Version {model.version} • {formatDistanceToNow(model.lastTrainedAt, { addSuffix: true })}
          </p>
        </div>
        <StatusPill status={model.stage} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-gray-600">MAE</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{model.metrics.mae.toFixed(2)}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-600">F1 Score</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{model.metrics.f1.toFixed(3)}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-600">Latency P50</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{model.metrics.latencyP50}ms</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-600">Error Rate</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {model.metrics.errorRate.toFixed(2)}%
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Latency (P50/P95)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="p50" stroke="#3b82f6" name="P50 (ms)" />
              <Line type="monotone" dataKey="p95" stroke="#ef4444" name="P95 (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Error Rate">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={errorRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="errorRate" stroke="#ef4444" name="Error Rate (%)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Offline Metric Trends">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={offlineMetricData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="mae"
              stroke="#3b82f6"
              name="MAE"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="f1"
              stroke="#10b981"
              name="F1 Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Drift Signals */}
      <Card title="Drift Signals">
        {model.driftSignals.length === 0 ? (
          <p className="text-sm text-gray-500">No drift signals detected</p>
        ) : (
          <div className="space-y-4">
            {model.driftSignals.map((signal, idx) => (
              <div
                key={idx}
                className={`border-l-4 ${
                  signal.severity === 'critical'
                    ? 'border-red-500'
                    : signal.severity === 'high'
                    ? 'border-orange-500'
                    : signal.severity === 'medium'
                    ? 'border-yellow-500'
                    : 'border-gray-500'
                } pl-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          signal.severity === 'critical'
                            ? 'error'
                            : signal.severity === 'high'
                            ? 'error'
                            : signal.severity === 'medium'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {signal.severity}
                      </Badge>
                      <span className="font-medium text-gray-900">{signal.featureName}</span>
                      <span className="text-sm text-gray-600">PSI: {signal.psi.toFixed(3)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{signal.note}</p>
                    <p className="mt-1 text-xs text-gray-500">Direction: {signal.direction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

