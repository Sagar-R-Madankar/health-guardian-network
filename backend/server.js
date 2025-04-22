
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { spawn } = require('child_process');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'health_guardian_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Initialize database
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create tables if they don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS donors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        blood_type VARCHAR(5),
        organ_donor BOOLEAN DEFAULT FALSE,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        address TEXT,
        phone VARCHAR(20),
        last_donation DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS diseases (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        probability DECIMAL(5, 4) NOT NULL,
        location TEXT,
        details TEXT,
        prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        disease_id INT NOT NULL,
        severity ENUM('low', 'medium', 'high') NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (disease_id) REFERENCES diseases(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type ENUM('alert', 'contact') NOT NULL,
        recipient_id INT NOT NULL,
        sender_id INT,
        message TEXT,
        reference_id INT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
    
    // Check if admin exists, if not create one
    const [adminUsers] = await connection.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    
    if (adminUsers.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(`
        INSERT INTO users (name, email, password, role) 
        VALUES ('Admin User', 'admin@example.com', ?, 'admin');
      `, [hashedPassword]);
      console.log('Admin user created');
    }
    
    connection.release();
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Initialize database when server starts
initializeDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// API Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if email already exists
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );
    
    connection.release();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Find user by email
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    
    connection.release();
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const connection = await pool.getConnection();
    
    // Get user data
    const [users] = await connection.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Check if user is a donor
    const [donors] = await connection.query('SELECT * FROM donors WHERE user_id = ?', [userId]);
    
    let donorInfo = null;
    if (donors.length > 0) {
      donorInfo = donors[0];
    }
    
    connection.release();
    
    return res.status(200).json({
      user: {
        ...user,
        isDonor: donors.length > 0,
        bloodType: donorInfo?.blood_type || null,
        organDonor: donorInfo?.organ_donor || false,
        location: donorInfo ? {
          lat: parseFloat(donorInfo.lat),
          lng: parseFloat(donorInfo.lng),
          address: donorInfo.address
        } : null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Register as donor
app.post('/api/donors', authenticateToken, async (req, res) => {
  try {
    const { bloodType, organDonor, phone, address, lat, lng } = req.body;
    const userId = req.user.id;
    
    if (!bloodType || !phone || !address || !lat || !lng) {
      return res.status(400).json({ message: 'Blood type, phone, address and location are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if user is already a donor
    const [existingDonors] = await connection.query('SELECT * FROM donors WHERE user_id = ?', [userId]);
    
    if (existingDonors.length > 0) {
      // Update existing donor
      await connection.query(
        `UPDATE donors SET 
         blood_type = ?,
         organ_donor = ?,
         lat = ?,
         lng = ?,
         address = ?,
         phone = ?
         WHERE user_id = ?`,
        [bloodType, organDonor, lat, lng, address, phone, userId]
      );
    } else {
      // Insert new donor
      await connection.query(
        `INSERT INTO donors 
         (user_id, blood_type, organ_donor, lat, lng, address, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, bloodType, organDonor, lat, lng, address, phone]
      );
    }
    
    connection.release();
    
    return res.status(200).json({ message: 'Donor registration successful' });
  } catch (error) {
    console.error('Donor registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all donors
app.get('/api/donors', authenticateToken, async (req, res) => {
  try {
    const { bloodType, limit } = req.query;
    
    const connection = await pool.getConnection();
    
    let query = `
      SELECT d.*, u.name, u.email
      FROM donors d
      JOIN users u ON d.user_id = u.id
    `;
    
    const queryParams = [];
    
    if (bloodType) {
      query += ' WHERE d.blood_type = ?';
      queryParams.push(bloodType);
    }
    
    if (limit) {
      query += ' LIMIT ?';
      queryParams.push(parseInt(limit));
    }
    
    const [donors] = await connection.query(query, queryParams);
    
    connection.release();
    
    const formattedDonors = donors.map(donor => ({
      id: donor.id,
      userId: donor.user_id,
      name: donor.name,
      email: donor.email,
      bloodType: donor.blood_type,
      organDonor: donor.organ_donor === 1,
      location: {
        lat: parseFloat(donor.lat),
        lng: parseFloat(donor.lng),
        address: donor.address
      },
      phone: donor.phone,
      lastDonation: donor.last_donation
    }));
    
    return res.status(200).json({ donors: formattedDonors });
  } catch (error) {
    console.error('Get donors error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Contact donor
app.post('/api/donors/:id/contact', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const adminId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    const connection = await pool.getConnection();
    
    // Find donor
    const [donors] = await connection.query('SELECT * FROM donors WHERE id = ?', [id]);
    
    if (donors.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Donor not found' });
    }
    
    const donor = donors[0];
    
    // Create notification
    await connection.query(
      `INSERT INTO notifications 
       (type, recipient_id, sender_id, message, reference_id)
       VALUES (?, ?, ?, ?, ?)`,
      ['contact', donor.user_id, adminId, message, donor.id]
    );
    
    connection.release();
    
    // In a real app, you would send SMS/email here
    
    return res.status(200).json({ message: 'Donor contacted successfully' });
  } catch (error) {
    console.error('Contact donor error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Run disease prediction model
app.post('/api/predictions', authenticateToken, isAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }
    
    const filePath = req.file.path;
    
    // Run Python script as a separate process
    const python = spawn('python', ['model.py', filePath]);
    
    let predictions = '';
    
    python.stdout.on('data', (data) => {
      predictions += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      console.error(`Python error: ${data}`);
    });
    
    python.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: 'Error running prediction model' });
      }
      
      try {
        const results = JSON.parse(predictions);
        
        // Save predictions to database
        const connection = await pool.getConnection();
        
        for (const result of results.flat()) {
          if (result.probability > 0.5) { // Only save significant predictions
            await connection.query(
              `INSERT INTO diseases (name, probability, location, details)
               VALUES (?, ?, ?, ?)`,
              [result.disease, result.probability, result.location || null, '']
            );
          }
        }
        
        connection.release();
        
        // Delete the uploaded file
        fs.unlinkSync(filePath);
        
        return res.status(200).json({ predictions: results });
      } catch (error) {
        console.error('Prediction processing error:', error);
        return res.status(500).json({ message: 'Error processing prediction results' });
      }
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get diseases
app.get('/api/diseases', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [diseases] = await connection.query(
      'SELECT * FROM diseases ORDER BY prediction_date DESC'
    );
    
    connection.release();
    
    const formattedDiseases = diseases.map(disease => ({
      id: disease.id,
      name: disease.name,
      probability: parseFloat(disease.probability),
      date: disease.prediction_date,
      location: disease.location,
      details: disease.details
    }));
    
    return res.status(200).json({ diseases: formattedDiseases });
  } catch (error) {
    console.error('Get diseases error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create alert
app.post('/api/alerts', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, message, diseaseId, severity } = req.body;
    const adminId = req.user.id;
    
    if (!title || !message || !diseaseId || !severity) {
      return res.status(400).json({ message: 'Title, message, disease ID and severity are required' });
    }
    
    const connection = await pool.getConnection();
    
    // Check if disease exists
    const [diseases] = await connection.query('SELECT * FROM diseases WHERE id = ?', [diseaseId]);
    
    if (diseases.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Disease not found' });
    }
    
    // Create alert
    const [result] = await connection.query(
      `INSERT INTO alerts (title, message, disease_id, severity, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, message, diseaseId, severity, adminId]
    );
    
    // Notify all users
    const [users] = await connection.query('SELECT id FROM users WHERE role = "user"');
    
    for (const user of users) {
      await connection.query(
        `INSERT INTO notifications (type, recipient_id, sender_id, message, reference_id)
         VALUES (?, ?, ?, ?, ?)`,
        ['alert', user.id, adminId, `New health alert: ${title}`, result.insertId]
      );
    }
    
    connection.release();
    
    return res.status(201).json({
      message: 'Alert created successfully',
      alertId: result.insertId
    });
  } catch (error) {
    console.error('Create alert error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get alerts
app.get('/api/alerts', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [alerts] = await connection.query(`
      SELECT a.*, d.name as disease_name, d.probability as disease_probability, 
             d.location as disease_location, u.name as created_by_name
      FROM alerts a
      JOIN diseases d ON a.disease_id = d.id
      JOIN users u ON a.created_by = u.id
      ORDER BY a.created_at DESC
    `);
    
    connection.release();
    
    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      active: alert.active === 1,
      date: alert.created_at,
      disease: {
        id: alert.disease_id,
        name: alert.disease_name,
        probability: parseFloat(alert.disease_probability),
        location: alert.disease_location
      },
      createdBy: {
        id: alert.created_by,
        name: alert.created_by_name
      }
    }));
    
    return res.status(200).json({ alerts: formattedAlerts });
  } catch (error) {
    console.error('Get alerts error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update alert status
app.patch('/api/alerts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (active === undefined) {
      return res.status(400).json({ message: 'Active status is required' });
    }
    
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE alerts SET active = ? WHERE id = ?',
      [active, id]
    );
    
    connection.release();
    
    return res.status(200).json({ message: 'Alert updated successfully' });
  } catch (error) {
    console.error('Update alert error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const connection = await pool.getConnection();
    
    const [notifications] = await connection.query(
      `SELECT n.*, u.name as sender_name
       FROM notifications n
       LEFT JOIN users u ON n.sender_id = u.id
       WHERE n.recipient_id = ?
       ORDER BY n.created_at DESC`,
      [userId]
    );
    
    connection.release();
    
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      message: notification.message,
      isRead: notification.is_read === 1,
      date: notification.created_at,
      sender: notification.sender_id ? {
        id: notification.sender_id,
        name: notification.sender_name
      } : null,
      referenceId: notification.reference_id
    }));
    
    return res.status(200).json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_id = ?',
      [id, userId]
    );
    
    connection.release();
    
    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Update notification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
