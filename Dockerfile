FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate


EXPOSE 8080
RUN npx prisma migrate deploy

CMD ["npm", "start"]