What I did, step by step

I Wrote a Dockerfile for the Node app and Used node:20-alpine as the base image because Alpine is a much smaller Linux distro, so the final image is lighter and faster to build/pull.

Copied package.json first and ran npm install before copying the rest of my code. I did it in this order on purpose — Docker caches each step, so if I only change server.js later, it won't have to reinstall all the dependencies again. It'll just reuse the cached npm install step, which saves a lot of time.

Copied the rest of the app code in after that.

Exposed port 3000, since that's the port the app listens on (matches PORT in .env).

Set the start command to npm start, which runs node server.js.

Wrote docker-compose.yml with two services
app: builds from my Dockerfile, loads its environment variables from .env, and maps port 3000 on my machine to port 3000 in the container.
mysql: uses the official mysql:8.0 image, and also loads its config from .env.

Both services are on the same custom network I created called app-network. This matters because it's the only way app can reach mysql using the hostname mysql — without a shared network, that wouldn't work.
I mounted db/init.sql into a special folder inside the MySQL container (/docker-entrypoint-initdb.d/). MySQL automatically runs any .sql file it finds there, but only the very first time it starts with an empty database — that's how the tasks table gets created without me doing it by hand.

I also mounted a named volume (mysql-data) to MySQL's data folder (/var/lib/mysql), so my data doesn't disappear every time I stop and restart the containers.

Set up the .env file
Copied .env.example to .env.

Made sure the app's DB credentials (DB_USER, DB_PASSWORD, DB_NAME) match what I gave MySQL (MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE). They have to match, otherwise MySQL won't let the app log in.

Cleaned up the compose file
At first I had the MySQL credentials typed twice — once in .env and again directly in docker-compose.yml. I changed it so the mysql service also reads from .env and uses ${VARIABLE_NAME} syntax to pull the values in, instead of duplicating them. Now if I ever need to change a password, I only change it in one place.
How I tested it
bash
docker compose up --build

Then in another terminal:

bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title": "Finish Docker assignment"}'
curl http://localhost:3000/tasks

To check that data survives a restart:

bash
docker compose down
docker compose up
curl http://localhost:3000/tasks

To check that the volume flag actually wipes data:

bash
docker compose down -v
docker compose up
curl http://localhost:3000/tasks
Files I added
Dockerfile
docker-compose.yml
.env (copied from .env.example, values kept as given)