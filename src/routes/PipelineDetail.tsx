import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { StatusPill } from '../components/ui/StatusPill';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatDistanceToNow } from 'date-fns';

export function PipelineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pipelineRuns, rerunPipeline } = useAppStore();
  const [showRerunModal, setShowRerunModal] = useState(false);
  const [rerunFromTask, setRerunFromTask] = useState<string | undefined>();

  const pipeline = pipelineRuns.find((p) => p.id === id);

  if (!pipeline) {
    return (
      <div className="space-y-6">
        <div>
          <Button variant="secondary" onClick={() => navigate('/pipelines')}>
            ← Back to Pipelines
          </Button>
        </div>
        <Card>
          <p className="text-sm text-gray-500">Pipeline run not found</p>
        </Card>
      </div>
    );
  }

  const failedTask = pipeline.tasks.find((t) => t.status === 'failed');

  const handleRerun = () => {
    if (rerunFromTask) {
      rerunPipeline(pipeline.id, rerunFromTask);
    } else {
      rerunPipeline(pipeline.id);
    }
    setShowRerunModal(false);
    setRerunFromTask(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={() => navigate('/pipelines')}>
            ← Back to Pipelines
          </Button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{pipeline.pipelineName}</h1>
          <p className="mt-2 text-sm text-gray-600">Run ID: {pipeline.id}</p>
        </div>
        <div className="flex items-center space-x-2">
          <StatusPill status={pipeline.status} />
          {pipeline.status === 'failed' && (
            <Button variant="primary" onClick={() => setShowRerunModal(true)}>
              Rerun from Failed Task
            </Button>
          )}
        </div>
      </div>

      {/* Run Info */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-gray-600">Status</p>
          <p className="mt-2">
            <StatusPill status={pipeline.status} />
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-600">Duration</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{pipeline.durationSec}s</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-600">Records Processed</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pipeline.recordsProcessed.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-gray-600">Freshness Lag</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pipeline.freshnessLagMin}m
          </p>
        </Card>
      </div>

      {/* Task List */}
      <Card title="Task Execution">
        <div className="space-y-3">
          {pipeline.tasks.map((task, idx) => (
            <div
              key={task.id}
              className={`p-4 border rounded-lg ${
                task.status === 'failed'
                  ? 'border-red-300 bg-red-50'
                  : task.status === 'success'
                  ? 'border-green-300 bg-green-50'
                  : task.status === 'running'
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">#{idx + 1}</span>
                  <span className="font-medium text-gray-900">{task.name}</span>
                  <StatusPill status={task.status} />
                  {task.retryCount > 0 && (
                    <span className="text-xs text-gray-500">(retry {task.retryCount})</span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {task.durationSec}s • {formatDistanceToNow(task.startedAt, { addSuffix: true })}
                </div>
              </div>
              {task.logs.length > 0 && (
                <div className="mt-3 bg-black text-green-400 font-mono text-xs p-3 rounded overflow-x-auto">
                  {task.logs.map((log, logIdx) => (
                    <div key={logIdx}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Retry Timeline */}
      {pipeline.tasks.some((t) => t.retryCount > 0) && (
        <Card title="Retry Timeline">
          <div className="space-y-2">
            {pipeline.tasks
              .filter((t) => t.retryCount > 0)
              .map((task) => (
                <div key={task.id} className="text-sm text-gray-600">
                  <span className="font-medium">{task.name}</span> retried {task.retryCount} time
                  {task.retryCount > 1 ? 's' : ''}
                </div>
              ))}
          </div>
        </Card>
      )}

      <Modal
        isOpen={showRerunModal}
        onClose={() => {
          setShowRerunModal(false);
          setRerunFromTask(undefined);
        }}
        title="Rerun Pipeline"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRerunModal(false);
                setRerunFromTask(undefined);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRerun}>
              Confirm Rerun
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will rerun the pipeline from the failed task. Are you sure?
          </p>
          {failedTask && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rerun from task:
              </label>
              <select
                value={rerunFromTask || failedTask.id}
                onChange={(e) => setRerunFromTask(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {pipeline.tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name} {task.status === 'failed' && '(failed)'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

