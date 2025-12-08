FROM node:22-alpine

WORKDIR /app
COPY . .
# ビルドを通すためのダミー値を設定 (Prisma用)
ENV DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"
RUN npm install

RUN npx prisma generate


EXPOSE 8080
RUN npx prisma migrate deploy

CMD ["npm", "start"]