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

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment for build optimizations
ENV NODE_ENV=production
# Enable dev tools in the build (baked into frontend bundle)
ENV VITE_ENABLE_DEV_TOOLS=true

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

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Copy static assets and other required files
COPY --from=builder /app/attached_assets ./attached_assets
COPY --from=builder /app/shared ./shared
# Note: server/prompts directory removed - prompts are inline in aiService.ts

# Set ownership to non-root user
RUN chown -R evalia:nodejs /app

# Switch to non-root user
USER evalia

# Environment configuration
ENV NODE_ENV=production
ENV PORT=4000

# Dev tools lockdown (enabled for this deployment as requested)
ENV VITE_ENABLE_DEV_TOOLS=true
ENV ENABLE_DEV_TOOLS=true
ENV ENABLE_AI_MONITORING=false

# Expose the application port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/healthz || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application with source maps for better error traces
CMD ["node", "--enable-source-maps", "dist/index.js"]

