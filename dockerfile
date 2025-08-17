# Use Node.js v22 (as you mentioned earlier)
FROM node:22-bullseye

# Set working directory in the container
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies (use ci if lock file exists)
RUN npm ci || npm install

# Copy the rest of your project
COPY . .

# Expose a port if your app listens on one (optional)
# EXPOSE 3000

# Default command to run your Node app
CMD ["node", "app.js"]
