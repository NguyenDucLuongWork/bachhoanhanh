# keycloak/init-roles.sh
#!/bin/bash
set -e

KC_URL="http://keycloak:8080"
REALM="bachhoanhanh"
CLIENT_ID="user-service-client"

echo "⏳ Waiting for Keycloak to be ready..."
until curl -sf "$KC_URL/realms/$REALM" > /dev/null 2>&1; do
  sleep 3
done
echo "✅ Keycloak is up"

# 1. Get admin token
ADMIN_TOKEN=$(curl -sf -X POST "$KC_URL/realms/master/protocol/openid-connect/token" \
  -d "grant_type=password&client_id=admin-cli&username=admin&password=admin" \
  | jq -r '.access_token')

[ "$ADMIN_TOKEN" = "null" ] && echo "❌ Failed to get admin token" && exit 1

# 2. Get user-service-client internal ID
CLIENT_UUID=$(curl -sf "$KC_URL/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq -r '.[0].id')

[ "$CLIENT_UUID" = "null" ] && echo "❌ Client $CLIENT_ID not found" && exit 1

# 3. Get service account user ID
SA_USER_ID=$(curl -sf "$KC_URL/admin/realms/$REALM/clients/$CLIENT_UUID/service-account-user" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq -r '.id')

# 4. Get realm-management client ID
RM_UUID=$(curl -sf "$KC_URL/admin/realms/$REALM/clients?clientId=realm-management" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq -r '.[0].id')

# 5. Get the required role objects
ROLES=$(curl -sf "$KC_URL/admin/realms/$REALM/clients/$RM_UUID/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  | jq '[.[] | select(.name | IN("manage-users","view-users","query-users","query-groups","view-realm"))]')

echo "🔑 Roles to assign: $(echo $ROLES | jq '[.[].name]')"

# 6. Assign roles to the service account
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  "$KC_URL/admin/realms/$REALM/users/$SA_USER_ID/role-mappings/clients/$RM_UUID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ROLES")

if [ "$HTTP_STATUS" = "204" ]; then
  echo "✅ Roles assigned successfully to $CLIENT_ID service account"
else
  echo "❌ Failed to assign roles, HTTP status: $HTTP_STATUS"
  exit 1
fi