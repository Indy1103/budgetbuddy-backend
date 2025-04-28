
FROM node:18-alpine

# Create and set working directory inside the container
WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port that the API server listens on
EXPOSE 4000

# Default command to start the application (overridden in dev by docker-compose)
CMD ["npm", "start"]