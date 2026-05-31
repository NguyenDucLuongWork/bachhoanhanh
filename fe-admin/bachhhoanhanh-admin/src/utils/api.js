// Use relative URLs for proxy in development, full URL for production
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '' : 'http://bachhoanhanh';
const AUTH_REALM_URL = `${API_BASE_URL}/auth/realms/bachhoanhanh/protocol/openid-connect/token`;

export async function loginWithPassword(username, password) {
  try {
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: 'gateway-client',
      username,
      password,
    });

    const response = await fetch(AUTH_REALM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Login response error:', response.status, errorData);
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error('No access token in response');
    }
    return data.access_token;
  } catch (error) {
    console.error('Login error details:', error.message);
    throw error;
  }
}

export function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// CRUD Operations
export async function fetchData(endpoint, token) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function createData(endpoint, data, token) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create data`);
    }

    return await response.json();
  } catch (error) {
    console.error('Create error:', error);
    throw error;
  }
}

export async function updateData(endpoint, id, data, token) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update data`);
    }

    return await response.json();
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

export async function deleteData(endpoint, id, token) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete data`);
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}
