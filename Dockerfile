# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Evalia Survey - Production Dockerfile
# Multi-stage build for optimal image size and security
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ════════════════════════════════════════════════════════════════════════════
# Stage 1: Dependencies
# ════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS deps

WORKDIR /app

# Install build dependencies for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# ════════════════════════════════════════════════════════════════════════════
# Stage 2: Builder
# ════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS builder

WORKDIR /app

# Build argument for enabling dev tools in production builds
# Pass --build-arg VITE_ENABLE_DEV_TOOLS=true to enable
ARG VITE_ENABLE_DEV_TOOLS=false
ENV VITE_ENABLE_DEV_TOOLS=$VITE_ENABLE_DEV_TOOLS

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment for build optimizations
ENV NODE_ENV=production

# Build the application (Vite frontend + esbuild backend)
RUN npm run build

# ════════════════════════════════════════════════════════════════════════════
# Stage 3: Production Runner
# ════════════════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 evalia

# Copy package files for production dependencies
COPY package.json package-lock.json ./

# Install all dependencies (include dev deps needed for tooling referenced in bundle)
RUN npm ci && npm cache clean --force

# Copy built assets from builder (includes server bundle and frontend in dist/public)
COPY --from=builder /app/dist ./dist

# Copy static assets and other required files
COPY --from=builder /app/attached_assets ./attached_assets
COPY --from=builder /app/shared ./shared

# Set ownership to non-root user
RUN chown -R evalia:nodejs /app

# Switch to non-root user
USER evalia

# Environment configuration
ENV NODE_ENV=production
ENV PORT=4000

# Expose the application port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/healthz || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application with source maps for better error traces
CMD ["node", "--enable-source-maps", "dist/index.js"]
