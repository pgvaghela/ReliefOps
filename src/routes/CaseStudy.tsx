import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';

interface ScreenshotImageProps {
  src: string;
  alt: string;
}

function ScreenshotImage({ src, alt }: ScreenshotImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="bg-surface-2 border border-border rounded-lg p-8 flex items-center justify-center min-h-[200px]">
        <p className="text-text-muted text-sm">Screenshot: {alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-auto"
      onError={() => setImageError(true)}
    />
  );
}

export function CaseStudy() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-text mb-2">ReliefOps Case Study</h1>
        <p className="text-lg text-text-muted">
          A real-time hurricane response monitoring console for disaster relief operations
        </p>
      </div>

      {/* Overview */}
      <Card title="Overview">
        <div className="space-y-4 text-text">
          <p>
            ReliefOps is a mission-critical operations console designed for US hurricane response
            coordination. It aggregates real-time data from public sources (FEMA Open Shelters and
            National Weather Service alerts) to provide emergency managers with a unified view of
            shelter status, weather threats, and incident workflows.
          </p>
          <p>
            The interface prioritizes clarity, trust, and actionability—surfacing what changed,
            why it matters, and what to do next. Every action creates an audit trail, and data
            provenance is explicit throughout.
          </p>
        </div>
      </Card>

      {/* Users + Context */}
      <Card title="Users & Context">
        <div className="space-y-4 text-text">
          <p>
            <strong>Primary users:</strong> Emergency operations center (EOC) coordinators, FEMA
            regional staff, and state emergency management personnel during active hurricane events.
          </p>
          <p>
            <strong>Context:</strong> During hurricane landfall, coordinators need to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-text-muted">
            <li>Monitor which shelters are open and their capacity status</li>
            <li>Track active weather alerts and their geographic scope</li>
            <li>Create and assign incident workflows with runbooks</li>
            <li>Maintain an audit trail of decisions and actions</li>
            <li>Understand data gaps (what's available vs. what's not)</li>
          </ul>
          <p>
            <strong>Critical constraint:</strong> Public data sources (FEMA, NWS) provide location
            and status, but not real-time occupancy, supplies, or intake rates. The UI must clearly
            indicate when data is live vs. sample, and when fields are unavailable (shown as N/A).
          </p>
        </div>
      </Card>

      {/* Workflow */}
      <Card title="Workflow: Detect → Triage → Diagnose → Act → Audit">
        <div className="space-y-6">
          {/* Workflow Steps */}
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex-1 min-w-[150px]">
              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="info">1</Badge>
                  <h3 className="font-semibold text-text">Detect</h3>
                </div>
                <p className="text-sm text-text-muted">
                  Live NWS alerts and FEMA shelter status updates appear in real-time. Data source
                  badges show provenance and last fetch time.
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="info">2</Badge>
                  <h3 className="font-semibold text-text">Triage</h3>
                </div>
                <p className="text-sm text-text-muted">
                  Overview dashboard surfaces "Top Changes" feed and clickable metrics. Alert
                  drawer explains Signal → Evidence → Impact with suggested actions.
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="info">3</Badge>
                  <h3 className="font-semibold text-text">Diagnose</h3>
                </div>
                <p className="text-sm text-text-muted">
                  Shelter detail pages show available data (location, status) and explicitly mark
                  unavailable fields (capacity, supplies) as N/A with coverage indicators.
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="info">4</Badge>
                  <h3 className="font-semibold text-text">Act</h3>
                </div>
                <p className="text-sm text-text-muted">
                  Create incidents from alerts, assign to team members, execute runbook checklists,
                  add notes, and close incidents. All actions are audited.
                </p>
              </div>
            </div>
            <div className="flex-1 min-w-[150px]">
              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="info">5</Badge>
                  <h3 className="font-semibold text-text">Audit</h3>
                </div>
                <p className="text-sm text-text-muted">
                  Every action (create, assign, note, close) generates an audit entry with actor,
                  timestamp, action, and details. Incident detail page shows full audit trail.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Screens */}
      <Card title="Key Screens">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
              <ScreenshotImage src="/screenshots/overview.png" alt="Overview Dashboard" />
            </div>
            <p className="text-sm text-text-muted">
              Mission control dashboard with live data sources, clickable metrics, Top Changes feed,
              and split alert sections (Operational + Live NWS).
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
              <ScreenshotImage src="/screenshots/shelters.png" alt="Shelters List" />
            </div>
            <p className="text-sm text-text-muted">
              FEMA shelters table with status filters, data source indicators, and drill-down to
              detail pages showing coverage (Location/Status: Live • Capacity: N/A).
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
              <ScreenshotImage src="/screenshots/alert-drawer.png" alt="Alert Drawer" />
            </div>
            <p className="text-sm text-text-muted">
              Explainable alert with Signal → Evidence → Impact → Suggested Actions. "Create
              Incident" CTA for NWS alerts in live mode.
            </p>
          </div>
          <div className="space-y-2">
            <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
              <ScreenshotImage src="/screenshots/incident-detail.png" alt="Incident Detail" />
            </div>
            <p className="text-sm text-text-muted">
              Incident workflow with tabs: Summary (linked alert), Runbook (checklist), Notes (add
              note input), Audit Trail (reverse chronological). Actions: "Assign to me", "Close
              incident".
            </p>
          </div>
        </div>
      </Card>

      {/* Design Decisions */}
      <Card title="Design Decisions & Tradeoffs">
        <div className="space-y-3 text-text">
          <div>
            <p>
              <strong>1. Unified "Live Data" toggle vs. separate toggles:</strong> Single toggle
              reduces cognitive load and ensures NWS + FEMA stay in sync. Tradeoff: less granular
              control, but aligns with real-world usage (you want both or neither).
            </p>
          </div>
          <div>
            <p>
              <strong>2. Sample mode with rolling disclaimer:</strong> Allows demo without API
              dependencies, but disclaimer must be prominent (red ribbon, slow scroll) to prevent
              confusion. Tradeoff: slightly intrusive, but necessary for trust.
            </p>
          </div>
          <div>
            <p>
              <strong>3. Explicit N/A fields vs. hiding unavailable data:</strong> Showing N/A
              fields (capacity, supplies) maintains UI consistency and sets expectations. Tradeoff:
              more visual clutter, but builds trust by being transparent about data gaps.
            </p>
          </div>
          <div>
            <p>
              <strong>4. Incident workflow as local state (not fake telemetry):</strong> Incidents
              are user-created workflow artifacts, not simulated operational data. This keeps the
              app honest—real data sources (FEMA/NWS) are clearly separated from workflow tracking.
            </p>
          </div>
          <div>
            <p>
              <strong>5. Dark theme with true black background:</strong> Palantir-style aesthetic
              reduces eye strain for long monitoring sessions. Smooth transitions (respecting
              prefers-reduced-motion) make theme switching feel polished. Tradeoff: requires careful
              contrast management, but improves readability in low-light EOC environments.
            </p>
          </div>
        </div>
      </Card>

      {/* Data Trust Model */}
      <Card title="Data Trust Model">
        <div className="space-y-4 text-text">
          <p>
            <strong>Live Data Mode:</strong> When enabled, the app fetches real-time data from:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-text-muted">
            <li>
              <strong>FEMA Open Shelters:</strong> ArcGIS Feature Layer providing shelter name,
              location (lat/lon), city, state, address, and status (OPEN/CLOSED). Polled every 10
              minutes. <em>Does not provide:</em> capacity, occupancy, supplies, intake rates.
            </li>
            <li>
              <strong>NWS Alerts:</strong> api.weather.gov active alerts for selected state.
              Provides event type, severity, urgency, area description, and timestamps. Polled every
              2 minutes. <em>Does not provide:</em> shelter-specific impacts.
            </li>
          </ul>
          <p>
            <strong>Sample Data Mode:</strong> When Live Data is disabled, the app displays seeded
            sample shelters and alerts for demonstration. A red rolling disclaimer ribbon appears
            across all pages to prevent confusion.
          </p>
          <p>
            <strong>Provenance Indicators:</strong> Every data source is labeled with:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 text-text-muted">
            <li>Source name (FEMA / NWS / Sample)</li>
            <li>Last fetched time (relative, e.g., "2 min ago")</li>
            <li>Status pill (ok / loading / error)</li>
            <li>Field coverage (e.g., "Location/Status: Live • Capacity: N/A")</li>
          </ul>
          <p>
            <strong>N/A Handling:</strong> Fields unavailable from public sources are shown as
            "N/A" with explanatory text (e.g., "Capacity data not available from FEMA"). This
            transparency prevents false confidence in unavailable metrics.
          </p>
        </div>
      </Card>

      {/* What's Next */}
      <Card title="What's Next">
        <div className="space-y-3 text-text">
          <div>
            <p>
              <strong>1. Additional data sources:</strong> Integrate OpenFEMA disaster declarations
              API to correlate shelter openings with declared disasters. Add NOAA storm track data
              for predictive alerts.
            </p>
          </div>
          <div>
            <p>
              <strong>2. Enhanced runbooks:</strong> Pre-configured runbook templates by alert type
              (hurricane warning, flash flood, tornado watch) with conditional steps based on
              severity and affected counties.
            </p>
          </div>
          <div>
            <p>
              <strong>3. Multi-state coordination:</strong> Support viewing multiple states
              simultaneously, cross-state shelter capacity sharing, and regional incident
              escalation workflows.
            </p>
          </div>
        </div>
      </Card>

      {/* Demo Script */}
      <Card title="Demo Script (60–90 seconds)">
        <div className="space-y-3 text-text">
          <div className="bg-surface-2 border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-text">Step 1: Show Live Data Mode (15s)</p>
            <p className="text-sm text-text-muted">
              Enable "Live Data" toggle in TopNav. Show status: "NWS: X • FEMA: Y • Updated Z min
              ago". Navigate to Overview to see live data source badges.
            </p>
          </div>
          <div className="bg-surface-2 border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-text">Step 2: Demonstrate Alert Workflow (20s)</p>
            <p className="text-sm text-text-muted">
              Click an NWS alert in Overview "Live NWS Alerts" section. Alert drawer opens showing
              Signal → Evidence → Impact. Click "Create Incident" button. Navigate to Incidents
              list to see new incident.
            </p>
          </div>
          <div className="bg-surface-2 border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-text">Step 3: Incident Workflow (25s)</p>
            <p className="text-sm text-text-muted">
              Open incident detail. Show Runbook tab with checklist steps. Check off a step. Switch
              to Notes tab, add a note. Switch to Audit Trail tab to show all actions logged. Click
              "Assign to me", then "Close incident" (with confirmation).
            </p>
          </div>
          <div className="bg-surface-2 border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-text">Step 4: Data Trust (15s)</p>
            <p className="text-sm text-text-muted">
              Navigate to Shelters list. Click a shelter. Show detail page with "Data Sources" card
              indicating "Location/Status: Live • Capacity: N/A". Explain that FEMA provides
              location/status but not capacity data. Show "Open in Maps" link.
            </p>
          </div>
          <div className="bg-surface-2 border border-border rounded-lg p-4 space-y-2">
            <p className="font-semibold text-text">Step 5: Sample Mode (10s)</p>
            <p className="text-sm text-text-muted">
              Disable "Live Data" toggle. Show red rolling disclaimer ribbon appears. Navigate to
              Overview to show sample data mode with "Sample Mode" pill in TopNav.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

