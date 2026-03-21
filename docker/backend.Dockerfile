FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

FROM base AS builder
COPY . .
ARG APP_NAME
RUN NX_REJECT_DYNAMIC_CHANGES=true NX_DAEMON=false CI=true npx nx build ${APP_NAME} -c production

FROM node:20-alpine
WORKDIR /app
ARG APP_NAME
COPY --from=builder /app/dist/apps/${APP_NAME} .
# Copy node_modules from base to ensure dependencies are available
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "main.js"]
