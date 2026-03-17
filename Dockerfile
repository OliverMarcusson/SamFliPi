# Stage 1: Build
FROM oven/bun:1-alpine AS builder

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 2: Serve
FROM nginx:1.27-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

ENV NGINX_ENVSUBST_FILTER="EVENTS_API_SECRET|MUNIN_BASE_URL"

COPY nginx.conf /etc/nginx/templates/samflip.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
