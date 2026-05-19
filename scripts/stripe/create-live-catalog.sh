#!/usr/bin/env bash
set -euo pipefail

DOMAIN="ipop.ai"
CURRENCY="${STRIPE_CURRENCY:-usd}"
DRY_RUN=1

if [ "${1:-}" = "--execute" ]; then
  DRY_RUN=0
fi

if [ "$DRY_RUN" = "0" ] && [ "${STRIPE_LIVE_CONFIRM:-}" != "$DOMAIN" ]; then
  echo "Refusing live Stripe writes. Set STRIPE_LIVE_CONFIRM=$DOMAIN and rerun with --execute." >&2
  exit 2
fi

if ! command -v stripe >/dev/null 2>&1; then
  echo "Missing stripe CLI." >&2
  exit 2
fi

if [ "$DRY_RUN" = "0" ] && ! command -v jq >/dev/null 2>&1; then
  echo "Missing jq; required to parse Stripe CLI responses." >&2
  exit 2
fi

catalog=(
  "ipop_crm_starter|iPOP CRM Starter|recurring|STRIPE_PRICE_IPOP_STARTER_MONTHLY"
  "ipop_sales_team|iPOP Sales Team|recurring|STRIPE_PRICE_IPOP_TEAM_MONTHLY"
  "ipop_migration|iPOP CRM Migration|one_time|STRIPE_PRICE_IPOP_MIGRATION_ONETIME"
)

amount_env_for() {
  printf "%s_AMOUNT" "$1"
}

run_or_print() {
  if [ "$DRY_RUN" = "1" ]; then
    printf 'DRY_RUN:'
    printf ' %q' "$@"
    printf '\n'
  else
    "$@"
  fi
}

find_product() {
  local handle="$1"
  stripe products search --live -d "query=metadata['launch_handle']:'$handle'" | jq -r '.data[0].id // empty'
}

find_price() {
  local lookup_key="$1"
  stripe prices search --live -d "query=lookup_key:'$lookup_key'" | jq -r '.data[0].id // empty'
}

echo "Stripe catalog target: $DOMAIN"
echo "Currency: $CURRENCY"

for row in "${catalog[@]}"; do
  IFS='|' read -r handle name mode price_env <<< "$row"
  amount_env="$(amount_env_for "$price_env")"
  lookup_key="$handle"

  echo ""
  echo "== $handle =="
  echo "Product: $name"
  echo "Mode: $mode"
  echo "Price env: $price_env"
  echo "Amount env: $amount_env"

  if [ -z "${!amount_env:-}" ]; then
    echo "Set $amount_env to the minor-unit amount before executing. Example: 2900 for \$29.00." >&2
    if [ "$DRY_RUN" = "0" ]; then
      exit 2
    fi
  fi

  if [ "$DRY_RUN" = "1" ]; then
    run_or_print stripe products search --live -d "query=metadata['launch_handle']:'$handle'"
    run_or_print stripe products create --live -d "name=$name" -d "metadata[launch_handle]=$handle" -d "metadata[launch_domain]=$DOMAIN"
    if [ "$mode" = "recurring" ]; then
      run_or_print stripe prices create --live -d "product=PRODUCT_ID" -d "currency=$CURRENCY" -d "unit_amount=${!amount_env:-AMOUNT}" -d "lookup_key=$lookup_key" -d "recurring[interval]=month" -d "metadata[env_var]=$price_env"
    else
      run_or_print stripe prices create --live -d "product=PRODUCT_ID" -d "currency=$CURRENCY" -d "unit_amount=${!amount_env:-AMOUNT}" -d "lookup_key=$lookup_key" -d "metadata[env_var]=$price_env"
    fi
    continue
  fi

  product_id="$(find_product "$handle")"
  if [ -z "$product_id" ]; then
    product_id="$(stripe products create --live -d "name=$name" -d "metadata[launch_handle]=$handle" -d "metadata[launch_domain]=$DOMAIN" | jq -r '.id')"
  fi

  price_id="$(find_price "$lookup_key")"
  if [ -z "$price_id" ]; then
    if [ "$mode" = "recurring" ]; then
      price_id="$(stripe prices create --live -d "product=$product_id" -d "currency=$CURRENCY" -d "unit_amount=${!amount_env}" -d "lookup_key=$lookup_key" -d "recurring[interval]=month" -d "metadata[env_var]=$price_env" | jq -r '.id')"
    else
      price_id="$(stripe prices create --live -d "product=$product_id" -d "currency=$CURRENCY" -d "unit_amount=${!amount_env}" -d "lookup_key=$lookup_key" -d "metadata[env_var]=$price_env" | jq -r '.id')"
    fi
  fi

  printf 'export %s=%q\n' "$price_env" "$price_id"
done

echo ""
if [ "$DRY_RUN" = "1" ]; then
  echo "Dry run only. To write live Stripe objects, set each *_AMOUNT env var plus STRIPE_LIVE_CONFIRM=$DOMAIN, then run: $0 --execute"
else
  echo "Catalog creation/update complete. Store the exported price ids in the production secret manager."
fi
