# Builder stage
FROM node:20.9 as builder

WORKDIR /usr/src/app

COPY . .

COPY .env ./

# Install dependencies
RUN npm ci --quiet

COPY prisma/ ./

# Run Prisma migrations (ensure database is accessible at this point)
#RUN npx prisma migrate deploy
# Build the application
RUN npm run build

# Production stage
FROM node:20.9

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --quiet

# Copy built files and generated Prisma client from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY prisma/ ./

# Use an unprivileged user for better security
USER node

EXPOSE 8080

CMD npx prisma migrate deploy && npm run start:prod

# Start the application in production mode
# CMD ["npm", "run", "start:prod"]