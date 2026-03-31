import { buildQueryString, handleApiError } from '../utils/api-helpers';

const API_BASE = ''; // Empty because of proxy

export async function fetchProperties(params = {}) {
  try {
    const query = buildQueryString(params);
    const url = `${API_BASE}/api/properties${query ? '?' + query : ''}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch properties'));
  }
}

export async function fetchPropertyDetail(listingId) {
  try {
    const response = await fetch(`${API_BASE}/api/properties/${listingId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Property not found');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch property details'));
  }
}

export async function fetchOpenHouses(listingId) {
  try {
    const response = await fetch(`${API_BASE}/api/properties/${listingId}/openhouses`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(handleApiError(error, 'Failed to fetch open houses'));
  }
}
