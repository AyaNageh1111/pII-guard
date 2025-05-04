FROM node:22-alpine AS pii-detector-api
RUN mkdir -p /app/
WORKDIR /app/
ADD ./api .
RUN npm install
EXPOSE 80
CMD ["npm", "start"]

