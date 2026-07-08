#!/bin/bash
set -e

# Ce script tourne automatiquement au premier démarrage du conteneur Postgres.
# Il crée une base séparée pour Keycloak (bonne pratique : ne jamais mélanger
# les données applicatives et les données du serveur d'identité).

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE keycloak;
EOSQL
