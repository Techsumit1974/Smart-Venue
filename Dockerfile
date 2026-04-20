# ---- Build Stage ----
FROM node:18-alpine AS builder
WORKDIR /app

# Copy all files first
COPY . .

# Install root + client deps and build
RUN npm install
RUN cd client && npm install && npm run build

# ---- Production Stage ----
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/client/build ./client/build
COPY server ./server

EXPOSE 8080
CMD ["node", "server/index.js"]