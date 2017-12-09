# Angular-ngrx Demo

## What is this

Write less code for managing the ngrx redux pattern for multiple entity models in an app.

## Why use it

Managing state can be challenging. The Redux pattern that ngrx implements helps manage state in
Angular apps by adding reducers, actions, states, effects, dispatchers, and selectors. This library
aims to demonstrate a technique that will reduce the boilerplate to implement ngrx.

TODO: Link to [FAQ](./docs/faq.md)

## How

TODO: Explain how to implement this in a new Angular CLI app

### Requirements

1. Install the Angular CLI

   ```bash
   npm install -g @angular/cli
   ```

1. Create a
   [CosmosDB instance](https://docs.microsoft.com/en-us/azure/cosmos-db/tutorial-develop-mongodb-nodejs-part4)

### Getting Started

1. Clone this repository

   ```bash
   git clone https://github.com/johnpapa/angular-ngrx.git
   cd angular-ngrx
   ```

1. Install the npm packages

   ```bash
   npm i
   ```

### Running the app

1. Build the Angular app and launch the node server

   ```bash
   npm run build
   npm run dev
   ```

1. Open the browser to <http://localhost:3001>

### Docker

* Install and run [Docker](https://www.docker.com/community-edition)

#### Environment file

Create an empty file named `.env` in the root of the app. We'll fill this in later.

#### Docker Compose with Debugging

Create the Docker image and run it locally. This commands uses `docker-compose` to build the image
and run the container.

This opens port `9229` for debugging.

```bash
npm run docker-debug
open http://localhost:3001
```

Open VS Code, launch the `Docker: Attach to Node` debugging profile

### Optional Database

NODE_ENV=development

SERVER_PORT=3001 PUBLICWEB=./publicweb

COSMOSDB_ACCOUNT=my-heroes-cosmos COSMOSDB_DB=heroes-db
COSMOSDB_KEY=fa1fKW9zDtxLcWgNqhtCdxeTT56ohy9fBVIpxDupSYuOEKl8gD3uPxgNqsenhRrrysSQGMZoWq9F46oRPlOAxw==
COSMOSDB_PORT=10255

Out of the box you can run the demo with an in memory data service instead of a live database. If
you wish to use a database, you can set up a local mongo server or a remote CosmosDB/MongoDB server
in the cloud.

1. Configure Cosmos DB server settings

   Copy the contents from `.env.example` into `.env`. Replace the values with your specific
   configuration. Don't worry, this file is in the `.gitignore` so it won't get pushed to github.

   ```javascript
   NODE_ENV=development

   SERVER_PORT=3001
   PUBLICWEB=./publicweb

   COSMOSDB_ACCOUNT=your_cosmos_account
   COSMOSDB_DB=your_cosmos_db
   COSMOSDB_KEY=your_cosmos_key
   COSMOSDB_PORT=10255
   ```

## Problems or Suggestions

[Open an issue here](https://github.com/johnpapa/angular-ngrx/issues)
