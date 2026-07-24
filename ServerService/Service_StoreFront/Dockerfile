FROM node:22.17-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY ./src ./src

RUN npm ci
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3005

CMD ["node", "dist/index.js"]
