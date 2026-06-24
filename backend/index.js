const express = require('express');
const pool = require('./db');
const app = express();

app.get('/', (req, res) => {
  res.send('JanSahayta backend is running!');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0] });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});