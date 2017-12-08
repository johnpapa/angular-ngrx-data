# Client App
FROM johnpapa/angular-cli as client-app
LABEL authors="John Papa"
WORKDIR /usr/src/app
COPY ["package.json", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent
COPY . .
RUN ng build --prod

# Node server
FROM node:8.9-alpine as node-server
WORKDIR /usr/src/app
COPY ["package.json", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY /src/server /usr/src/app

# Final image
FROM node:8.9-alpine
WORKDIR /usr/src/app
COPY --from=node-server /usr/src /usr/src
COPY --from=client-app /usr/src/app/dist ./
EXPOSE 3001
CMD ["node", "index.js"]
