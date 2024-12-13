# xtb-bot

## Application endpoints

- **Frontend**: http://localhost:2000/
- **Backend**: http://localhost:8008/

These ports are pre-configured and customizable through the .env file.

## How to run

### Using Docker (Only headless)

1. Install [Docker](https://docs.docker.com/get-docker/)

2. Build and run the container:
   ```bash
   docker compose up --build
   ```

### Running locally (Headless/full mode in `.env`)

1. Install [Node.js](https://nodejs.org/en/download/package-manager)

2. Install the required dependencies
   ```bash
   npm install
   ```

3. Start the app
   ```bash
   npm run start
   ```
