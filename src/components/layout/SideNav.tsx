import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/overview', label: 'Overview', icon: '📊' },
  { path: '/shelters', label: 'Shelters', icon: '🏠' },
  { path: '/alerts', label: 'Alerts', icon: '🚨' },
  { path: '/incidents', label: 'Incidents', icon: '📋' },
  { path: '/case-study', label: 'Case Study', icon: '📖' },
];

export function SideNav() {
  const location = useLocation();

  return (
    <nav className="w-64 bg-surface-2 border-r border-border min-h-screen transition-colors duration-300 ease-out">
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out
                    ${
                      isActive
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'text-text-muted hover:bg-surface hover:text-text'
                    }
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
