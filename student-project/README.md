What I did, step by step
Dockerfile
Base Image: Used node:20-alpine because Alpine is a much smaller Linux distro, making the final image lighter and faster to build/pull.

Layer Caching: Copied package.json first and ran npm install before copying the rest of the code. Docker caches each step, so if I only change server.js later, it won't reinstall all dependencies again and just reuses the cached layer to save time.

Code & Ports: Copied the rest of the app code in, exposed port 3000 (matches PORT in .env), and set the start command to npm start (node server.js).

Docker Compose (docker-compose.yml)
app service: Builds from the Dockerfile, loads environment variables from .env, and maps port 3000 on my machine to port 3000 in the container.

mysql service: Uses the official mysql:8.0 image and loads its config from .env.

Network (app-network): Both services are on the same custom network so app can reach mysql using the hostname mysql.

Database Init: Mounted db/init.sql into /docker-entrypoint-initdb.d/ inside the MySQL container so MySQL automatically runs it the first time it starts with an empty database to create the tasks table.

Data Persistence: Mounted a named volume (mysql-data) to /var/lib/mysql so data doesn't disappear when stopping and restarting containers.

Configuration (.env)
Copied .env.example to .env.

Made sure the app's DB credentials (DB_USER, DB_PASSWORD, DB_NAME) match MySQL's (MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE).

Updated docker-compose.yml to read values from .env using ${VARIABLE_NAME} syntax instead of hardcoding them twice, keeping everything in one place.

Files Added
Dockerfile

docker-compose.yml

.env