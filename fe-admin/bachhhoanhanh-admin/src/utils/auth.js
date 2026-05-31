// Decode JWT token to extract user info
export function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

export function getUserInfo(token) {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    username: decoded.preferred_username || decoded.sub,
    name: decoded.name || '',
    email: decoded.email || '',
    roles: decoded.realm_access?.roles || [],
    realmRoles: decoded.realm_access?.roles || [],
  };
}

export function hasRole(token, role) {
  const userInfo = getUserInfo(token);
  if (!userInfo) return false;
  return userInfo.roles.includes(role.toUpperCase());
}

export function isAdmin(token) {
  return hasRole(token, 'ADMIN');
}
