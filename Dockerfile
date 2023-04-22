FROM node:18-alpine AS builder
ENV NODE_ENV=production

WORKDIR /app
COPY . .

RUN yarn install
RUN yarn build

RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune

FROM node:18-alpine AS runner
ENV NODE_ENV=production

WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

EXPOSE 3000
CMD ["node", "dist/index.js"]