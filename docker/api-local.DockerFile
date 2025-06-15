FROM node:22-bullseye AS api-local
RUN mkdir -p /app/
WORKDIR /app/
ADD ./api .
RUN npm install
EXPOSE 80
CMD ["npm", "run", "start"]

