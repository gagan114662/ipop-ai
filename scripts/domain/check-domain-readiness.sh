#!/usr/bin/env bash
set -u

PRODUCT="iPOP"
DOMAIN="ipop.ai"
PREVIEW_URL="https://ipop-frontdesk.vercel.app/"
APEX_URL="https://ipop.ai"
WWW_URL="https://www.ipop.ai"

fail=0

http_status() {
  local url="$1"
  local status
  if status="$(curl -L -sS -o /dev/null -w "%{http_code}" --max-time 20 "$url" 2>/dev/null)"; then
    printf "%s" "$status"
  else
    printf "000"
  fi
}

page_title() {
  local url="$1"
  curl -L -sS --max-time 20 "$url" 2>/dev/null |
    tr '\n' ' ' |
    sed -n 's/.*<title>\([^<]*\)<\/title>.*/\1/p' |
    head -n 1
}

print_dns() {
  local host="$1"
  if command -v dig >/dev/null 2>&1; then
    local a_records cname_records
    a_records="$(dig +short A "$host" 2>/dev/null | paste -sd, -)"
    cname_records="$(dig +short CNAME "$host" 2>/dev/null | paste -sd, -)"
    printf "DNS %s A=%s CNAME=%s\n" "$host" "${a_records:-none}" "${cname_records:-none}"
  else
    printf "DNS %s skipped: dig is not installed\n" "$host"
  fi
}

printf "Domain readiness for %s (%s)\n" "$PRODUCT" "$DOMAIN"
printf "Preview: %s\n" "$PREVIEW_URL"
printf "\n"

print_dns "$DOMAIN"
print_dns "www.$DOMAIN"
printf "\n"

preview_status="$(http_status "$PREVIEW_URL")"
apex_status="$(http_status "$APEX_URL")"
www_status="$(http_status "$WWW_URL")"

preview_title="$(page_title "$PREVIEW_URL")"
apex_title="$(page_title "$APEX_URL")"
www_title="$(page_title "$WWW_URL")"

printf "HTTP preview %s title=%s\n" "$preview_status" "${preview_title:-missing}"
printf "HTTP apex    %s title=%s\n" "$apex_status" "${apex_title:-missing}"
printf "HTTP www     %s title=%s\n" "$www_status" "${www_title:-missing}"
printf "\n"

if [ "$preview_status" != "200" ]; then
  printf "FAIL: hosted preview is not returning HTTP 200.\n"
  fail=1
fi

if [ "$apex_status" != "200" ] && [ "$www_status" != "200" ]; then
  printf "FAIL: neither apex nor www is serving HTTP 200 on the owned domain.\n"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  printf "PASS: preview and owned domain are reachable. Confirm visual parity and backend environment before launch.\n"
else
  printf "NOT READY: finish hosting/domain cutover before launch.\n"
fi

exit "$fail"
