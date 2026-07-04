FROM node:22-slim

WORKDIR /app

# Install all deps (including dev for building)
COPY package*.json ./
RUN npm ci

# Copy source and build the frontend
COPY . .
RUN npm run build

EXPOSE 8080
ENV PORT=8080

CMD ["npx", "tsx", "server.ts"]
