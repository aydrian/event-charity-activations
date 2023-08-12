#!/bin/sh
# Check that local CockroachDB is running
# command -v cockroachdb >/dev/null 2>&1 || { echo >&2 "Local CockroachDB Node isn't running.\nPlease first execute start_dbserver.sh in another terminal."; exit 1; }
echo "▵ Creating the database schema using Prisma"
npx prisma db push

echo "🌱 Seeding the database using Prisma"
npx prisma db seed

echo "🚰 Creating the change feed"
npx prisma db execute --file ./prisma/sql/set_cluster_settings.sql
npx prisma db execute --file ./prisma/sql/create_changefeed_dev.sql

echo "🎉 Your local CockroachDB server is ready!"
echo "Use connection string: postgresql://root@localhost:26257/charity_activations"
echo "Connect using cockroach sql --insecure -d charity_activations"