import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { StatusPill } from '../components/ui/StatusPill';
import { Card } from '../components/ui/Card';
import { formatDistanceToNow } from 'date-fns';

export function Shelters() {
  const { liveDataEnabled, sampleShelters, femaShelters } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  // Switch data source based on mode
  const displayShelters = liveDataEnabled ? femaShelters : sampleShelters;

  // Read query params on mount
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'atRisk') {
      setStatusFilter('all');
    } else if (filter === 'capacity_gt_85') {
      setStatusFilter('all');
    }
  }, [searchParams]);

  const filteredShelters = displayShelters.filter((shelter) => {
    if (statusFilter !== 'all' && shelter.status !== statusFilter) return false;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        shelter.name.toLowerCase().includes(searchLower) ||
        (shelter.city && shelter.city.toLowerCase().includes(searchLower)) ||
        (shelter.state && shelter.state.toLowerCase().includes(searchLower)) ||
        (shelter.address && shelter.address.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Shelters</h1>
          <p className="mt-2 text-sm text-text-muted">
            {liveDataEnabled
              ? 'FEMA Open Shelters - Real-time data from FEMA ArcGIS service'
              : 'Sample data mode - Enable "Live Data" to see real FEMA shelters'}
          </p>
          {liveDataEnabled && (
            <p className="mt-1 text-xs text-text-muted italic">
              Location/status from FEMA • Capacity may be missing and will show N/A
            </p>
          )}
        </div>
      </div>

      {displayShelters.length === 0 && (
        <Card>
          <p className="text-sm text-text-muted">
            {liveDataEnabled
              ? 'No shelters found for the selected state'
              : 'No shelter data available'}
          </p>
        </Card>
      )}

      {displayShelters.length > 0 && (
        <>
          {/* Filters */}
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-surface-2 text-text rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all duration-200 ease-out"
                >
                  <option value="all">All</option>
                  <option value="operational">Operational</option>
                  <option value="at-capacity">At Capacity</option>
                  <option value="overflow">Overflow</option>
                  <option value="critical">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Search</label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Name, city, address..."
                  className="w-full px-3 py-2 border border-border bg-surface-2 text-text rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 placeholder:text-text-muted transition-all duration-200 ease-out"
                />
              </div>
            </div>
          </Card>

          {/* Table */}
          {filteredShelters.length === 0 ? (
            <Card>
              <p className="text-sm text-text-muted">No shelters match the filters</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <tbody className="bg-surface divide-y divide-border">
                  {filteredShelters.map((shelter) => {
                    const capacityPercent =
                      shelter.capacityTotal !== null && shelter.capacityTotal > 0
                        ? ((shelter.capacityUsed || 0) / shelter.capacityTotal) * 100
                        : null;
                    return (
                      <TableRow
                        key={shelter.id}
                        onClick={() => navigate(`/shelters/${shelter.id}`)}
                      >
                        <TableCell className="font-medium">{shelter.name}</TableCell>
                        <TableCell>{shelter.city || 'N/A'}</TableCell>
                        <TableCell>{shelter.state || 'N/A'}</TableCell>
                        <TableCell>
                          <StatusPill status={shelter.status} />
                        </TableCell>
                        <TableCell>
                          {capacityPercent !== null ? (
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    capacityPercent > 90
                                      ? 'bg-red-600'
                                      : capacityPercent > 70
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm">
                                {shelter.capacityUsed !== null
                                  ? `${shelter.capacityUsed}/${shelter.capacityTotal}`
                                  : `0/${shelter.capacityTotal}`}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-text-muted">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-text-muted">
                          {shelter.address || 'N/A'}
                        </TableCell>
                        <TableCell className="text-text-muted">
                          {formatDistanceToNow(shelter.lastUpdated, { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
