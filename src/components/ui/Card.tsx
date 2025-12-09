import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-surface rounded-lg shadow-sm border border-border transition-all duration-200 ease-out ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
        </div>
      )}
      <div className={title ? 'p-6' : 'p-6'}>{children}</div>
    </div>
  );
}
