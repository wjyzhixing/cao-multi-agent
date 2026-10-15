export class ApiError extends Error {
  constructor(message, { code = 'UNKNOWN_ERROR', status = 0, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.data = data;
  }
}

const DEFAULT_BASE_URL = '/api/bicycles';

export function getBaseUrl(overrideUrl) {
  if (overrideUrl) return overrideUrl;
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  return DEFAULT_BASE_URL;
}

export function setGlobalBaseUrl(url) {
  if (typeof window !== 'undefined') {
    window.__API_BASE_URL__ = url;
  }
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
      ...options,
    });
  } catch (networkError) {
    throw new ApiError(`Network error: ${networkError.message}`, {
      code: 'NETWORK_ERROR',
      status: 0,
    });
  }

  let body = null;
  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  } else {
    try {
      const text = await response.text();
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const errorDetails = body?.error || {};
    const errorCode = errorDetails.code || `HTTP_${response.status}`;
    const errorMessage = errorDetails.message || response.statusText || 'Request failed';
    throw new ApiError(errorMessage, {
      code: errorCode,
      status: response.status,
      data: body?.data ?? null,
    });
  }

  if (body && body.success === false) {
    const errorDetails = body.error || {};
    throw new ApiError(errorDetails.message || 'Operation failed', {
      code: errorDetails.code || 'UNKNOWN_ERROR',
      status: response.status,
      data: body.data ?? null,
    });
  }

  return body;
}

export async function listBicycles({ page = 1, pageSize = 10, baseUrl } = {}) {
  const root = getBaseUrl(baseUrl).replace(/\/+$/, '');
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  const url = `${root}?${params.toString()}`;
  const envelope = await request(url, { method: 'GET' });
  return {
    items: envelope.data || [],
    meta: envelope.meta || { page, pageSize, total: envelope.data?.length || 0 },
  };
}

export async function getBicycle(id, { baseUrl } = {}) {
  if (!id) throw new ApiError('id is required', { code: 'VALIDATION_ERROR', status: 400 });
  const root = getBaseUrl(baseUrl).replace(/\/+$/, '');
  const url = `${root}/${encodeURIComponent(id)}`;
  const envelope = await request(url, { method: 'GET' });
  return envelope.data;
}

function sanitizeBicyclePayload({ name, brand, type, price }) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ApiError('name must be a non-empty string', { code: 'VALIDATION_ERROR', status: 400 });
  }
  if (typeof brand !== 'string' || brand.trim().length === 0) {
    throw new ApiError('brand must be a non-empty string', { code: 'VALIDATION_ERROR', status: 400 });
  }
  if (typeof type !== 'string' || type.trim().length === 0) {
    throw new ApiError('type must be a non-empty string', { code: 'VALIDATION_ERROR', status: 400 });
  }
  const parsedPrice = typeof price === 'number' ? price : Number(price);
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
    throw new ApiError('price must be a number greater than or equal to 0', { code: 'VALIDATION_ERROR', status: 400 });
  }

  return {
    name: name.trim(),
    brand: brand.trim(),
    type: type.trim(),
    price: parsedPrice,
  };
}

export async function createBicycle(data, { baseUrl } = {}) {
  const payload = sanitizeBicyclePayload(data);
  const root = getBaseUrl(baseUrl).replace(/\/+$/, '');
  const envelope = await request(root, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return envelope.data;
}

export async function updateBicycle(id, data, { baseUrl } = {}) {
  if (!id) throw new ApiError('id is required', { code: 'VALIDATION_ERROR', status: 400 });
  const payload = sanitizeBicyclePayload(data);
  const root = getBaseUrl(baseUrl).replace(/\/+$/, '');
  const url = `${root}/${encodeURIComponent(id)}`;
  const envelope = await request(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return envelope.data;
}

export async function deleteBicycle(id, { baseUrl } = {}) {
  if (!id) throw new ApiError('id is required', { code: 'VALIDATION_ERROR', status: 400 });
  const root = getBaseUrl(baseUrl).replace(/\/+$/, '');
  const url = `${root}/${encodeURIComponent(id)}`;
  const envelope = await request(url, { method: 'DELETE' });
  return envelope.data;
}
