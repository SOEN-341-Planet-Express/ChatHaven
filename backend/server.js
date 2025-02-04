const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const PORT = 5001; 

const app = express();
app.use(express.json());
app.use(cors());

// Connection
const db = mysql.createConnection({
  host: "srvd12ed324fsd5t34r34.mysql.database.azure.com",
  user: "rtdsfasdf23r2eddva32",
  password: "kPnWV7@@m%",  
  database: "chathaven_DB",
  port: 3306,
  ssl: { rejectUnauthorized: true },
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

// Forgot Password

app.post("/forgotpassword", (req, res) => {
  const { username, password } = req.body;

  const mysql = "UPDATE users SET password = ? WHERE username = ?";
  db.query(mysql, [password, username], (err, results) => {
    if (err) return res.status(500).json({error: "Error - not your fault :) database fault"});
    
    if (results.affectedRows === 0) return res.status(401).json({ message: "Invalid username entry :/"});

    

    res.status(200).json({ message: "Password changed successfully!"})
  });
});


// Start Server
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
