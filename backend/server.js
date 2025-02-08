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
  const checkChannelSQL = "SELECT * FROM channels WHERE channel_name = ?";
  db.query(checkChannelSQL, [channelName], (err, results) => {  

    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Channel already exists, try another name" });
    }  
    //Creates the table that will contain the chats sent in the channel
    const createChannelSQL = "CREATE TABLE ?? ( sender VARCHAR(255) NOT NULL UNIQUE, message VARCHAR(255) NOT NULL )";
    db.query(createChannelSQL, channelName, (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
    });

    //Updates the table of channels to contain the newest channel
    const updateChannelListSQL = "INSERT INTO channels (channel_name) VALUES (?)";
    db.query(updateChannelListSQL, channelName, (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
    });

    //Creates the table that will contain the users with access to the new channel
    const userlist = channelName+"_user_list"
    const createChannelUserListSQL = "CREATE TABLE ?? ( users VARCHAR(255) NOT NULL UNIQUE)";
    db.query(createChannelUserListSQL, userlist, (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
    });

    res.status(201).json({ message: "Channel Created" });
  });
});


//Delete Channel
app.post("/deleteChannel", (req, res) => {
  const {channelName}  = req.body;
  
    //Deletes the table that contained the chats sent in the channel
    const insertUserSQL = "DROP TABLE ??";
    db.query(insertUserSQL, channelName, (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
    });
    
    //Updates the table of channels to not contain the deleted channel
    const updateChannelListSQL = "DELETE FROM channels WHERE channel_name=?";
    db.query(updateChannelListSQL, channelName, (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
    });
    res.status(201).json({ message: "Channel Deleted" });
  
    //Deletes the table that contained the users with access to the channel
    const userlist = channelName+"_user_list"
    const dropUserListSQL = "DROP TABLE ??";
    db.query(dropUserListSQL, userlist, (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
    });
});

//Assign users to channels
app.post("/assignUsers", (req, res) => {
  const {username, channelName}  = req.body;
  const userList = channelName+"_user_list"
  
  // Check if user is already in the chat
  const checkChannelSQL = "SELECT * FROM ?? WHERE users = ?";
  db.query(checkChannelSQL, [userList, username], (err, results) => {  

    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "User already assigned to channel" });
    } 

  
  const insertToUserListSQL = "INSERT INTO ?? (users) VALUES (?)";
  
    db.query(insertToUserListSQL, [userList, username], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ message: "User added to channel" });
    });
  });
});

//Remove users from channel
app.post("/removeUsers", (req, res) => {
  const {username, channelName}  = req.body;
  const userList = channelName+"_user_list"
  
  const removeFromUserListSQL = "DELETE FROM ?? WHERE users=?";
  
    db.query(removeFromUserListSQL, [userList, username], (err, result) => {
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
  const mysql = "SELECT * FROM channels";
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
          var k = 0;
          for(let j = 0; j < results.length; j++){
          const channelListName = results[j].channel_name + "_user_list"
          const checkUserChannelSQL = "SELECT * FROM ?? WHERE users=?";
          
          db.query(checkUserChannelSQL, [channelListName, user], (err, result1) => {
            if(typeof result1[0] !== 'undefined'){
              list[k] = results[j].channel_name
              k++
            }
              if(j == results.length-1){
                
                res.status(201).json({ message:list });
              }
          });
        }
        }
      }); 
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
