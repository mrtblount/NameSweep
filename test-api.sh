#!/bin/bash

echo "Testing domain availability API..."
echo ""
echo "Testing workbrew domains:"
echo "========================"

echo -n "workbrew.com: "
curl -s "http://localhost:3001/api/check?name=workbrew" | jq -r '.domains[".com"]' 2>/dev/null || echo "Error"

echo -n "workbrew.co: "
curl -s "http://localhost:3001/api/check?name=workbrew" | jq -r '.domains[".co"]' 2>/dev/null || echo "Error"

echo -n "workbrew.io: "
curl -s "http://localhost:3001/api/check?name=workbrew" | jq -r '.domains[".io"]' 2>/dev/null || echo "Error"

echo -n "workbrew.net: "
curl -s "http://localhost:3001/api/check?name=workbrew" | jq -r '.domains[".net"]' 2>/dev/null || echo "Error"

echo ""
echo "Testing tonyblount domains:"
echo "==========================="

echo -n "tonyblount.com: "
curl -s "http://localhost:3001/api/check?name=tonyblount" | jq -r '.domains[".com"]' 2>/dev/null || echo "Error"

echo -n "tonyblount.co: "
curl -s "http://localhost:3001/api/check?name=tonyblount" | jq -r '.domains[".co"]' 2>/dev/null || echo "Error"

echo -n "tonyblount.io: "
curl -s "http://localhost:3001/api/check?name=tonyblount" | jq -r '.domains[".io"]' 2>/dev/null || echo "Error"

echo -n "tonyblount.net: "
curl -s "http://localhost:3001/api/check?name=tonyblount" | jq -r '.domains[".net"]' 2>/dev/null || echo "Error"

echo ""
echo "Expected results:"
echo "================="
echo "workbrew.com: ❌ live"
echo "workbrew.co: ❌ parked"
echo "workbrew.io: ❌ parked"
echo "workbrew.net: ❌ parked"
echo "tonyblount.com: ❌ live"
echo "tonyblount.co: ✅"
echo "tonyblount.io: ✅"
echo "tonyblount.net: ✅"