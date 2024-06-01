# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy only the necessary files from the builder stage
COPY --from=builder /michi/dist ./dist
COPY --from=builder /michi/node_modules ./node_modules
COPY --from=builder /michi/package*.json ./

# Expose the port
EXPOSE 5001

# Start the app
CMD ["npm", "run", "start:prod"]