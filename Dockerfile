# Multi-stage lightweight production Dockerfile for NourishNet
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
RUN npm install

# Build args and environment for Vite frontend
ARG VITE_DEMO_MODE=true
ARG VITE_API_URL=http://localhost:3001
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE
ENV VITE_API_URL=$VITE_API_URL

# Copy application source files
COPY . .

# Build production frontend assets into dist/
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV PUBLIC_PORT=3001
ENV DEMO_MODE=true
ENV VITE_DEMO_MODE=true

# Copy runtime dependencies and built static assets
COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/src ./src
COPY --from=builder /app/index.html ./index.html
COPY --from=builder /app/vite.config.js ./vite.config.js

# Internal container port
EXPOSE 3000

# Health check - IPv4 127.0.0.1 avoids IPv6 resolution issues in Alpine
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start authoritative NourishNet server
CMD ["node", "server.js"]
