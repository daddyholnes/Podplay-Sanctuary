# Use Node.js 20 alpine as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (Cloud Run will set PORT env var)
EXPOSE 8080

# Start the application
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
