#!/usr/bin/env bash
set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=== Smoking Northside Discovery Centre API at $BASE_URL ==="

# GET /api/health
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")
echo "GET /api/health -> $code"
[ "$code" = "200" ]

# GET /api/centre
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/centre")
echo "GET /api/centre -> $code"
[ "$code" = "200" ]

# GET /api/status
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/status")
echo "GET /api/status -> $code"
[ "$code" = "200" ]

# GET /api/exhibits
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/exhibits")
echo "GET /api/exhibits -> $code"
[ "$code" = "200" ]

# GET /api/exhibits/sky-room
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/exhibits/sky-room")
echo "GET /api/exhibits/sky-room -> $code"
[ "$code" = "200" ]

# GET /api/exhibits/unknown-slug -> 404
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/exhibits/unknown-slug")
echo "GET /api/exhibits/unknown-slug -> $code"
[ "$code" = "404" ]

# GET /api/tickets/quote (Valid)
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tickets/quote?adults=2&children=1")
echo "GET /api/tickets/quote?adults=2&children=1 -> $code"
[ "$code" = "200" ]

# GET /api/tickets/quote (Invalid) -> 400
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/tickets/quote?adults=0&children=0")
echo "GET /api/tickets/quote?adults=0&children=0 -> $code"
[ "$code" = "400" ]

# POST /api/plan (Valid)
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/plan" \
  -H "Content-Type: application/json" \
  -d '{"timeMinutes":60,"interests":["space"],"adults":2,"children":1}')
echo "POST /api/plan -> $code"
[ "$code" = "200" ]

# POST /api/plan (Invalid) -> 400
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/plan" \
  -H "Content-Type: application/json" \
  -d '{"timeMinutes":5}')
echo "POST /api/plan (invalid) -> $code"
[ "$code" = "400" ]

# GET /api/plan/ics
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/plan/ics?time=60&interests=space&adults=2&children=1")
echo "GET /api/plan/ics -> $code"
[ "$code" = "200" ]

# GET /api/faq
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/faq")
echo "GET /api/faq -> $code"
[ "$code" = "200" ]

# GET /api/best-time
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/best-time?dayOfWeek=2&duration=60")
echo "GET /api/best-time -> $code"
[ "$code" = "200" ]

# GET /api/feedback/summary
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/feedback/summary")
echo "GET /api/feedback/summary -> $code"
[ "$code" = "200" ]

# GET /api/favourites
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/favourites")
echo "GET /api/favourites -> $code"
[ "$code" = "200" ]

echo "=== All API endpoints passed smoke check cleanly! ==="
