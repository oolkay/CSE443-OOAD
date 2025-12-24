#!/bin/bash

BASE_URL="http://localhost:8080/api"
EMAIL="test_user_$(date +%s)@example.com"
PASSWORD="password123"

echo "1. Registering new user with email: $EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"phoneNumber\": \"1234567890\"
  }")

echo "Response: $REGISTER_RESPONSE"
USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"userId":[0-9]*' | awk -F: '{print $2}')

if [ -z "$USER_ID" ]; then
  echo "❌ Registration failed or User ID not found."
  exit 1
fi

echo "✅ Registered User ID: $USER_ID"
echo ""

echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"//')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed. No token received."
  exit 1
fi

echo "✅ Login successful. Token received (starts with): ${TOKEN:0:20}..."
echo ""

echo "3. Testing Protected Endpoint (WITH Token)..."
# Using /api/appointments/customer/{userId} as a protected endpoint test
PROTECTED_URL="$BASE_URL/appointments/customer/$USER_ID"
PROTECTED_RESPONSE_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$PROTECTED_URL" \
  -H "Authorization: Bearer $TOKEN")

if [ "$PROTECTED_RESPONSE_HTTP_CODE" == "200" ]; then
  echo "✅ Access granted (HTTP 200). JWT is working!"
else
  echo "❌ Access failed. HTTP Code: $PROTECTED_RESPONSE_HTTP_CODE"
fi
echo ""

echo "4. Testing Protected Endpoint (WITHOUT Token)..."
UNPROTECTED_RESPONSE_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$PROTECTED_URL")

if [ "$UNPROTECTED_RESPONSE_HTTP_CODE" == "403" ] || [ "$UNPROTECTED_RESPONSE_HTTP_CODE" == "401" ]; then
  echo "✅ Access denied as expected (HTTP $UNPROTECTED_RESPONSE_HTTP_CODE). Security is working!"
else
  echo "❌ Request should have been denied but returned HTTP $UNPROTECTED_RESPONSE_HTTP_CODE"
fi
