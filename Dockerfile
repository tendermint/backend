FROM node:14 AS build-env
ADD . /app
WORKDIR /app
RUN npm install
ENV PORT=8080
EXPOSE 8080
CMD ["src/index.js"]
