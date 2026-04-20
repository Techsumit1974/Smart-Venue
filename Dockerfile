# ---- Build Stage ----
FROM node:18-alpine AS builder
WORKDIR /app

# 1. Copy dependency files first for Docker caching
COPY package*.json ./
COPY client/package*.json ./client/

# 2. Install dependencies BUT ignore the postinstall script for now
RUN npm install --ignore-scripts

# 3. Copy ALL application files (including client/public/index.html)
COPY . .

# 4. Now that all files are here, manually run the build
RUN npm run build


# ---- Production Stage ----
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# 1. Copy package files
COPY package*.json ./

# 2. Install production dependencies (must ignore scripts so it doesn't try to build React again!)
RUN npm install --omit=dev --ignore-scripts

# 3. Copy the built React app and server code from the builder stage
COPY --from=builder /app/client/build ./client/build
COPY server ./server

EXPOSE 8080
CMD ["node", "server/index.js"]