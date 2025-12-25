import type { Shelter } from '../types';

interface FemaShelterFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lon, lat] in GeoJSON
  };
  properties: {
    shelter_id?: string;
    shelter_name?: string;
    city?: string;
    state?: string;
    zip?: string;
    address?: string;
    shelter_status?: string; // OPEN, CLOSED, etc.
    evacuation_capacity?: number;
    total_population?: number;
    [key: string]: unknown; // Allow other fields
  };
}

interface FemaShelterResponse {
  type: 'FeatureCollection';
  features: FemaShelterFeature[];
}

const FEMA_BASE_URL = 'https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0';

/**
 * Fetches open shelters from FEMA ArcGIS service for a given state
 * Maps them to our Shelter type
 * Note: GeoJSON coordinates are [lon, lat], not [lat, lon]
 */
export async function fetchFemaOpenShelters(state: string): Promise<Shelter[]> {
  try {
    const whereClause = encodeURIComponent(`STATE='${state}'`);
    const outFields = [
      'shelter_id',
      'shelter_name',
      'city',
      'state',
      'zip',
      'address',
      'shelter_status',
      'evacuation_capacity',
      'total_population',
    ].join(',');
    
    const url = `${FEMA_BASE_URL}/query?where=${whereClause}&outFields=${outFields}&returnGeometry=true&f=geojson&outSR=4326`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReliefOps (contact: reliefops@example.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`FEMA API error: ${response.statusText}`);
    }

    const data: FemaShelterResponse = await response.json();

    const fetchTime = new Date();

    return data.features.map((feature) => {
      const props = feature.properties;
      const [lon, lat] = feature.geometry.coordinates; // GeoJSON is [lon, lat]

      // Map shelter status
      let status: Shelter['status'] = 'operational';
      if (props.shelter_status) {
        const statusUpper = props.shelter_status.toUpperCase();
        if (statusUpper === 'CLOSED') {
          status = 'critical';
        } else if (statusUpper.includes('FULL') || statusUpper.includes('CAPACITY')) {
          status = 'at-capacity';
        } else if (statusUpper === 'OPEN') {
          status = 'operational';
        }
      }

      // Calculate capacity percentage if both values are available
      const capacityTotal = props.evacuation_capacity ?? null;
      const capacityUsed = props.total_population ?? null;
      let finalStatus: 'operational' | 'at-capacity' | 'overflow' | 'critical' = status as 'operational' | 'at-capacity' | 'overflow' | 'critical';
      if (capacityTotal !== null && capacityUsed !== null && capacityTotal > 0) {
        const percent = (capacityUsed / capacityTotal) * 100;
        if (percent > 95) finalStatus = 'critical';
        else if (percent > 85) finalStatus = 'at-capacity';
        else if (percent > 70) finalStatus = 'overflow';
      }

      return {
        id: `fema-${props.shelter_id || `unknown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}`,
        name: props.shelter_name || 'Unnamed Shelter',
        county: props.city || 'N/A', // FEMA doesn't provide county, use city as fallback
        lat,
        lon,
        capacityTotal: capacityTotal ?? null, // null if not available
        capacityUsed: capacityUsed ?? null, // null if not available
        status: finalStatus,
        hasPower: null, // Not available from FEMA
        hasWater: null, // Not available from FEMA
        medicalLevel: null, // Not available from FEMA
        lastUpdated: fetchTime,
        intakePerHour: [], // Not available from FEMA
        supplies: {
          water: null, // Not available from FEMA
          food: null, // Not available from FEMA
          meds: null, // Not available from FEMA
          fuel: null, // Not available from FEMA
        },
        issues: [],
        // Additional FEMA fields
        city: props.city || null,
        state: props.state || null,
        zip: props.zip || null,
        address: props.address || null,
        shelterStatus: props.shelter_status || null,
      } as Shelter & {
        city?: string | null;
        state?: string | null;
        zip?: string | null;
        address?: string | null;
        shelterStatus?: string | null;
      };
    });
  } catch (error) {
    console.error('Failed to fetch FEMA shelters:', error);
    throw error;
  }
}

