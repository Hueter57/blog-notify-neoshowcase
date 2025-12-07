# Dockerfile for Hubot
FROM node:22

WORKDIR /app
COPY . .
RUN npm install

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
RUN npx prisma migrate dev --name init
RUN npx prisma generate

EXPOSE 8080

CMD ["npm", "start"]