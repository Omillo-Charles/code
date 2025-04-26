const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // 👈 NEW: Import bcrypt
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Load users data
let users = [];
try {
  const data = fs.readFileSync('users.json', 'utf8');
  users = JSON.parse(data);
} catch (err) {
  console.log('No existing users found, starting fresh.');
}

// Load pastoral codes
let pastoralCodes = [];
try {
  const codeData = fs.readFileSync('pastoralCodes.json', 'utf8');
  pastoralCodes = JSON.parse(codeData);
} catch (err) {
  console.log('No existing pastoral codes found.');
}

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, pastoralCode, password } = req.body;

  const validCode = pastoralCodes.includes(pastoralCode);
  if (!validCode) {
    return res.status(400).json({ error: 'Invalid Pastoral Code' });
  }

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 👈 Hash the password
    const newUser = { name, email, pastoralCode, password: hashedPassword };

    users.push(newUser);

    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ error: "It looks like you didn't sign up" });
  }

  try {
    const isPasswordCorrect = await bcrypt.compare(password, user.password); // 👈 Compare passwords
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Incorrect email or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error comparing passwords:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
