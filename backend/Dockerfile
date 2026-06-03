# Use the official Node.js 20 lightweight Alpine image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's caching mechanism
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the backend source files
COPY . .

# Expose port 8080 (the port Cloud Run expects and uses by default)
EXPOSE 8080

# Start the Express server
CMD [ "npm", "start" ]
