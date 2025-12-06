import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { config } from '../../config';
import { formatRelativeTimeShort } from '../../utils/time';
import { Badge } from '../ui/Badge';

const STATES = ['FL', 'TX', 'LA', 'NC', 'SC', 'GA', 'AL', 'MS'];

export function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { shelters } = useAppStore();
  const {
    theme,
    toggleTheme,
    liveDataEnabled,
    selectedState,
    nwsStatus,
    nwsLastFetchedAt,
    nwsError,
    nwsAlerts,
    femaStatus,
    femaLastFetchedAt,
    femaError,
    femaShelters,
    setLiveDataEnabled,
    setSelectedState,
    fetchAndMergeNwsAlerts,
    fetchFemaShelters,
  } = useAppStore();
  const nwsPollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const femaPollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Search for shelter by name or id
    const shelter = shelters.find(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    if (shelter) {
      navigate(`/shelters/${shelter.id}`);
      setSearchQuery('');
    }
  };

  // Unified polling effect for both NWS and FEMA
  useEffect(() => {
    if (liveDataEnabled) {
      // Initial fetches
      fetchAndMergeNwsAlerts();
      fetchFemaShelters();

      // Set up NWS polling interval
      nwsPollIntervalRef.current = setInterval(() => {
        fetchAndMergeNwsAlerts();
      }, config.NWS_POLL_INTERVAL_MS);

      // Set up FEMA polling interval
      femaPollIntervalRef.current = setInterval(() => {
        fetchFemaShelters();
      }, config.FEMA_POLL_INTERVAL_MS);

      return () => {
        if (nwsPollIntervalRef.current) {
          clearInterval(nwsPollIntervalRef.current);
          nwsPollIntervalRef.current = null;
        }
        if (femaPollIntervalRef.current) {
          clearInterval(femaPollIntervalRef.current);
          femaPollIntervalRef.current = null;
        }
      };
    } else {
      // Clear intervals when disabled
      if (nwsPollIntervalRef.current) {
        clearInterval(nwsPollIntervalRef.current);
        nwsPollIntervalRef.current = null;
      }
      if (femaPollIntervalRef.current) {
        clearInterval(femaPollIntervalRef.current);
        femaPollIntervalRef.current = null;
      }
    }
  }, [liveDataEnabled, selectedState, fetchAndMergeNwsAlerts, fetchFemaShelters]);

  // Get status text
  const getStatusText = () => {
    if (!liveDataEnabled) {
      return 'Sample mode';
    }

    const isLoading = nwsStatus === 'loading' || femaStatus === 'loading';
    const hasError = nwsStatus === 'error' || femaStatus === 'error';

    if (isLoading) {
      return 'Fetching live data...';
    }

    if (hasError) {
      return 'Live data error';
    }

    const nwsCount = nwsAlerts.length;
    const femaCount = femaShelters.length;
    const lastUpdated = nwsLastFetchedAt || femaLastFetchedAt;
    const timeText = lastUpdated ? formatRelativeTimeShort(lastUpdated) : '';

    return `NWS: ${nwsCount} • FEMA: ${femaCount}${timeText ? ` • Updated ${timeText}` : ''}`;
  };

  return (
    <nav className="bg-surface border-b border-border transition-colors duration-300 ease-out">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/overview" className="flex items-center">
              <span className="text-xl font-bold text-accent">ReliefOps</span>
            </Link>
            <div className="ml-8 flex items-center space-x-4">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shelters..."
                  className="px-4 py-2 border border-border bg-surface-2 text-text rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent transition-all duration-200 ease-out w-64 placeholder:text-text-muted"
                />
                <button
                  type="submit"
                  className="ml-2 px-4 py-2 bg-accent text-white rounded-md text-sm hover:bg-accent-hover transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="px-3 py-2 text-sm text-text hover:bg-surface-2 rounded-md transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Unified Live Data Toggle */}
            <div className="flex items-center space-x-2 border-r border-border pr-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={liveDataEnabled}
                  onChange={(e) => setLiveDataEnabled(e.target.checked)}
                  className="w-4 h-4 text-accent border-border rounded focus-visible:ring-accent/40 focus-visible:outline-none transition-all duration-200 ease-out"
                />
                <span className="text-sm font-medium text-text">Live Data</span>
              </label>
              {liveDataEnabled ? (
                <Badge variant="success">Live Mode</Badge>
              ) : (
                <Badge variant="default">Sample Mode</Badge>
              )}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                disabled={!liveDataEnabled}
                className={`px-2 py-1 border border-border bg-surface-2 text-text rounded text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all duration-200 ease-out ${
                  !liveDataEnabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <span
                className={`text-xs ${
                  nwsStatus === 'error' || femaStatus === 'error'
                    ? 'text-danger'
                    : 'text-text-muted'
                }`}
                title={
                  (nwsError || femaError) ? `NWS: ${nwsError || 'OK'} | FEMA: ${femaError || 'OK'}` : undefined
                }
              >
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
