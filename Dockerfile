FROM node:18-alpine as builder

WORKDIR /app

COPY . ./

RUN npm ci \
  && npm run build

FROM node:18-alpine

ENV PORT=80 \
  STORAGE_PATH=/files \
  NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY --from=builder /app/dist ./

EXPOSE $PORT

CMD [ "node", "index.js" ]
