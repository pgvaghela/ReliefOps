import { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';
import { DisclaimerRibbon } from '../DisclaimerRibbon';
import { useAppStore } from '../../store/useAppStore';

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  const { liveDataEnabled } = useAppStore();

  return (
    <div className="min-h-screen bg-bg transition-colors duration-300 ease-out">
      <TopNav />
      {!liveDataEnabled && <DisclaimerRibbon />}
      <div className="flex">
        <SideNav />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
