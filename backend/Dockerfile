
FROM node:22-alpine

WORKDIR /app

# Install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY --chown=node:node src ./src

# Production configuration
ENV NODE_ENV=production
ENV PORT=4000

# Run as non-root user
USER node

EXPOSE 4000

# Check whether the backend health endpoint responds
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
