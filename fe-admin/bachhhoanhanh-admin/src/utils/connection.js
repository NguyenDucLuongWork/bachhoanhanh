const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '' : 'http://bachhoanhanh';

export async function testConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/.well-known/openid-configuration`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Server is reachable',
        status: response.status,
      };
    } else {
      return {
        success: false,
        message: `Server returned status ${response.status}`,
        status: response.status,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
}
