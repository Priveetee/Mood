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
Please consider that in this .env.example I give you an example of a good .env, do note use in Production since it is publicly available !

You can generate a good .env using this command on Linux :

```bash
openssl rand -hex 32
```
If you you have an output with a special character like =! or other it might break since bash would read until the for example = so I advise you to not use special character or surround it with ""

Example :

```bash
24cbe023aeb3bddff2c2bdf0cdb317f12d397ac=53f85a68968eda158aa900b0
```

Bash would read until 24cbe023aeb3bddff2c2bdf0cdb317f12d397ac and consider =53f85a68968eda158aa900b0 another sentence.

```bash
24cbe023aeb3bddff2c2bdf0cdb317f12d397ac153f85a68968eda158aa900b0
```
Bash would read the entirety !

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
## Acknowledgements

This application was built using fantastic open-source tools and resources. Special thanks to:

-   [**shadcn/ui**](https://ui.shadcn.com/): For the component library that forms the basis of the user interface.
-   [**ReactBitsDev**](https://reactbits.dev/): For providing excellent UI patterns and inspiration.
