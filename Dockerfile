FROM node:14 AS build-env
ADD . /app
WORKDIR /app
RUN npm install

FROM gcr.io/distroless/nodejs:14
COPY --from=build-env /app /app
WORKDIR /app
ENV PORT=8080
EXPOSE 8080
CMD ["src/index.js"]