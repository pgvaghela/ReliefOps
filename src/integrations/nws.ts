import type { Alert } from '../types';

interface NWSAlertProperties {
  id: string;
  event: string;
  headline?: string;
  description?: string;
  severity?: string;
  urgency?: string;
  areaDesc?: string; // String, not array
  sent?: string;
  effective?: string;
  ends?: string;
}

interface NWSResponse {
  features: Array<{
    properties: NWSAlertProperties;
  }>;
}

/**
 * Fetches active NWS alerts for a given state or lat/lon
 * Maps them to our Alert type
 * Note: api.weather.gov may rate-limit if polled too frequently (keep interval >= 60s)
 * This function is called by the store when liveNwsEnabled is true, so config check is not needed here
 */
export async function fetchNWSAlerts(
  state?: string,
  lat?: number,
  lon?: number,
): Promise<Alert[]> {

  try {
    let url = 'https://api.weather.gov/alerts/active';
    if (state) {
      // Use correct endpoint for state-based queries
      url = `https://api.weather.gov/alerts/active/area/${state}`;
    } else if (lat !== undefined && lon !== undefined) {
      // Point-based lookup (optional, kept for future use)
      url += `?point=${lat},${lon}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReliefOps (contact: reliefops@example.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`NWS API error: ${response.statusText}`);
    }

    const data: NWSResponse = await response.json();

    return data.features.map((feature) => {
      const alert = feature.properties;
      const severityMap: Record<string, Alert['severity']> = {
        Extreme: 'critical',
        Severe: 'error',
        Moderate: 'warning',
        Minor: 'info',
        Unknown: 'info',
      };

      // Handle missing fields robustly
      const alertId = alert.id || `nws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const severity = alert.severity ? (severityMap[alert.severity] || 'info') : 'info';
      const title = alert.headline || alert.event || 'Weather Alert';
      const signal = alert.event || 'Weather alert';
      
      // Evidence: use headline or first 200 chars of description
      const evidence: string[] = [];
      if (alert.headline) {
        evidence.push(alert.headline);
      }
      if (alert.description) {
        const desc = alert.description.length > 200 
          ? alert.description.substring(0, 200) + '...'
          : alert.description;
        if (!alert.headline || desc !== alert.headline) {
          evidence.push(desc);
        }
      }
      if (evidence.length === 0) {
        evidence.push(signal);
      }

      // Impact: use areaDesc string (not array)
      const areaDesc = alert.areaDesc || 'affected areas';
      const impact = `Weather alert affecting ${areaDesc}`;

      // Created date: use sent, effective, or current time
      const createdAt = alert.sent 
        ? new Date(alert.sent)
        : alert.effective
        ? new Date(alert.effective)
        : new Date();

      return {
        id: `nws-${alertId}`,
        severity,
        sourceType: 'shelter' as const, // NWS alerts are weather-related
        sourceId: 'nws',
        title,
        signal,
        evidence,
        impact,
        suggestedActions: [
          'Monitor weather conditions',
          'Review evacuation plans',
          'Check shelter readiness',
        ],
        createdAt,
      };
    });
  } catch (error) {
    console.error('Failed to fetch NWS alerts:', error);
    return [];
  }
}

