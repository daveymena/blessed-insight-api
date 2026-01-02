# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
# Build arguments for environment variables
ARG VITE_OLLAMA_BASE_URL
ARG VITE_OLLAMA_MODEL
ARG VITE_USE_OLLAMA
ARG VITE_API_BASE_URL
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

# Build the app
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
