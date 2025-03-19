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

1. Install [Node.js](https://nodejs.org/en/download/package-manager) and [MariaDB](https://mariadb.com/kb/en/getting-installing-and-upgrading-mariadb/)

2. Start the app:
   ```bash
   ./start.sh
   ```
