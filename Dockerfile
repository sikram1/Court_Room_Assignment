# ---------- BASE IMAGE ----------
FROM node:22-alpine AS base
WORKDIR /app

# Ensure reliable npm networking
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retry-maxtimeout 60000
RUN npm config set fetch-retries 5

# ---------- INSTALL DEPENDENCIES ----------
COPY package*.json ./
RUN npm install

# ---------- COPY SOURCE ----------
COPY . .

# ---------- GENERATE PRISMA CLIENT ----------
RUN npx prisma generate

# ---------- BUILD NEXT.JS ----------
RUN npm run build

# ---------- RUNTIME STAGE ----------
FROM node:22-alpine AS runner
WORKDIR /app

# Copy built app from base
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
