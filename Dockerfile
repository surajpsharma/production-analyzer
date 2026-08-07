# Use a base image with both Node.js and Python
FROM nikolaik/python-nodejs:python3.11-nodejs20-slim

WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm ci

# Copy requirements.txt and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose Next.js default port
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"]
