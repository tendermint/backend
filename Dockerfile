FROM node:14 AS build-env
ADD src /app/src
ADD assets.json /app/assets.json
ADD lib /app/lib
ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json
ADD index.js /app/index.js

WORKDIR /app
RUN npm install
ENV PORT=8080
EXPOSE 8080
CMD ["src/index.js"]
