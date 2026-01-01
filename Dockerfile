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
ARG VITE_OLLAMA_BASE_URL=https://ollama-ollama.ginee6.easypanel.host
ARG VITE_OLLAMA_MODEL=gemma2:2b
ARG VITE_USE_OLLAMA=true
ARG VITE_GROQ_API_KEY=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
ARG VITE_GROQ_API_KEY_2=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
ARG VITE_GROQ_API_KEY_3=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
ARG VITE_GROQ_API_KEY_4=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

# Set environment variables for build
ENV VITE_OLLAMA_BASE_URL=$VITE_OLLAMA_BASE_URL
ENV VITE_OLLAMA_MODEL=$VITE_OLLAMA_MODEL
ENV VITE_USE_OLLAMA=$VITE_USE_OLLAMA
ENV VITE_GROQ_API_KEY=$VITE_GROQ_API_KEY
ENV VITE_GROQ_API_KEY_2=$VITE_GROQ_API_KEY_2
ENV VITE_GROQ_API_KEY_3=$VITE_GROQ_API_KEY_3
ENV VITE_GROQ_API_KEY_4=$VITE_GROQ_API_KEY_4

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
