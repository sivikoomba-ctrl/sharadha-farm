# Copy of server/Dockerfile placed here so `gcloud run deploy --source .`
# from Source/ picks it up at the build context root. Render uses the same
# file via its rootDir=Source setting. Kept identical to server/Dockerfile;
# delete server/Dockerfile after Render decommission.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared types first
COPY shared/ ./shared/

# Copy server package files and install
COPY server/package.json server/package-lock.json* ./server/
WORKDIR /app/server
RUN npm install

# Copy server source and build
COPY server/ ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/shared ./shared/
COPY --from=builder /app/server/package.json /app/server/package-lock.json* ./server/
WORKDIR /app/server
RUN npm install --omit=dev

COPY --from=builder /app/server/dist ./dist/
COPY --from=builder /app/server/src/migrations ./src/migrations/
COPY --from=builder /app/server/src/seeds ./src/seeds/
COPY --from=builder /app/server/knexfile.ts ./knexfile.ts

# Install tsx for running knex migrations with TypeScript knexfile
RUN npm install tsx

EXPOSE 3001

CMD ["sh", "-c", "npx tsx node_modules/.bin/knex migrate:latest --knexfile knexfile.ts && node dist/server/src/index.js"]
