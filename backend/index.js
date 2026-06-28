const express = require('express');
const pool = require('./db');
const { analyzeIssue } = require('./aiController');
const authRoutes = require('./routes/auth');
const app = express();

app.use(express.json());

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

app.post('/test-ai', async (req, res) => {
  try {
    const { text, lang } = req.body;
    const result = await analyzeIssue(text, lang);
    res.json({ success: true, result });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.use('/api/auth', authRoutes);

app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});