## Requirements

1. Install the Angular CLI

    ```bash
    npm install -g @angular/cli
    ```

1. Create a [CosmosDB instance](https://docs.microsoft.com/en-us/azure/cosmos-db/tutorial-develop-mongodb-nodejs-part4)

## Getting Started

1. Clone this repository

    ```bash
    git clone https://github.com/johnpapa/angular-ngrx.git
    cd angular-ngrx
    ```

1. Install the npm packages

    ```bash
    npm i
    ```

1. Configure Cosmos DB server settings

    Create a file with the following name and location `.env` and copy the contents from `.env.example` into it. Replace the values with your specific configuration. Don't worry, this file is in the `.gitignore` so it won't get pushed to github.

    ```javascript
    NODE_ENV=development

    SERVER_PORT=3001
    PUBLICWEB=./publicweb

    COSMOSDB_ACCOUNT=your_cosmos_account
    COSMOSDB_DB=your_cosmos_db
    COSMOSDB_KEY=your_cosmos_key
    COSMOSDB_PORT=10255
    ```

## Running the app

1. Build the Angular app and launch the node server

    ```bash
    npm run start-fresh
    ```

1. Open the browser to http://localhost:3001

## Docker

- Install and run [Docker](https://www.docker.com/community-edition)

### Docker Compose

Create the Docker image that you can `docker push` to a registry. This commands uses `docker-compose` to build the image and run the container. This image expects environment variables to be set in whichever cloud provider you push to.

```bash
npm run docker-up
```

### Docker Compose with Debugging

Create the Docker image and run it locally. This commands uses `docker-compose` to build the image and run the container.

This uses your `server/env/developmentjs` settings and opens port `9229` for debugging.

```bash
npm run docker-debug
open http://localhost:3001
```

Open VS Code, launch the `Docker: Attach to Node` debugging profile

### Docker Run

- Install and run [Docker](https://www.docker.com/community-edition)
- Create the Docker image and run it locally
- We recommend using the `npm run docker-debug` instead of this, as it is easier and more powerful

```bash
# build the image
dockerImage=angular-ngrx
port=3001
docker build -t $dockerImage .

# create and run the container
docker run -d -p $port:3001 -p 9229:9229 -e "NODE_ENV=development" $dockerImage

open http://localhost:$port
```

## Problems or Suggestions

[Open an issue here](https://github.com/johnpapa/angular-ngrx/issues)
