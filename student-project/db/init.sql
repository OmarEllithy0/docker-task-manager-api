-- This script creates the table our Node.js app needs.
--
-- STUDENT TASK: You need to make this script run automatically the
-- FIRST time the MySQL container's data volume is created.
-- Hint: the official mysql Docker image automatically runs any .sql
-- files it finds in a specific special directory inside the container
-- the first time it starts up with an empty data directory. Look this
-- up in the official MySQL Docker Hub documentation and mount this
-- file into that directory using docker-compose.

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
