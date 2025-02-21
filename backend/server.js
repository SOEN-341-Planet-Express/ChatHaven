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
  database: "chathaven_DB_NEW",
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
    const insertUserSQL = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
    db.query(insertUserSQL, [username, password, "member"], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ message: "Account Created" });
    });
  });
});

// Login 
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT username, password FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length > 0) {
      return res.status(200).json({ message: "Login successful" });
    }

    res.status(401).json({ message: "Invalid username or password" });
  });
});


//Create Channel
app.post("/createChannel", (req, res) => {
  const {channelName}  = req.body;

  // Check if channel already exists
  const checkChannelSQL = "SELECT * FROM channel_list WHERE channel_name = ?";
  db.query(checkChannelSQL, [channelName], (err, results) => {  

    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Channel already exists, try another name" });
    }  

    //Updates the table of channels to contain the newest channel
    const updateChannelListSQL = "INSERT INTO channel_list (channel_name) VALUES (?)";
    db.query(updateChannelListSQL, channelName, (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
    });

    res.status(201).json({ message: "Channel Created" });
  });
});


//Delete Channel
app.post("/deleteChannel", (req, res) => {
  const {channelName}  = req.body;
    //Updates the table of channels to not contain the deleted channel
    const updateChannelListSQL = "DELETE FROM channel_list WHERE channel_name=?";
    db.query(updateChannelListSQL, channelName, (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
    });
    res.status(201).json({ message: "Channel Deleted" });
});

//Assign users to channels
app.post("/assignUsers", (req, res) => {
  const {username, channelName}  = req.body;
  
  // Check if user is already in the chat
  const checkChannelSQL = "SELECT * FROM channel_access WHERE (permitted_users=? AND channel_name=?)";
  db.query(checkChannelSQL, [username, channelName], (err, results) => {  

    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "User already assigned to channel" });
    } 

  
  const insertToUserListSQL = "INSERT INTO channel_access (channel_name, permitted_users) VALUES (?, ?)";
  
    db.query(insertToUserListSQL, [channelName, username], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ message: "User added to channel" });
    });
  });
});

//Remove users from channel
app.post("/removeUsers", (req, res) => {
  const {username, channelName}  = req.body;
  
  const removeFromUserListSQL = "DELETE FROM channel_access WHERE (permitted_users=? AND channel_name=?)";
  
    db.query(removeFromUserListSQL, [username, channelName], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ message: "User removed from channel" });
    });
  
});

//Check if user is admin
app.post("/checkAdmin", (req, res) => {
  const {user}  = req.body;
  
  const checkAdminSQL = "SELECT role FROM users WHERE username=?";
    db.query(checkAdminSQL, [user], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      const role = result[0].role;
      if(role=="admin")
        res.status(201).json({ message: "true" });
      else{res.status(201).json({ message: "false" });}
    });
  
});

//Get list of channels to display
app.post("/getChannels", (req, res) => {
  const {user} = req.body
  const mysql = "SELECT * FROM channel_list";
  db.query(mysql, [], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    
    //Check if user is admin before passing list of channels
    var role;
    const list = []
    const checkAdminSQL = "SELECT role FROM users WHERE username=?";
    db.query(checkAdminSQL, [user], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      role = result[0].role;
      if(role ==="admin"){
        for(let i = 0; i < results.length; i++){
            list[i] = results[i].channel_name
          }
          res.status(201).json({ message:list });
        } else {
          const checkUserChannelSQL = "SELECT * FROM channel_access WHERE permitted_users=?";
          
          db.query(checkUserChannelSQL, [user], (err, result1) => {
            for(let i = 0; i < result1.length; i++){
              list[i] = result1[i].channel_name
            }
            res.status(201).json({ message:list });
          });
        
        }
      }); 
  });
});

//Get list of Users to display in Private message 
app.post("/getPrivateMessage", (req, res) => {
  const { user } = req.body; 
  
  const getUsersSQL = "SELECT username FROM users WHERE username != ?";
  
  db.query(getUsersSQL, [user], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });

    // Extract usernames into a list
    const userList = results.map(row => row.username);

    res.status(200).json({ message: userList });
  });
});

//Load messages

app.post("/loadMessages", (req, res) => {
  const { currentChannel } = req.body;

  const mysql = "SELECT * FROM messages WHERE destination=?";
  db.query(mysql, [currentChannel], (err, results) => {
    if (err) return res.status(500).json({error: "Error - not your fault :) database fault"});
    

    res.status(200).json({ message: results})
  });
});

app.post("/sendMessage", (req, res) => {
  const { messageToSend, loggedInUser, currentChannel, currentChannelType } = req.body;

  const mysql = "insert into messages (message, sender, destination, time_sent, message_type) values (?, ?, ?, current_timestamp, ?);";
  db.query(mysql, [messageToSend, loggedInUser, currentChannel, currentChannelType], (err, results) => {
    if (err) return res.status(500).json({error: "Error - not your fault :) database fault"});
    res.status(200).json({ message: "Message sent"})
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

module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}
