#!/bin/sh
set -eu

echo "[nav] building site from ${NAV_SETTINGS_CONFIG:-config/settings.yml} and ${NAV_NAVIGATION_CONFIG:-config/navigation.yml}"
npm run build

echo "[nav] serving dist on ${HOST:-0.0.0.0}:${PORT:-4321}"
exec npm run start
