export const config = {
  ENABLE_LIVE_NWS: false,
  ENABLE_LIVE_FEMA_SHELTERS: false,
  NWS_POLL_INTERVAL_MS: 120000, // 2 minutes - api.weather.gov may rate-limit if polled too frequently (keep >= 60s)
  FEMA_POLL_INTERVAL_MS: 600000, // 10 minutes - FEMA data updates less frequently
  DEFAULT_NWS_STATE: 'FL',
  DEFAULT_FEMA_STATE: 'FL',
} as const;

