# Mood

Mood is a self-hostable and fully anonymous polling platform for teams.

## Overview

This platform allows an administrator to create polling campaigns to gauge team morale. The main features are:

-   **Administrator Dashboard**: A central interface to create, manage, and view campaigns.
-   **Anonymous Participation**: Voting is 100% anonymous to ensure honest feedback.
-   **Segmented Links**: Generate unique links for each manager or team to distribute.
-   **Results Visualization**: Analyze feedback through a clean dashboard with filters and CSV export.

## Documentation

For a full guide on usage, development, and architecture, please visit the **[Official Documentation Website](https://priveetee.github.io/Docs_Mood/)**.

## Tech Stack

-   **Framework**: Next.js 15 (App Router) with Turbopack
-   **API**: tRPC
-   **Database**: PostgreSQL with Prisma ORM
-   **Authentication**: Better Auth
-   **UI**: Tailwind CSS with shadcn/ui

## Production Deployment

This section describes how to deploy the application in a production environment using Docker.

### System Requirements

-   [Git](https://git-scm.com/)
-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the Repository

```bash
git clone https://github.com/Priveetee/Mood.git
cd Mood
```

### 2. Configure the Application

Create your environment configuration file by copying the example:

```bash
cp .env.example .env
```

Next, open the `.env` file and set the variables. **It is critical to replace the default example values with your own secure secrets for production.**

| Variable              | Description                                                                                             | Example                               |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `POSTGRES_USER`       | The username for your database.                                                                         | `mood_user`                           |
| `POSTGRES_PASSWORD`   | A strong, unique password for the database user.                                                        | `your_strong_password_here`           |
| `POSTGRES_DB`         | The name of the database.                                                                               | `mood_db`                             |
| `POSTGRES_PORT`       | The external port on your host machine to map to the database container.                                | `5432`                                |
| `JWT_SECRET`          | A long, random secret for signing session tokens.                                                       | `generate_a_long_random_string`       |
| `INVITATION_KEY`      | A secret key **required for the initial administrator registration** to secure the setup.                 | `another_secret_string`               |
| `NEXT_PUBLIC_APP_URL` | The public URL where your application will be accessible.                                               | `http://your-domain.com`              |

**Generating Secrets:** For all secret values, we recommend generating a long, random string. You can use a password manager or a command like `openssl rand -base64 32`.

### 3. Run the Application

This command will build the Docker images and start all services in the background. The `entrypoint.sh` script will automatically apply any pending database migrations.

```bash
docker compose up --build -d
```

Your application will be available at the URL you configured in `NEXT_PUBLIC_APP_URL`.

---

## Development Setup

If you wish to contribute to the code, follow these steps to set up a local development environment.

Prerequisites include **Bun** and **Docker**. For a detailed walkthrough, please see the **[Project Setup guide](https://priveetee.github.io/Docs_Mood/developer-guide/setup)** in our documentation.

1.  **Install dependencies**: `bun install`
2.  **Start the database**: `docker-compose up -d postgres`
3.  **Apply migrations**: `bunx prisma migrate dev`
4.  **Run the dev server**: `bun run dev`

---

## Managing the Application

-   **Stopping**: To stop the application, run: `docker compose down`
-   **Updating**: To update to the latest version, pull the latest code and rebuild the images:
    ```bash
    git pull origin main
    docker compose up --build -d
    ```

## Acknowledgements

This application was built using fantastic open-source tools and resources. Special thanks to:

-   [**shadcn/ui**](https://ui.shadcn.com/)
-   [**ReactBitsDev**](https://reactbits.dev/)
