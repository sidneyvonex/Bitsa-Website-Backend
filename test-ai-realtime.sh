#!/bin/bash

# AI Real-Time Data Testing Script
# This script tests the AI chat endpoint to verify it returns real database data

BASE_URL="http://localhost:3000/api/ai"

echo "================================"
echo "AI Real-Time Data Testing"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: General Events Query
echo -e "${YELLOW}Test 1: General Events Query${NC}"
echo "Query: 'What events do you have?'"
echo ""
RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "What events do you have?"
  }')

echo "$RESPONSE" | jq -r '.data.response'
echo ""

# Check for invalid phrases
if echo "$RESPONSE" | grep -q "I need to check our database\|check our website\|reach out to"; then
    echo -e "${RED}❌ FAILED: Response contains invalid phrases${NC}"
else
    echo -e "${GREEN}✅ PASSED: No invalid phrases detected${NC}"
fi
echo ""
echo "-----------------------------------"
echo ""

# Test 2: General Blogs Query
echo -e "${YELLOW}Test 2: General Blogs Query${NC}"
echo "Query: 'Show me all your blogs'"
echo ""
RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Show me all your blogs"
  }')

echo "$RESPONSE" | jq -r '.data.response'
echo ""

if echo "$RESPONSE" | grep -q "I need to check our database\|check our website\|reach out to"; then
    echo -e "${RED}❌ FAILED: Response contains invalid phrases${NC}"
else
    echo -e "${GREEN}✅ PASSED: No invalid phrases detected${NC}"
fi
echo ""
echo "-----------------------------------"
echo ""

# Test 3: Projects Query
echo -e "${YELLOW}Test 3: Projects Query${NC}"
echo "Query: 'What projects are available?'"
echo ""
RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "What projects are available?"
  }')

echo "$RESPONSE" | jq -r '.data.response'
echo ""

if echo "$RESPONSE" | grep -q "I need to check our database\|check our website\|reach out to"; then
    echo -e "${RED}❌ FAILED: Response contains invalid phrases${NC}"
else
    echo -e "${GREEN}✅ PASSED: No invalid phrases detected${NC}"
fi
echo ""
echo "-----------------------------------"
echo ""

# Test 4: Leaders Query
echo -e "${YELLOW}Test 4: Leaders Query${NC}"
echo "Query: 'Who are the club leaders?'"
echo ""
RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Who are the club leaders?"
  }')

echo "$RESPONSE" | jq -r '.data.response'
echo ""

if echo "$RESPONSE" | grep -q "I need to check our database\|check our website\|reach out to"; then
    echo -e "${RED}❌ FAILED: Response contains invalid phrases${NC}"
else
    echo -e "${GREEN}✅ PASSED: No invalid phrases detected${NC}"
fi
echo ""
echo "-----------------------------------"
echo ""

# Test 5: Specific Search
echo -e "${YELLOW}Test 5: Specific Search Query${NC}"
echo "Query: 'Tell me about machine learning events'"
echo ""
RESPONSE=$(curl -s -X POST "$BASE_URL/chat" \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "Tell me about machine learning events"
  }')

echo "$RESPONSE" | jq -r '.data.response'
echo ""

if echo "$RESPONSE" | grep -q "I need to check our database\|check our website\|reach out to"; then
    echo -e "${RED}❌ FAILED: Response contains invalid phrases${NC}"
else
    echo -e "${GREEN}✅ PASSED: No invalid phrases detected${NC}"
fi
echo ""
echo "-----------------------------------"
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Testing Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Review the responses above to verify:"
echo "1. ✅ Actual data from database is returned (with titles, dates, details)"
echo "2. ✅ No phrases like 'I need to check our database'"
echo "3. ✅ No suggestions to 'check our website' or 'contact leaders'"
echo "4. ✅ If no data exists, it says 'Currently, there are no [items] in our database'"
echo ""
