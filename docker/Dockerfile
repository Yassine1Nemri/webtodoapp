# Multi-stage build for security and efficiency
FROM node:18-alpine AS builder

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (only production)
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY src/ ./src/
COPY monitoring/ ./monitoring/

# Security: Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Production stage
FROM node:18-alpine AS production

# Security: Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy from builder stage
COPY --from=builder --chown=nextjs:nodejs /app .

# Security: Use non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node monitoring/health-check.js || exit 1

# Security: Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]

# Security labels
LABEL maintainer="yassine.nemri@esprit.tn"
LABEL version="1.0.0"
LABEL description="Secure Todo App with DevSecOps practices"