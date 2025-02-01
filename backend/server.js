const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const PORT = 5001; // port 5000 had a service running

const app = express();
app.use(express.json());
app.use(cors());

// Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",  
  database: "chathaven_DB",
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected");
});

//New User
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username exists
  const checkUserSQL = "SELECT * FROM users WHERE username = ?";
  db.query(checkUserSQL, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Insert user if username does not exist
    const insertUserSQL = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(insertUserSQL, [username, password], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ message: "Account Created" });
    });
  });
});

// Login 
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length > 0) {
      return res.status(200).json({ message: "Login successful" });
    }

    res.status(401).json({ message: "Invalid username or password" });
  });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
