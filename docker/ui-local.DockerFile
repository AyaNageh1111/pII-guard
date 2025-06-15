FROM node:22-alpine AS ui-builder-local
ARG VITE_PII_DETECTOR_API_ENDPOINT
ENV VITE_PII_DETECTOR_API_ENDPOINT=$VITE_PII_DETECTOR_API_ENDPOINT
RUN mkdir -p /app/
WORKDIR /app/
COPY ./ui /app/
RUN npm install
RUN npm run build

FROM nginx:alpine AS ui-local
RUN mkdir -p /app/
COPY --from=ui-builder-local /app/dist /usr/share/nginx/html
EXPOSE 80
