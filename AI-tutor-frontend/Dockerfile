# ---------- STAGE 1: BUILD ----------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy files and install dependencies
COPY client/package*.json ./client/pnpm-lock.yaml ./client/
WORKDIR /app/client
RUN npm install

# Copy entire project and build it
COPY client/ .
RUN npm run dev

# ---------- STAGE 2: SERVE ----------
FROM nginx:stable-alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from builder
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Add custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
