#!/bin/bash
#
# RMS API Testing Suite
# Run this script to verify all API endpoints are working correctly.
#
# Usage:
#   ./scripts/test-api.sh          # Run against localhost:3000
#   ./scripts/test-api.sh http://custom-url:port
#
# Prerequisites:
#   - API server must be running (bun run dev)
#   - Database must be seeded (bun run db:reset)
#   - jq must be installed (brew install jq)

# Don't exit on errors - we want to run all tests
# set -e

# Configuration
API_BASE="${1:-http://localhost:3000}"
PASS_COUNT=0
FAIL_COUNT=0

# Test IDs from seed data
RESIDENT_ID="b0000002-0000-0000-0000-000000000002"  # Michael Rodriguez, PGY-4
FACULTY_ID="fac00001-0000-0000-0000-000000000001"   # Julia Martinez
EPA_ID="e0000005-0000-0000-0000-000000000005"       # Lap Chole

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local expected_check="$4"

    echo -n "  Testing: $name... "

    local response
    if [ "$method" = "PATCH" ]; then
        response=$(curl -s -X PATCH "$API_BASE$endpoint")
    else
        response=$(curl -s "$API_BASE$endpoint")
    fi

    if echo "$response" | jq -e "$expected_check" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${RED}FAIL${NC}"
        echo "    Response: $(echo "$response" | head -c 200)"
        ((FAIL_COUNT++))
    fi
}

test_json_field() {
    local name="$1"
    local endpoint="$2"
    local jq_query="$3"
    local expected="$4"

    echo -n "  Testing: $name... "

    local actual
    actual=$(curl -s "$API_BASE$endpoint" | jq -r "$jq_query" 2>/dev/null)

    if [ "$actual" = "$expected" ]; then
        echo -e "${GREEN}PASS${NC} ($actual)"
        ((PASS_COUNT++))
    else
        echo -e "${RED}FAIL${NC} (expected: $expected, got: $actual)"
        ((FAIL_COUNT++))
    fi
}

# ============================================
# Run Tests
# ============================================

echo ""
echo "RMS API Testing Suite"
echo "Testing against: $API_BASE"

# Health Check
print_header "Health Check"
test_endpoint "Server is running" "GET" "/" '.status == "ok"'
test_endpoint "Database connected" "GET" "/" '.database == "connected"'

# Users API
print_header "Users API"
test_endpoint "GET /api/users returns array" "GET" "/api/users" 'type == "array"'
test_endpoint "GET /api/users has users" "GET" "/api/users" 'length > 0'
test_json_field "Users include faculty" "/api/users" '[.[] | select(.role == "faculty")] | length' "4"
test_json_field "Users include residents" "/api/users" '[.[] | select(.role == "resident")] | length' "6"

# Residents API
print_header "Residents API"
test_endpoint "GET /api/residents returns array" "GET" "/api/residents" 'type == "array"'
test_endpoint "GET /api/residents has residents" "GET" "/api/residents" 'length > 0'

# Resident Progress (with requirements)
print_header "Resident Progress API (with requirements)"
test_endpoint "GET progress returns data" "GET" "/api/residents/$RESIDENT_ID/progress" '.progress | type == "array"'
test_endpoint "Progress has stats" "GET" "/api/residents/$RESIDENT_ID/progress" '.stats.total_assessments >= 0'
test_endpoint "Progress has requirements_met" "GET" "/api/residents/$RESIDENT_ID/progress" '.stats.requirements_met >= 0'
test_endpoint "Progress has requirements_total" "GET" "/api/residents/$RESIDENT_ID/progress" '.stats.requirements_total >= 0'
test_endpoint "EPAs have requirement data" "GET" "/api/residents/$RESIDENT_ID/progress" '.progress[] | select(.requirement != null) | .requirement.target_count > 0'

# Unacknowledged Assessments
print_header "Unacknowledged Assessments API"
test_endpoint "GET unacknowledged returns array" "GET" "/api/residents/$RESIDENT_ID/unacknowledged" 'type == "array"'
test_endpoint "Unacknowledged have EPA info" "GET" "/api/residents/$RESIDENT_ID/unacknowledged" 'if length > 0 then .[0].epa_number != null else true end'
test_endpoint "Unacknowledged have faculty info" "GET" "/api/residents/$RESIDENT_ID/unacknowledged" 'if length > 0 then .[0].faculty_first_name != null else true end'

# Faculty API
print_header "Faculty API"
test_endpoint "GET /api/faculty returns array" "GET" "/api/faculty" 'type == "array"'
test_endpoint "GET /api/faculty has faculty" "GET" "/api/faculty" 'length > 0'

# EPAs API
print_header "EPAs API"
test_endpoint "GET /api/epas returns array" "GET" "/api/epas" 'type == "array"'
test_json_field "EPAs count" "/api/epas" 'length' "18"

# Clinical Sites API
print_header "Clinical Sites API"
test_endpoint "GET /api/clinical-sites returns array" "GET" "/api/clinical-sites" 'type == "array"'
test_endpoint "GET /api/clinical-sites has sites" "GET" "/api/clinical-sites" 'length > 0'

# Rotations API
print_header "Rotations API"
test_endpoint "GET /api/rotations returns array" "GET" "/api/rotations" 'type == "array"'

# Assessments API
print_header "Assessments API"
test_endpoint "GET /api/assessments returns array" "GET" "/api/assessments" 'type == "array"'
test_endpoint "GET /api/assessments?resident_id filters" "GET" "/api/assessments?resident_id=$RESIDENT_ID" 'all(.[]; .resident_id == "'$RESIDENT_ID'")'
test_endpoint "GET /api/assessments?epa_id filters" "GET" "/api/assessments?epa_id=$EPA_ID" 'all(.[]; .epa_id == "'$EPA_ID'")'

# Assessment Acknowledgment (test with a specific assessment if available)
print_header "Assessment Acknowledgment API"
ASSESSMENT_ID=$(curl -s "$API_BASE/api/residents/$RESIDENT_ID/unacknowledged" | jq -r '.[0].id // empty')
if [ -n "$ASSESSMENT_ID" ]; then
    test_endpoint "PATCH acknowledge works" "PATCH" "/api/assessments/$ASSESSMENT_ID/acknowledge" '.acknowledged == true'
    echo -e "  ${YELLOW}Note: Re-run db:reset to restore unacknowledged assessments${NC}"
else
    echo "  Skipping acknowledge test (no unacknowledged assessments)"
fi

# ============================================
# Summary
# ============================================

print_header "Test Summary"
TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo -e "  ${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "  ${RED}Failed: $FAIL_COUNT${NC}"
echo "  Total:  $TOTAL"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
else
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
fi
