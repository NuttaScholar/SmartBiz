FROM node:22.17-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

COPY ./src ./src

RUN npm ci

RUN npm run build

EXPOSE 3003

CMD ["node", "dist/index.js"]