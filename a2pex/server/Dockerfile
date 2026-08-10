# Production image for the A2PEX Kits API.
# Build: docker build -t a2pex-api .
# Run:   docker run -p 5000:5000 --env-file .env a2pex-api

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better Docker layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
