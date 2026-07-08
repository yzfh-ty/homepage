# Dynamic build image: rebuilds the static Astro site every time the container starts.
FROM node:22-alpine

WORKDIR /app

ENV NAV_NAVIGATION_CONFIG=/app/config/navigation.yml
ENV NAV_SETTINGS_CONFIG=/app/config/settings.yml
ENV HOST=0.0.0.0
ENV PORT=4321
ENV DIST_DIR=/app/dist

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

COPY docker/entrypoint.sh /usr/local/bin/nav-entrypoint.sh
RUN chmod +x /usr/local/bin/nav-entrypoint.sh

EXPOSE 4321

STOPSIGNAL SIGTERM

ENTRYPOINT ["/usr/local/bin/nav-entrypoint.sh"]
