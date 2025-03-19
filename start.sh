#!/bin/bash

set -e

set -a
. .env
set +a

# @todo: enable SSL
mariadb -h "${DB_HOST:-127.0.0.1}" -P "$DB_PORT" -u "root" -p"${DB_ROOT_PASSWORD}" --ssl-verify-server-cert=false -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"

npm install && npm run codegen && npm start
