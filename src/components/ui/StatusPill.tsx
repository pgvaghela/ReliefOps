interface StatusPillProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  operational: { bg: 'bg-success/20', text: 'text-success border border-success/30' },
  'at-capacity': { bg: 'bg-warning/20', text: 'text-warning border border-warning/30' },
  overflow: { bg: 'bg-warning/20', text: 'text-warning border border-warning/30' },
  critical: { bg: 'bg-danger/20', text: 'text-danger border border-danger/30' },
  success: { bg: 'bg-success/20', text: 'text-success border border-success/30' },
  running: { bg: 'bg-accent/20', text: 'text-accent border border-accent/30' },
  failed: { bg: 'bg-danger/20', text: 'text-danger border border-danger/30' },
  cancelled: { bg: 'bg-surface-2', text: 'text-text-muted' },
  open: { bg: 'bg-danger/20', text: 'text-danger border border-danger/30' },
  investigating: { bg: 'bg-warning/20', text: 'text-warning border border-warning/30' },
  resolved: { bg: 'bg-success/20', text: 'text-success border border-success/30' },
  closed: { bg: 'bg-surface-2', text: 'text-text-muted' },
  staging: { bg: 'bg-surface-2', text: 'text-text-muted' },
  canary: { bg: 'bg-accent/20', text: 'text-accent border border-accent/30' },
  prod: { bg: 'bg-success/20', text: 'text-success border border-success/30' },
};

export function StatusPill({ status, className = '' }: StatusPillProps) {
  const colors = statusColors[status.toLowerCase()] || { bg: 'bg-surface-2', text: 'text-text-muted' };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ease-out ${colors.bg} ${colors.text} ${className}`}
    >
      {status}
    </span>
  );
}
