FROM node:lts-alpine

RUN npm install -g pnpm

WORKDIR /usr/src/app
COPY . .

RUN pnpm install
CMD ["pnpm", "recursive", "run", "start"]