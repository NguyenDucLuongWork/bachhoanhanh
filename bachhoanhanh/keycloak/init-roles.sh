#!/bin/sh
set -e

KC_URL="http://keycloak:8080"
REALM="bachhoanhanh"
CLIENT_ID="user-service-client"

echo "Waiting for Keycloak to be ready..."
until curl -sf "$KC_URL/realms/$REALM" >/dev/null 2>&1; do
  sleep 3
done
echo "Keycloak is up"

ADMIN_TOKEN=$(
  curl -sf -X POST "$KC_URL/realms/master/protocol/openid-connect/token" \
    -d "grant_type=password&client_id=admin-cli&username=admin&password=admin" \
    | jq -r '.access_token'
)

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "null" ]; then
  echo "Failed to get admin token"
  exit 1
fi

CLIENT_UUID=$(
  curl -sf "$KC_URL/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    | jq -r '.[0].id'
)

if [ -z "$CLIENT_UUID" ] || [ "$CLIENT_UUID" = "null" ]; then
  echo "Client $CLIENT_ID not found"
  exit 1
fi

SA_USER_ID=$(
  curl -sf "$KC_URL/admin/realms/$REALM/clients/$CLIENT_UUID/service-account-user" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    | jq -r '.id'
)

if [ -z "$SA_USER_ID" ] || [ "$SA_USER_ID" = "null" ]; then
  echo "Service account user for $CLIENT_ID not found"
  exit 1
fi

RM_UUID=$(
  curl -sf "$KC_URL/admin/realms/$REALM/clients?clientId=realm-management" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    | jq -r '.[0].id'
)

if [ -z "$RM_UUID" ] || [ "$RM_UUID" = "null" ]; then
  echo "realm-management client not found"
  exit 1
fi

ROLES=$(
  curl -sf "$KC_URL/admin/realms/$REALM/clients/$RM_UUID/roles" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    | jq '[.[] | select(.name | IN("manage-users","view-users","query-users","query-groups","view-realm"))]'
)

echo "Roles to assign: $(echo "$ROLES" | jq -r '[.[].name] | join(", ")')"

HTTP_STATUS=$(
  curl -s -o /dev/null -w "%{http_code}" -X POST \
    "$KC_URL/admin/realms/$REALM/users/$SA_USER_ID/role-mappings/clients/$RM_UUID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$ROLES"
)

if [ "$HTTP_STATUS" = "204" ]; then
  echo "Roles assigned successfully to $CLIENT_ID service account"
else
  echo "Failed to assign roles, HTTP status: $HTTP_STATUS"
  exit 1
fi
