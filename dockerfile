
FROM node:20-alpine

WORKDIR /app


COPY package*.json ./
COPY prisma ./prisma/


RUN npm ci


COPY . .


RUN npx prisma generate


EXPOSE 3001


CMD ["sh", "-c", "npx prisma migrate dev --name init && npm run start:dev"]