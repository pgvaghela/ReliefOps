export function parseQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function getQueryParam(searchParams: URLSearchParams, key: string): string | null {
  return searchParams.get(key);
}

