import axios from 'axios';
import { getConfig } from './config.js';

const KLARNA_BASE_URL = 'https://www.klarna.com/us/shopping';

/**
 * Make an API request
 */
async function apiRequest(method, endpoint, params = null) {
  const config = {
    method,
    url: `${KLARNA_BASE_URL}${endpoint}`,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (params) config.params = params;

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 400) {
      throw new Error('Bad request. Check your parameters.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else if (status === 503) {
      throw new Error('Service unavailable. One or more Klarna services are down.');
    } else {
      const message = data?.message || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from Klarna API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// PRODUCTS
// ============================================================

export async function searchProducts({ query, size, budget } = {}) {
  if (!query) {
    throw new Error('Query parameter is required');
  }

  const params = { q: query };
  if (size) params.size = size;
  if (budget) params.budget = budget;

  return await apiRequest('GET', '/public/openai/v0/products', params);
}
