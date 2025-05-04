FROM node:22-alpine AS ui-builder
RUN mkdir -p /app/
WORKDIR /app/
COPY ./ui /app/
RUN npm install
RUN npm run build

FROM nginx:alpine AS pii-detector-ui
RUN mkdir -p /app/
COPY --from=ui-builder /app/dist /usr/share/nginx/html
EXPOSE 80
