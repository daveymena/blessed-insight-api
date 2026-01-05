# ============================================
# STAGE 1: Build Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_OLLAMA_BASE_URL
ARG VITE_OLLAMA_MODEL
ARG VITE_USE_OLLAMA
ARG VITE_API_BASE_URL=/api
ARG VITE_GROQ_API_KEY
ARG VITE_GROQ_API_KEY_2
ARG VITE_GROQ_API_KEY_3
ARG VITE_GROQ_API_KEY_4
ARG VITE_MP_PUBLIC_KEY
ARG VITE_PAYPAL_CLIENT_ID

# Set environment variables for build
ENV VITE_OLLAMA_BASE_URL=$VITE_OLLAMA_BASE_URL
ENV VITE_OLLAMA_MODEL=$VITE_OLLAMA_MODEL
ENV VITE_USE_OLLAMA=$VITE_USE_OLLAMA
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GROQ_API_KEY=$VITE_GROQ_API_KEY
ENV VITE_GROQ_API_KEY_2=$VITE_GROQ_API_KEY_2
ENV VITE_GROQ_API_KEY_3=$VITE_GROQ_API_KEY_3
ENV VITE_GROQ_API_KEY_4=$VITE_GROQ_API_KEY_4
ENV VITE_MP_PUBLIC_KEY=$VITE_MP_PUBLIC_KEY
ENV VITE_PAYPAL_CLIENT_ID=$VITE_PAYPAL_CLIENT_ID

# Build frontend
RUN npm run build

# ============================================
# STAGE 2: Build Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
RUN npm ci

# Copy server source
COPY server/ ./

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ============================================
# STAGE 3: Production
# ============================================
FROM node:20-alpine

# Install nginx and supervisor
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy backend
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY --from=backend-builder /app/server/package.json ./server/
COPY --from=backend-builder /app/server/prisma ./server/prisma

# Create supervisor config
RUN mkdir -p /etc/supervisor.d
COPY <<EOF /etc/supervisor.d/app.ini
[supervisord]
nodaemon=true
logfile=/dev/stdout
logfile_maxbytes=0

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:backend]
command=node /app/server/dist/index.js
directory=/app/server
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

# Expose ports
EXPOSE 80 3000

# Start supervisor (runs both nginx and node)
CMD ["supervisord", "-c", "/etc/supervisor.d/app.ini"]
