const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const http = require("http"); // Required for Socket.io
const { Server } = require("socket.io"); // Required for Socket.io

const PORT = 5001; 

const app = express();
app.use(express.json());
app.use(cors());

// Create an HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development (adjust in production)
  },
});

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

// WebSocket Connection Handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for incoming messages from the client
  socket.on("sendMessage", (data) => {
    const { messageToSend, loggedInUser, currentChannel, currentChannelType } = data;
    const sql = "INSERT INTO messages (message, sender, destination, time_sent, message_type) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)";
    
    db.query(sql, [messageToSend, loggedInUser, currentChannel, currentChannelType], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return;
      }
      // Broadcast the new message to all connected clients
      io.emit("receiveMessage", {
        my_row_id: results.insertId,       // Standardized property
        message: messageToSend,
        sender: loggedInUser,
        destination: currentChannel,
        messageType: currentChannelType,
        timestamp: new Date().toISOString(),
      });
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// --------------------- REST Endpoints --------------------- //

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
    });

    //Add user permission for general channel
    const addPermissionSQL = "INSERT INTO channel_access (channel_name, permitted_users) VALUES ('general', ?)";
    db.query(addPermissionSQL, [username], (err, result) => {
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
  const {channelName, loggedInUser}  = req.body;

  // Check if channel already exists
  const checkChannelSQL = "SELECT * FROM channel_list WHERE channel_name = ?";
  db.query(checkChannelSQL, [channelName], (err, results) => {  

    if (err) return res.status(500).json({ error: "DB error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Channel already exists, try another name" });
    }  

    //Updates the table of channels to contain the newest channel
    const updateChannelListSQL = "INSERT INTO channel_list (channel_name, creator) VALUES (?, ?)";
    db.query(updateChannelListSQL, [channelName, loggedInUser], (err, result) => {
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

    const eraseMessagesSQL = "DELETE FROM messages WHERE destination=? AND message_type='groupchat'";
    db.query(eraseMessagesSQL, channelName, (err, result) => {
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

//Get the requests to join that you sent which are still pending
app.post("/getSentRequests", (req, res) => {
  const { user } = req.body; 
  
  const getRequestSQL = "SELECT * FROM channel_invites WHERE invitee = ? AND type='request'";
  
  db.query(getRequestSQL, [user], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
  
    res.status(200).json({ message: results });
  });
});

//Get the requests to join that you received which are still pending
app.post("/getReceivedRequests", (req, res) => {
  const { user } = req.body; 
  
  const getRequestSQL = "SELECT * FROM channel_invites WHERE owner = ? AND type='request'";
  
  db.query(getRequestSQL, [user], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    
    res.status(200).json({ message: results });
  });
});

//Get list of invites you have sent
app.post("/getSentInvites", (req, res) => {
  const { user } = req.body; 
  
  const getRequestSQL = "SELECT * FROM channel_invites WHERE owner = ? AND type='invite'";
  
  db.query(getRequestSQL, [user], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    
    res.status(200).json({ message: results });
  });
});

//Get list of invites you have received
app.post("/getReceivedInvites", (req, res) => {
  const { user } = req.body; 
  
  const getRequestSQL = "SELECT * FROM channel_invites WHERE invitee = ? AND type='invite'";
  
  db.query(getRequestSQL, [user], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    
    res.status(200).json({ message: results });
  });
});

//Load messages

app.post("/loadMessages", (req, res) => {
  const { currentChannel, currentChannelType, loggedInUser } = req.body;

  if(currentChannelType=='groupchat'){
  const mysql = "SELECT * FROM messages WHERE destination=? AND message_type=?";
  db.query(mysql, [currentChannel, currentChannelType], (err, results) => {
    if (err) return res.status(500).json({error: "Error - not your fault :) database fault"});
    res.status(200).json({ message: results})
  });
} else if(currentChannelType=='dm'){
  const mysql = "SELECT * FROM messages WHERE ((sender=? AND destination=?) OR (sender=? AND destination=?)) AND message_type=?";
  db.query(mysql, [currentChannel, loggedInUser, loggedInUser, currentChannel, currentChannelType], (err, results) => {
    if (err) return res.status(500).json({error: "Error - not your fault :) database fault"});
    res.status(200).json({ message: results})
  });
}


});

// Delete a message
app.post("/deleteMessage", (req, res) => {
  const sql = "DELETE FROM messages WHERE my_row_id = ?";
  db.query(sql, [req.body.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    // Emit a socket event to notify all clients about the deletion
    io.emit("deleteMessage", { id: req.body.id });
    res.json({ message: "Message deleted" });
  });
});


// Send a message
app.post("/sendMessage", (req, res) => {
  const { messageToSend, loggedInUser, currentChannel, currentChannelType } = req.body;

  const mysql = "insert into messages (message, sender, destination, time_sent, message_type) values (?, ?, ?, current_timestamp, ?);";
  db.query(mysql, [messageToSend, loggedInUser, currentChannel, currentChannelType], (err, results) => {
    if (err) return res.status(500).json({error: "Error - not your fault :) database fault"});
    
    // Broadcast the new message to all connected clients via Socket.io
    io.emit("receiveMessage", {
      my_row_id: results.insertId,       // Standardized property
      message: messageToSend,
      sender: loggedInUser,
      destination: currentChannel,
      messageType: currentChannelType,
      timestamp: new Date().toISOString(),
    });
    
    res.status(200).json({ message: "Message sent"})
  });
});

// Forgot Password
app.post("/forgotpassword", (req, res) => {
  const { username, password } = req.body;

  const mysql = "UPDATE users SET password = ? WHERE username = ?";
  db.query(mysql, [password, username], (err, results) => {
    if (err) return res.status(500).json({error: "Error - not your fault :) database fault", details: err});
    
    if (results.affectedRows === 0) return res.status(401).json({ message: "Invalid username entry :/"});

    

    res.status(200).json({ message: "Password changed successfully!"})
  });
});

//Process invite
app.post("/processInvite", (req, res) => {
  //const { username, password } = req.body;
  const invitee = 'test'
  const owner = 'aaa'
  const channel = 'test'
  const accepted = 'false'

  const mysql = "DELETE FROM channel_invites WHERE invitee = (?) AND owner = (?) and channel = (?)";
  db.query(mysql, [invitee, owner, channel], (err, results) => {
  });

  if(accepted == 'true'){
    const mysql2 = "INSERT INTO channel_access (channel_name, permitted_users) VALUES (?, ?)";
  db.query(mysql2, [channel, invitee], (err, results) => {
    res.status(200).json({ message: "Invite Accepted"})
  });
  } else {
    res.status(200).json({ message: "Invite Denied"})
  }
});

//Send invite
app.post("/sendInvite", (req, res) => {
  //const { username, password } = req.body;
  const invitee = 'aaa'
  const owner = 'thekillerturkey'
  const channel = 'test'
  //const type = 'invite'
  const type = 'request'

  const mysql = "INSERT INTO channel_invites (invitee, owner, channel, type) VALUES (?, ?, ?, ?)";
  db.query(mysql, [invitee, owner, channel, type], (err, results) => {
    res.status(200).json({ message: "Invite Sent"})
  });
  
});



module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
  server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}
