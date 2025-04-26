const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const USERS_FILE = 'users.json';
const CODES_FILE = 'pastoralCodes.json';

// Signup Route
app.post('/signup', (req, res) => {
  const { name, email, pastoralCode, password } = req.body;

  const codes = JSON.parse(fs.readFileSync(CODES_FILE));

  if (!codes.includes(pastoralCode)) {
    return res.status(400).json({ error: 'Invalid Pastoral Code' });
  }

  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  if (users.find(user => user.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  users.push({ name, email, pastoralCode, password });

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  res.status(200).json({ message: 'Signup successful' });
});

// Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password, or not signed up' });
  }

  res.status(200).json({ message: 'Login successful' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
