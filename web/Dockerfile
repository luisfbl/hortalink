FROM node:lts-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/web

COPY web/.env .env

RUN pnpm install
RUN pnpm build

EXPOSE 4321
CMD ["pnpm", "start"]