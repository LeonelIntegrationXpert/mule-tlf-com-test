#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-mule-tlf-com-test}"
API_MAIN_FILE="${API_MAIN_FILE:-api.raml}"
API_VERSION="${API_VERSION:-v1}"
EXCHANGE_ASSET_ID="${EXCHANGE_ASSET_ID:-mule-tlf-com-test}"
EXCHANGE_ASSET_NAME="${EXCHANGE_ASSET_NAME:-Mule TLF COM Test}"
EXCHANGE_ASSET_DESCRIPTION="${EXCHANGE_ASSET_DESCRIPTION:-API RAML de laboratório para Release Flow Guardian.}"
EXCHANGE_ASSET_VERSION="${EXCHANGE_ASSET_VERSION:-1.0.0}"
EXCHANGE_ZIP="${EXCHANGE_ZIP:-dist/${APP_NAME}-exchange.zip}"
EXCHANGE_STATUS="${EXCHANGE_STATUS:-published}"
EXCHANGE_KEYWORDS="${EXCHANGE_KEYWORDS:-mulesoft,raml,release-flow-guardian,api-led,design-center}"
CONTACT_NAME="${CONTACT_NAME:-Release Flow Guardian}"
CONTACT_EMAIL="${CONTACT_EMAIL:-leonel.d.porto@accenture.com}"
ANYPOINT_HOST="${ANYPOINT_HOST:-anypoint.mulesoft.com}"

missing=0
validate_var() {
  local name="$1"
  local value="${!name:-}"
  if [ -z "$value" ]; then
    echo "❌ Variável obrigatória ausente: $name"
    missing=1
  else
    echo "✅ $name configurada"
  fi
}

validate_var ANYPOINT_CLIENT_ID
validate_var ANYPOINT_CLIENT_SECRET
validate_var ANYPOINT_ORG
if [ "$missing" -eq 1 ]; then
  echo "Corrija as variáveis antes de publicar no Exchange."
  exit 1
fi

if [ ! -f "$EXCHANGE_ZIP" ]; then
  echo "❌ Pacote não encontrado: $EXCHANGE_ZIP"
  echo "Execute antes: npm run package:exchange"
  exit 1
fi

GROUP_ID="${EXCHANGE_GROUP_ID:-$ANYPOINT_ORG}"
ASSET_IDENTIFIER="${GROUP_ID}/${EXCHANGE_ASSET_ID}/${EXCHANGE_ASSET_VERSION}"
PROPERTIES_JSON=$(printf '{"apiVersion":"%s","mainFile":"%s","contactName":"%s","contactEmail":"%s"}' "$API_VERSION" "$API_MAIN_FILE" "$CONTACT_NAME" "$CONTACT_EMAIL")
FILES_JSON=$(printf '{"raml.zip":"%s"}' "$EXCHANGE_ZIP")

echo "================================================================================"
echo "🔐 Configurando Anypoint CLI v4"
echo "================================================================================"
anypoint-cli-v4 conf client_id "$ANYPOINT_CLIENT_ID"
anypoint-cli-v4 conf client_secret "$ANYPOINT_CLIENT_SECRET"
anypoint-cli-v4 conf organization "$ANYPOINT_ORG"
anypoint-cli-v4 conf host "$ANYPOINT_HOST"
# Exchange/Design Center assets não exigem ANYPOINT_ENV. Ambiente entra depois para Runtime/API Manager.

echo "================================================================================"
echo "🧪 Testando autenticação Anypoint"
echo "================================================================================"
anypoint-cli-v4 account:environment:list --output json >/dev/null

echo "================================================================================"
echo "🚀 Publicando RAML no Exchange"
echo "================================================================================"
echo "Asset Identifier: $ASSET_IDENTIFIER"
echo "Asset Name:       $EXCHANGE_ASSET_NAME"
echo "Asset Version:    $EXCHANGE_ASSET_VERSION"
echo "API Version:      $API_VERSION"
echo "Main File:        $API_MAIN_FILE"
echo "Package:          $EXCHANGE_ZIP"
echo "Status:           $EXCHANGE_STATUS"

anypoint-cli-v4 exchange:asset:upload "$ASSET_IDENTIFIER"   --name "$EXCHANGE_ASSET_NAME"   --description "$EXCHANGE_ASSET_DESCRIPTION"   --type rest-api   --properties "$PROPERTIES_JSON"   --files "$FILES_JSON"   --status "$EXCHANGE_STATUS"   --keywords "$EXCHANGE_KEYWORDS"

echo "✅ Publicação finalizada no Exchange"
