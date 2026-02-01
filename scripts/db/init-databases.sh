#!/bin/bash
# This script creates additional databases for microservices
# It runs automatically when PostgreSQL container starts for the first time

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create legal_core database if it doesn't exist
    SELECT 'CREATE DATABASE legal_core'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'legal_core')\gexec

    -- Grant all privileges to the main user
    GRANT ALL PRIVILEGES ON DATABASE legal_core TO $POSTGRES_USER;
EOSQL

echo "Additional databases initialized successfully!"
