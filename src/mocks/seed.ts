import type { Shelter, Alert } from '../types';

const COUNTIES = [
  'Miami-Dade',
  'Broward',
  'Palm Beach',
  'Monroe',
  'Collier',
  'Lee',
  'Hillsborough',
  'Orange',
  'Pinellas',
  'Duval',
];

const SHELTER_NAMES = [
  'Community Center North',
  'High School Gymnasium',
  'Convention Center',
  'Sports Complex',
  'Elementary School',
  'Church Hall',
  'Recreation Center',
  'University Dormitory',
  'Fairgrounds Pavilion',
  'Municipal Building',
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date;
}

export function generateSeedData() {
  const shelters: Shelter[] = [];
  const alerts: Alert[] = [];

  // Generate 10 sample shelters
  for (let i = 0; i < 10; i++) {
    const capacityTotal = randomInt(50, 500);
    const capacityUsed = randomInt(0, Math.floor(capacityTotal * 0.9));
    const capacityPercent = (capacityUsed / capacityTotal) * 100;

    let status: Shelter['status'] = 'operational';
    if (capacityPercent > 95) status = 'critical';
    else if (capacityPercent > 85) status = 'at-capacity';
    else if (capacityPercent > 70) status = 'overflow';

    shelters.push({
      id: `sample-shelter-${i + 1}`,
      name: randomChoice(SHELTER_NAMES) + ` ${i + 1}`,
      county: randomChoice(COUNTIES),
      lat: 25.5 + Math.random() * 2,
      lon: -80.3 - Math.random() * 2,
      capacityTotal,
      capacityUsed,
      status,
      hasPower: Math.random() > 0.15,
      hasWater: Math.random() > 0.1,
      medicalLevel: randomChoice(['none', 'basic', 'basic', 'advanced', 'hospital']),
      lastUpdated: randomDate(randomInt(0, 2)),
      intakePerHour: Array.from({ length: 24 }, () => randomInt(0, 20)),
      supplies: {
        water: randomInt(100, 5000),
        food: randomInt(200, 10000),
        meds: randomInt(50, 500),
        fuel: randomInt(50, 2000),
      },
      issues: [],
    });
  }

  // Generate 5 sample alerts
  for (let i = 0; i < 5; i++) {
    const shelter = randomChoice(shelters);
    alerts.push({
      id: `sample-alert-${i + 1}`,
      severity: randomChoice(['warning', 'error', 'error', 'critical']),
      sourceType: 'shelter',
      sourceId: shelter.id,
      title: `Sample Alert ${i + 1}: ${shelter.name} at ${shelter.capacityUsed !== null && shelter.capacityTotal !== null && shelter.capacityTotal > 0 ? Math.round((shelter.capacityUsed / shelter.capacityTotal) * 100) : 0}% capacity`,
      signal: 'Sample operational alert',
      evidence: [
        `Current capacity: ${shelter.capacityUsed}/${shelter.capacityTotal}`,
        `Status: ${shelter.status}`,
      ],
      impact: 'This is sample data for demonstration purposes',
      suggestedActions: ['Review shelter status', 'Check capacity'],
      createdAt: randomDate(randomInt(0, 3)),
    });
  }

  return {
    shelters,
    alerts,
  };
}

