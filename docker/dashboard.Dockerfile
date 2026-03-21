FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN NX_REJECT_DYNAMIC_CHANGES=true NX_DAEMON=false CI=true npx nx build dashboard -c production

FROM nginx:alpine
COPY --from=builder /app/dist/apps/dashboard /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
