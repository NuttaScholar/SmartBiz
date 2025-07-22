FROM node:22.17-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

COPY ./src ./src

RUN npm ci

COPY .env .

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]