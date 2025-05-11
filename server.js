const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Serve static files from the 'static' directory
app.use(express.static(path.join(__dirname, 'static')));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// MySQL connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'admin',
    database: 'PetCare'
});

db.connect(err => {
  if (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

// Authentication Routes
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  
  try {
    // Check if user already exists
    const [existingUsers] = await db.promise().query(
      'SELECT * FROM Users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.promise().query(
      'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user
    const [users] = await db.promise().query(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id,
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// --- Owner Routes ---
app.get('/api/owners', (req, res) => {
  db.query('SELECT * FROM Owner', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/owners', (req, res) => {
  const { name, email, phone } = req.body;
  db.query('INSERT INTO Owner (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Owner created', owner_id: result.insertId });
  });
});

app.delete('/api/owners/:id', (req, res) => {
  db.query('DELETE FROM Owner WHERE owner_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Owner deleted' });
  });
});

app.put('/api/owners/:id', (req, res) => {
  const { name, email, phone } = req.body;
  db.query('UPDATE Owner SET name=?, email=?, phone=? WHERE owner_id=?', [name, email, phone, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Owner updated' });
  });
});

// --- Pet Routes ---
app.get('/api/pets', (req, res) => {
  db.query('SELECT Pet.*, Owner.name AS owner_name FROM Pet LEFT JOIN Owner ON Pet.owner_id = Owner.owner_id', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/pets', (req, res) => {
  const { owner_id, name, species, breed, dob } = req.body;
  db.query('INSERT INTO Pet (owner_id, name, species, breed, dob) VALUES (?, ?, ?, ?, ?)', [owner_id, name, species, breed, dob], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Pet created', pet_id: result.insertId });
  });
});

app.delete('/api/pets/:id', (req, res) => {
  db.query('DELETE FROM Pet WHERE pet_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Pet deleted' });
  });
});

app.put('/api/pets/:id', (req, res) => {
  const { owner_id, name, species, breed, dob } = req.body;
  db.query('UPDATE Pet SET owner_id=?, name=?, species=?, breed=?, dob=? WHERE pet_id=?', [owner_id, name, species, breed, dob, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Pet updated' });
  });
});

// --- VetAppointment Routes ---
app.get('/api/appointments', (req, res) => {
  db.query('SELECT * FROM VetAppointment', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/appointments', (req, res) => {
  const { pet_id, appointment_date, reason, vet_name } = req.body;
  db.query('INSERT INTO VetAppointment (pet_id, appointment_date, reason, vet_name) VALUES (?, ?, ?, ?)', [pet_id, appointment_date, reason, vet_name], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Appointment created', appointment_id: result.insertId });
  });
});

app.delete('/api/appointments/:id', (req, res) => {
  db.query('DELETE FROM VetAppointment WHERE appointment_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Appointment deleted' });
  });
});

app.put('/api/appointments/:id', (req, res) => {
  const { pet_id, appointment_date, reason, vet_name } = req.body;
  db.query('UPDATE VetAppointment SET pet_id=?, appointment_date=?, reason=?, vet_name=? WHERE appointment_id=?', [pet_id, appointment_date, reason, vet_name, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Appointment updated' });
  });
});

// --- Vaccination Routes ---
app.get('/api/vaccinations', (req, res) => {
  db.query('SELECT * FROM Vaccination', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/vaccinations', (req, res) => {
  const { pet_id, vaccine_name, vaccination_date, next_due_date } = req.body;
  db.query('INSERT INTO Vaccination (pet_id, vaccine_name, vaccination_date, next_due_date) VALUES (?, ?, ?, ?)', [pet_id, vaccine_name, vaccination_date, next_due_date], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Vaccination record created', vaccine_id: result.insertId });
  });
});

app.delete('/api/vaccinations/:id', (req, res) => {
  db.query('DELETE FROM Vaccination WHERE vaccine_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Vaccination record deleted' });
  });
});

app.put('/api/vaccinations/:id', (req, res) => {
  const { pet_id, vaccine_name, vaccination_date, next_due_date } = req.body;
  db.query('UPDATE Vaccination SET pet_id=?, vaccine_name=?, vaccination_date=?, next_due_date=? WHERE vaccine_id=?', [pet_id, vaccine_name, vaccination_date, next_due_date, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Vaccination record updated' });
  });
});

// --- FeedingLog Routes ---
app.get('/api/feedinglogs', (req, res) => {
  db.query('SELECT * FROM FeedingLog', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/feedinglogs', (req, res) => {
  const { pet_id, date, food_type, quantity } = req.body;
  db.query('INSERT INTO FeedingLog (pet_id, date, food_type, quantity) VALUES (?, ?, ?, ?)', [pet_id, date, food_type, quantity], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Feeding log created', feeding_id: result.insertId });
  });
});

app.delete('/api/feedinglogs/:id', (req, res) => {
  db.query('DELETE FROM FeedingLog WHERE feeding_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Feeding log deleted' });
  });
});

app.put('/api/feedinglogs/:id', (req, res) => {
  const { pet_id, date, food_type, quantity } = req.body;
  db.query('UPDATE FeedingLog SET pet_id=?, date=?, food_type=?, quantity=? WHERE feeding_id=?', [pet_id, date, food_type, quantity, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Feeding log updated' });
  });
});

// --- MedicalHistory Routes ---
app.get('/api/medicalhistory', (req, res) => {
  db.query('SELECT * FROM MedicalHistory', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/medicalhistory', (req, res) => {
  const { pet_id, record_date, symptom, diagnosis, treatment } = req.body;
  db.query('INSERT INTO MedicalHistory (pet_id, record_date, symptom, diagnosis, treatment) VALUES (?, ?, ?, ?, ?)', [pet_id, record_date, symptom, diagnosis, treatment], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Medical history record created', history_id: result.insertId });
  });
});

app.delete('/api/medicalhistory/:id', (req, res) => {
  db.query('DELETE FROM MedicalHistory WHERE history_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Medical history record deleted' });
  });
});

app.put('/api/medicalhistory/:id', (req, res) => {
  const { pet_id, record_date, symptom, diagnosis, treatment } = req.body;
  db.query('UPDATE MedicalHistory SET pet_id=?, record_date=?, symptom=?, diagnosis=?, treatment=? WHERE history_id=?', [pet_id, record_date, symptom, diagnosis, treatment, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Medical history record updated' });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});