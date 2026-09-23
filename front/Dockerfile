# Use an official Node.js runtime as the base image
FROM node:18.17.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 3000 for the Next.js application
EXPOSE 3000

# Start the application with the "npm run dev" command
CMD ["npm", "run", "dev"]
