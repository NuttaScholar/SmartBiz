FROM node:22.17-alpine AS build

WORKDIR /app

ARG VITE_HOST=localhost
ARG VITE_PORT_ACCESS=3000
ARG VITE_PORT_LOGIN=3001
ARG VITE_PORT_STORE=3002
ARG VITE_PORT_STOCK=3003
ARG VITE_PORT_BILL=3004
ARG VITE_PORT_STOREFRONT=3005
ARG VITE_PORT_MINIO=9000

ENV VITE_HOST=${VITE_HOST}
ENV VITE_PORT_ACCESS=${VITE_PORT_ACCESS}
ENV VITE_PORT_LOGIN=${VITE_PORT_LOGIN}
ENV VITE_PORT_STORE=${VITE_PORT_STORE}
ENV VITE_PORT_STOCK=${VITE_PORT_STOCK}
ENV VITE_PORT_BILL=${VITE_PORT_BILL}
ENV VITE_PORT_STOREFRONT=${VITE_PORT_STOREFRONT}
ENV VITE_PORT_MINIO=${VITE_PORT_MINIO}

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY index.html ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:1.27-alpine AS runtime

ENV NGINX_PORT=80

COPY nginx.conf /etc/nginx/nginx.conf
COPY templates/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${NGINX_PORT}/" || exit 1
