# Database Setup Guide

## Overview

This project uses a PostgreSQL database running in Docker. This guide will help you set up and run the database locally.

## Prerequisites

- Docker and Docker Compose installed on your machine
- Node.js and npm installed for running the server

## Setup Instructions

### 1. Start the PostgreSQL Database

Run the following command in the project root directory:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following configuration:
- Database name: zappyhealth
- Username: postgres
- Password: postgres
- Port: 5432 (mapped to your local machine)

### 2. Database Schema

The database schema is automatically created when the container starts up. The initialization scripts are located in the `init-scripts` directory:

- `01-schema.sql`: Creates the database tables and relationships
- `02-sample-data.sql`: Populates the database with sample data

### 3. Start the API Server

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

Start the server:

```bash
npm run dev
```

The API server will run on port 3001 by default.

### 4. Configure the Frontend

The frontend is already configured to connect to the API server at `http://localhost:3001/api` through the `.env` file.

## Database Structure

The database includes the following main tables:

- `user`: Application users (providers, admins)
- `client_record`: Patient information
- `order`: Patient orders
- `products`: Available products
- `services`: Available services
- `pharmacies`: Pharmacy information
- `notes`: Patient notes
- `session`: Patient sessions
- `tag`: Tags for categorization

## Connecting to the Database

You can connect to the database using any PostgreSQL client with these credentials:

- Host: localhost
- Port: 5432
- Database: zappyhealth
- Username: postgres
- Password: postgres

## Troubleshooting

### Viewing Docker Logs

To view the logs from the PostgreSQL container:

```bash
docker logs zappyhealth_postgres
```

### Restarting the Container

If you need to restart the database container:

```bash
docker-compose down
docker-compose up -d
```

### Resetting the Database

To completely reset the database (this will delete all data):

```bash
docker-compose down -v
docker-compose up -d
```

This removes the volume containing the database data and recreates it from scratch.
