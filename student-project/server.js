const express = require('express');
const { getPool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic root route
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API is running',
    endpoints: {
      health: 'GET /health',
      listTasks: 'GET /tasks',
      createTask: 'POST /tasks  (body: { "title": "string" })',
    },
  });
});

// Health check route - verifies the app AND the DB connection
app.get('/health', async (req, res) => {
  try {
    await testConnection();
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  try {
    const pool = getPool();
    const [result] = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title]);
    res.status(201).json({ id: result.insertId, title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
