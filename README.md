# Mood

Mood is a self-hostable and fully anonymous polling platform for teams.

## Overview

This platform allows an administrator to create polling campaigns to gauge team morale. The main features are:

-   **Administrator Dashboard**: A central interface to create, manage, and view campaigns.
-   **Anonymous Participation**: Voting is 100% anonymous to ensure honest feedback. No personal data is tracked.
-   **Campaign Links**: Generate unique links for each manager or team to distribute.
-   **Results Visualization**: Analyze feedback through a clean dashboard with filters by campaign and date.

## System Requirements

To run this application, you need a machine with:
-   [Git](https://git-scm.com/)
-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)

## Installation and Setup

Follow these steps to deploy the application.

### 1. Clone the Repository

Clone the project files onto your server or local machine.

```bash
git clone https://github.com/Priveetee/Mood.git
cd Mood
```

### 2. Configure the Application

The application is configured using an `.env` file. First, copy the example file:

```bash
cp .env.example .env
```

Next, open the `.env` file with a text editor and set the following variables:

-   **`POSTGRES_USER`**, **`POSTGRES_PASSWORD`**, **`POSTGRES_DB`**:
    Define the username, a strong password, and the name for your database.
-   **`POSTGRES_PORT`**:
    The port on your host machine that will connect to the database (e.g., `5450`).
-   **`JWT_SECRET`**:
    A long, random secret string for session security. You can generate one with: `openssl rand -base64 32`.
-   **`INVITATION_KEY`**:
    A secret key required to create new administrator accounts (after the first one).
-   **`NEXT_PUBLIC_APP_URL`**:
    The public URL where your application will be accessible (e.g., `http://localhost:3000` or `http://your-domain.com`).

**Important:** The `DATABASE_URL` is generated from the other variables. Ensure the host is set to `postgres` to allow the application container to communicate with the database container.

### 3. Run the Application

Use Docker Compose to build and start the application. This command will create the necessary images, start the services, and apply database migrations automatically.

```bash
docker compose up --build -d
```

The application will be available at the URL you configured in `NEXT_PUBLIC_APP_URL` (by default, [http://localhost:3000](http://localhost:3000)).

### 4. Stopping the Application

To stop the application, run:

```bash
docker compose down
```

### 5. Updating the Application

To update to the latest version:

```bash
# Get the latest code
git pull origin main

# Rebuild the application image and restart the services
docker compose up --build -d
```
