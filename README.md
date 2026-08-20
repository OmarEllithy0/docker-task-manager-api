# Assignment: Dockerizing a Node.js + MySQL Application

## What you were given

You were given a working **Node.js / Express** application (`Task Manager API`)
that needs a **MySQL database** to function. The application code is already
complete — you do **not** need to modify `server.js`, `db.js`, or
`package.json`.

Files provided:
```
student-project/
├── server.js         # Express app (routes: /, /health, /tasks)
├── db.js             # MySQL connection pool (reads config from env vars)
├── package.json       # Node dependencies
├── db/init.sql         # SQL that creates the "tasks" table
├── .env.example         # Example environment variables
└── README.md            # This file
```

The app exposes these endpoints:
| Method | Route     | Description                              |
|--------|-----------|-------------------------------------------|
| GET    | `/`       | Basic info                                |
| GET    | `/health` | Returns 200 if the app can reach MySQL    |
| GET    | `/tasks`  | Lists all tasks from the DB               |
| POST   | `/tasks`  | Creates a task (`{ "title": "..." }`)     |

Your job is to **containerize this application** and **connect it to a
MySQL database container**, entirely using Docker and Docker Compose.

---

## What YOU need to build and deliver

You must submit the following, added to this project folder:

### 1. `Dockerfile` (for the Node.js application)

Write a `Dockerfile` that:
- Uses an official Node.js base image (choose an appropriate version/tag,
  and think about why an "alpine" image might be preferred).
- Sets a working directory inside the container.
- Copies `package.json` (and `package-lock.json` if present) **first**, and
  installs dependencies **before** copying the rest of the source code.
  (Think about *why* this order matters for build caching.)
- Copies the rest of the application source code into the image.
- Exposes the port the app listens on (see `PORT` in `.env.example`).
- Defines the correct `CMD` to start the app (check `package.json` for the
  start script).

### 2. `docker-compose.yml`

Write a `docker-compose.yml` file that defines **two services**:

**Service 1: `app`**
- Builds from the `Dockerfile` you wrote (use `build: .`).
- Passes the required environment variables into the container so it can
  connect to MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
  `DB_NAME`) — you can use `env_file: .env` or an `environment:` block.
- Maps the container's port to a port on your host machine.
- Declares a dependency on the `mysql` service so it starts after the
  database service (research the `depends_on` key, and optionally look
  into healthchecks so `app` waits until MySQL is actually *ready*, not
  just *started*).

**Service 2: `mysql`**
- Uses an official `mysql` image (pick a specific version tag — avoid
  `latest` in real projects).
- Sets the required MySQL environment variables (root password, database
  name, user, and user password) — match these to the values your `app`
  service uses to connect.
- Mounts the `db/init.sql` file into the correct special directory inside
  the MySQL container so the `tasks` table is created automatically the
  first time the container starts (research the official `mysql` Docker
  Hub image documentation for the exact directory name).
- Mounts a **named Docker volume** to the MySQL data directory
  (`/var/lib/mysql`) so your data **persists** even if the container is
  removed and recreated.

**Both services** must be attached to a **custom Docker network** that you
define in the `docker-compose.yml` (do not rely on the default network —
explicitly declare a `networks:` section and attach both services to it).
This is what allows the `app` container to reach the `mysql` container
using the service name as a hostname (see `DB_HOST` in `.env.example`).

You must also declare the **named volume** in a top-level `volumes:`
section of the compose file.

### 3. `.env` file

- Copy `.env.example` to `.env` and fill in real values.
- Your `docker-compose.yml` should read from this file.
- Do **not** commit real secrets if this were a real project — but for
  this assignment, submit your working `.env` so we can test it.

---

## Requirements checklist (what will be graded)

- [ ] `Dockerfile` builds the Node app into a working image
- [ ] Image uses dependency caching correctly (package.json copied/installed before rest of code)
- [ ] `docker-compose.yml` defines an `app` service and a `mysql` service
- [ ] A **custom network** is declared and both services are attached to it
- [ ] `app` connects to MySQL using the **service name** as the host (not `localhost`, not a hardcoded IP)
- [ ] A **named volume** is declared and mounted to MySQL's data directory
- [ ] `db/init.sql` is mounted so the `tasks` table is created automatically on first run
- [ ] Running `docker compose up --build` starts both containers successfully
- [ ] `GET http://localhost:<your-port>/health` returns `{"status":"ok","db":"connected"}`
- [ ] `POST http://localhost:<your-port>/tasks` with a JSON body creates a row
- [ ] `GET http://localhost:<your-port>/tasks` returns the created row(s)
- [ ] Stopping and restarting the containers (`docker compose down` then
      `docker compose up`, **without** `-v`) shows that previously created
      tasks are still there — proving the volume works
- [ ] Running `docker compose down -v` and starting again gives you a
      fresh, empty database — proving you understand what the volume flag does

---

## How to test your work

Once your `Dockerfile` and `docker-compose.yml` are in place:

```bash
# Build and start everything
docker compose up --build

# In another terminal, test the endpoints
curl http://localhost:<your-port>/health
curl http://localhost:<your-port>/tasks
curl -X POST http://localhost:<your-port>/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Finish Docker assignment"}'
curl http://localhost:<your-port>/tasks
```

Then test persistence:
```bash
docker compose down          # stop containers, keep volume
docker compose up            # start again
curl http://localhost:<your-port>/tasks   # data should still be there
```

And test volume reset:
```bash
docker compose down -v       # stop containers AND remove volume
docker compose up            # start again
curl http://localhost:<your-port>/tasks   # should be empty now
```

---

## What to submit

Your final project folder, including everything provided **plus** the
files you created:

```
student-project/
├── server.js          (provided)
├── db.js               (provided)
├── package.json         (provided)
├── db/init.sql            (provided)
├── .env                    (you create, from .env.example)
├── Dockerfile               (YOU MUST CREATE)
└── docker-compose.yml         (YOU MUST CREATE)
```

Good luck — and remember: `DB_HOST` is never `localhost` when your app and
your database are running in separate containers.
