const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const http = require("http"); // Required for Socket.io
const { Server } = require("socket.io"); // Required for Socket.io


const PORT = 5001; 

const app = express();
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads"));

// Create an HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development (adjust in production)
  },
});

//file upload
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Connection
const db = mysql.createConnection({
  host: "srvd12ed324fsd5t34r34.mysql.database.azure.com",
  user: "rtdsfasdf23r2eddva32",
  password: "kPnWV7@@m%",  
  database: "chathaven_DB_NEW",
  port: 3306,
  ssl: { rejectUnauthorized: true },
  timezone: '+00:00', 
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected");
});


//create listing 
app.post("/listings", upload.single("image"), (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const image = req.file.filename;
  const author = req.body.author;

  const sql = "INSERT INTO listings (title, description, price, image, author, created_at) VALUES (?, ?, ?, ?, ?, NOW())";
  db.query(sql, [title, description, price, image, author], (err, result) => {
    if (err) {
      res.status(500).json({ message: "DB error" });
    } else {
      res.status(201).json({ message: "Created", listingId: result.insertId});
    }
  });
});

//get all listings
app.get("/listings", (req, res) => {
  const sql = "SELECT * FROM listings ORDER BY created_at DESC"; //newest first
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error getting listing", err);
      return res.status(500).json({ message: "DB error" });
    }
    res.status(200).json(results);
  });
});

//delete a listing
app.delete("/listings/:id", (req, res) => {
  const listingId = req.params.id;

  const sql = "DELETE FROM listings WHERE id = ?";
  db.query(sql, [listingId], (err, result) => {
    if (err) {
      console.error("Error deleting listing:", err);
      return res.status(500).json({ message: "DB error" });
    }

    res.status(200).json({ message: "Listing deleted" });
  });
});

//Update listing status
app.put("/listings/:id/toggle-status", (req, res) => {
  const listingId = req.params.id;

  const getStatusSQL = "SELECT status FROM listings WHERE id = ?";
  db.query(getStatusSQL, [listingId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ message: "Error reading status" });
    }

    const currentStatus = results[0].status;
    const newStatus = currentStatus === "sold" ? "to sell" : "sold";

    const updateSQL = "UPDATE listings SET status = ? WHERE id = ?";
    db.query(updateSQL, [newStatus, listingId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: "Error updating status" });
      }

      res.status(200).json({ message: "Status updated", newStatus });
    });
  });
});

// WebSocket Connection Handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for the user's initial connection and set their status to "online"
  socket.on("setOnline", (username) => {
    if (username) {
      const sql = "UPDATE users SET status = 'online', last_seen = UTC_TIMESTAMP() WHERE username = ?";
      db.query(sql, [username], (err) => {
        if (err) {
          console.error("Error updating status to online:", err);
        } else {
          
          // Broadcast the updated status to all clients
          io.emit("userStatusUpdate", { username, status: "online" });
        }
      });
    }
  });

  // Listen for incoming messages from the client
  socket.on("sendMessage", (data) => {
    
    const { messageToSend, loggedInUser, currentChannel, currentChannelType, quotedMessageId } = data;
    const sql = "INSERT INTO messages (message, sender, destination, time_sent, message_type, quoted_message_id) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?)";
    
    db.query(sql, [
      messageToSend,
      loggedInUser,
      currentChannel,
      currentChannelType,
      quotedMessageId || null
    ], (err, results) => {
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
        quoted_message_id: quotedMessageId || null,
        timestamp: new Date().toISOString(),
      });
    });
  });

  // Listen for user disconnection and set their status to "offline"
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Find the username associated with this socket (you may need to store this mapping)
    const username = socket.username; // Assuming you store the username in the socket object

    if (username) {
      const sql = "UPDATE users SET status = 'offline', last_seen = UTC_TIMESTAMP() WHERE username = ?";
      db.query(sql, [username], (err) => {
        if (err) {
          console.error("Error updating status to offline:", err);
        } else {
          
          // Broadcast the updated status to all clients
          io.emit("userStatusUpdate", { username, status: "offline" });
        }
      });
    }
  });

  // Listen for manual status updates (e.g., "away")
  socket.on("setStatus", (data) => {
    const { username, status } = data;

    if (username && status) {
      const sql = "UPDATE users SET status = ?, last_seen = UTC_TIMESTAMP() WHERE username = ?";
      db.query(sql, [status, username], (err) => {
        if (err) {
          console.error("Error updating status:", err);
        } else {
          
          // Broadcast the updated status to all clients
          io.emit("userStatusUpdate", { username, status });
        }
      });
    }
  });

// Listen for incoming invites from the client
socket.on("sendInvite", (data) => {
  const { invitedUser, loggedInUser, currentChannel } = data;
  if(invitedUser == loggedInUser){
    //return res.status(400).json({ message: "Cannot invite yourself" });
  } else if(invitedUser == ""){
    //return res.status(400).json({ message: "Must enter a user to invite" });
  } else if(currentChannel==""){
    //return res.status(400).json({ message: "Must select a channel first" });
  }

  const searchSQL = "SELECT * FROM channel_access WHERE channel_name=(?) AND permitted_users=(?)";
  db.query(searchSQL, [currentChannel, invitedUser], (err, results) => {
    if(results.length > 0){
      return res.status(400).json({ message: "User is already in channel" });
    } else {
      const searchInvitesSQL = "SELECT * FROM channel_invites WHERE invitee=(?) AND owner=(?) AND channel=(?) AND type='invite'";
      db.query(searchInvitesSQL, [invitedUser, loggedInUser, currentChannel], (err, results1) => {
        if(results1.length > 0){
          return res.status(400).json({ message: "User is already invited" });
        } else {
          const mysql = "INSERT INTO channel_invites (invitee, owner, channel, type) VALUES (?, ?, ?, 'invite')";
          db.query(mysql, [invitedUser, loggedInUser, currentChannel], (err, results2) => {
            if (err) return res.status(500).json({error: "Error - not your fault :) database fault", details: err});
            
            io.emit("receiveInvite", {
              invitee: invitedUser,       // Standardized property
              owner: loggedInUser,
              channel: currentChannel,
            });
          });
        }
      });
    }
  });
});

// Listen for incoming invites from the client
socket.on("sendRequest", (data) => {
  const { owner, loggedInUser, channelName } = data;
  if(owner == loggedInUser){
    return res.status(400).json({ message: "Cannot request to join your own channel" });
  } else if(channelName == ""){
    return res.status(400).json({ message: "Must enter a channel" });
  }

  const searchSQL = "SELECT * FROM channel_access WHERE channel_name=(?) AND permitted_users=(?)";
  db.query(searchSQL, [channelName, loggedInUser], (err, results) => {
    if(results.length > 0){
      return res.status(400).json({ message: "You are already in this channel" });
    } else {
      const searchInvitesSQL = "SELECT * FROM channel_invites WHERE invitee=(?) AND owner=(?) AND channel=(?) AND type='request'";
      db.query(searchInvitesSQL, [loggedInUser, owner, channelName], (err, results1) => {
        if(results1.length > 0){
          return res.status(400).json({ message: "You have already made a request to join" });
        } else {
          const addRequest = "INSERT INTO channel_invites (invitee, owner, channel, type) VALUES (?, ?, ?, 'request')";
          db.query(addRequest, [loggedInUser, owner, channelName], (err, results2) => {
            if (err) {
              return res.status(500).json({message: "Error - not your fault :) database fault", details: err});
            }
            io.emit("receiveRequest", {
              invitee: loggedInUser,       // Standardized property
              owner: owner,
              channel: channelName,
            });
          });
        }
      }); 
    }
  });
});

socket.on("processInvite", (data) => {
  const { acceptOrDeny, owner, invitee, channel } = data;
  const mysql = "DELETE FROM channel_invites WHERE invitee = (?) AND owner = (?) and channel = (?)";
  db.query(mysql, [invitee, owner, channel], (err, results) => {
  });

  if(acceptOrDeny == 'accept'){
    const mysql2 = "INSERT INTO channel_access (channel_name, permitted_users) VALUES (?, ?)";
  db.query(mysql2, [channel, invitee], (err, results) => {
    io.emit("receiveProcess", {
      status: "accepted", 
    });
  });
  } else {
    io.emit("receiveProcess", {
      status: "denied", 
    });
  }
});




// Starts a battlejack game by shuffling the deck and giving out two cards to each player
socket.on("startBattleJack", (data) => {
  const cardDeck = ["clubs_2", "clubs_3", "clubs_4", "clubs_5", "clubs_6", "clubs_7", "clubs_8", "clubs_9", "clubs_10", "clubs_J", "clubs_Q", "clubs_K", "clubs_A",
    "diamonds_2", "diamonds_3", "diamonds_4", "diamonds_5", "diamonds_6", "diamonds_7", "diamonds_8", "diamonds_9", "diamonds_10", "diamonds_J", "diamonds_Q", "diamonds_K", "diamonds_A",
    "hearts_2", "hearts_3", "hearts_4", "hearts_5", "hearts_6", "hearts_7", "hearts_8", "hearts_9", "hearts_10", "hearts_J", "hearts_Q", "hearts_K", "hearts_A",
    "spades_2", "spades_3", "spades_4", "spades_5", "spades_6", "spades_7", "spades_8", "spades_9", "spades_10", "spades_J", "spades_Q", "spades_K", "spades_A",];
  const {loggedInUser, currentChannel} = data

  for(let i = 0; i < cardDeck.length; i++){
    const randomPlace = Math.floor(Math.random() * cardDeck.length)
    const temp = cardDeck[i]
    cardDeck[i] = cardDeck[randomPlace]
    cardDeck[randomPlace] = temp
  }

  const player1 = loggedInUser
  const player2 = currentChannel
  const player1hand = [cardDeck.pop(), cardDeck.pop()]
  const player2hand = [cardDeck.pop(), cardDeck.pop()]
  const gameDeck = cardDeck
  io.emit("startBattleJackClient", {
    player1,
    player2,
    player1hand,
    player2hand,
    gameDeck
  })
})


//Hits the player with another card
socket.on("battlejackHit", (data) => {
  const whoseTurn = data.whoseTurn
  const deck = data.gameDeck
  const newCard = deck.pop();
  io.emit("battlejackReceiveHit", {
    whoseTurn,
    newCard,
    deck,
  })
  
})


//Player stands and skips their turn
socket.on("battlejackStand", (data) => {
  io.emit("battlejackReceiveStand", {
  })
})

//Detectss a gameover and notifies all players
socket.on("gameOver", (data) => {
  let gameEndMessage;
  if(data.victor === "tie"){
    gameEndMessage = "Game is tied, no one wins"
  } else {
    gameEndMessage = data.victor + " has won the game"
  }
  io.emit("receiveGameOver", {
    message: gameEndMessage
  })
})

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

    res.status(201).json({ message: "Account Created" });
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
      if (err){
        return res.status(500).json({ error: "DB error" });
      } else {
        
        const checkAdminSQL = "SELECT role FROM users WHERE username=?";
        db.query(checkAdminSQL, [loggedInUser], (err, result) => {
          if (err) return res.status(500).json({ error: "DB error" });
          let role = result[0].role;
          if(role ==="admin"){
            const addPermissionSQL = "INSERT INTO channel_access (channel_name, permitted_users) VALUES (?, 'ALLUSERS')";
            db.query(addPermissionSQL, [channelName], (err, result) => {
              if (err){
                return res.status(500).json({ error: "DB error" });
              } else {
               res.status(201).json({ message: "Channel Created" });
              }
          });
          } else {
            const addPermissionSQL = "INSERT INTO channel_access (channel_name, permitted_users) VALUES (?, ?)";
            db.query(addPermissionSQL, [channelName, loggedInUser], (err, result) => {
              if (err){
                return res.status(500).json({ error: "DB error" });
              } else {
                res.status(201).json({ message: "Channel Created" });
              }
            });
          }
        });   
      }
    });

    
  });
});




//Delete Channel
app.post("/deleteChannel", (req, res) => {
  const {currentChannel}  = req.body;
    //Updates the table of channels to not contain the deleted channel
    const updateChannelListSQL = "DELETE FROM channel_list WHERE channel_name=?";
    db.query(updateChannelListSQL, currentChannel, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "DB error" });
      } else {
        const eraseMessagesSQL = "DELETE FROM messages WHERE destination=? AND message_type='groupchat'";
        db.query(eraseMessagesSQL, currentChannel, (err, result) => {
          if (err){
            return res.status(500).json({ error: "DB error" });
          } else {
            const eraseMessagesSQL = "DELETE FROM channel_access WHERE channel_name=?";
            db.query(eraseMessagesSQL, currentChannel, (err, result) => {
              res.status(201).json({ message: "Channel Deleted" });
            });
            
          }
        });
      }
    });
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

//Remove users from channel
app.post("/quitChannel", (req, res) => {
  const {loggedInUser, currentChannel}  = req.body;
  
  const removeFromUserListSQL = "DELETE FROM channel_access WHERE (permitted_users=? AND channel_name=?)";
  
    db.query(removeFromUserListSQL, [loggedInUser, currentChannel], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ message: "Succesfully quit channel" });
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

//Check if user is creator of channel
app.post("/checkIsCreator", (req, res) => {
  const {loggedInUser, currentChannel}  = req.body;
  
  const checkCreatorSQL = "SELECT * FROM channel_list WHERE creator=(?) and channel_name=(?)";
    db.query(checkCreatorSQL, [loggedInUser, currentChannel], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      
      if(result.length > 0)
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
    let role;
    let generalList = []
    let userList = [] 
    let discoverList = []
    const checkAdminSQL = "SELECT role FROM users WHERE username=?";
    db.query(checkAdminSQL, [user], (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      role = result[0].role;
      if(role ==="admin"){
        for(let i = 0; i < results.length; i++){
          generalList[i] = results[i]
          }
          let allChannels = [generalList, [], []]
          res.status(201).json({ message:allChannels });
        } else {
          const checkGeneralChannelSQL = "SELECT * FROM channel_access WHERE permitted_users='ALLUSERS'";
          db.query(checkGeneralChannelSQL, [], (err, result1) => {
            if (err) {
              return res.status(500).json({ error: "DB error" });
            } else {
              generalList = result1
              const checkUserChannelSQL = "SELECT * FROM channel_access WHERE permitted_users=(?)";
              db.query(checkUserChannelSQL, [user], (err, result1) => {
                if (err) {
                  return res.status(500).json({ error: "DB error" });
                } else {
                  userList = result1
                  let tempCombined = generalList.concat(userList)
                  let nameCombined = []
                  for(let i = 0; i < tempCombined.length;i++){
                    nameCombined[i] = tempCombined[i].channel_name
                  }
                  let tracker = 0;
                  
                  for(let i = 0; i < results.length; i++){
                    if(!nameCombined.includes(results[i].channel_name)){
                      discoverList[tracker] = results[i]
                      tracker++
                    }
                  }
          
                  let allChannels = [generalList, userList, discoverList]
                  
                  res.status(201).json({ message:allChannels });
                }
                
              });
            }
            
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
    const mysqlQuery = `
      SELECT 
        m.*,
        q.sender AS quoted_sender,
        q.message AS quoted_message
      FROM messages m
      LEFT JOIN messages q ON m.quoted_message_id = q.my_row_id
      WHERE m.destination = ? AND m.message_type = ?
    `;
    db.query(mysqlQuery, [currentChannel, currentChannelType], (err, results) => {
      if (err) return res.status(500).json({error: "Error - not your fault :) database fault"});
      res.status(200).json({ message: results})
    });
  } else if(currentChannelType=='dm'){
    const mysqlQuery = `
      SELECT 
        m.*,
        q.sender AS quoted_sender,
        q.message AS quoted_message
      FROM messages m
      LEFT JOIN messages q ON m.quoted_message_id = q.my_row_id
      WHERE ((m.sender = ? AND m.destination = ?) OR (m.sender = ? AND m.destination = ?))
        AND m.message_type = ?
    `;
    db.query(mysqlQuery, [currentChannel, loggedInUser, loggedInUser, currentChannel, currentChannelType], (err, results) => {
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

// Delete User
app.post("/deleteUser", (req, res) => {
  const { username } = req.body;

  const mysql = "DELETE FROM users WHERE username = ?;";
  db.query(mysql, [username], (err, results) => {
    if (err) return res.status(500).json({error: "Error - not your fault :) database fault", details: err});
    
    if (results.affectedRows === 0) return res.status(401).json({ message: "Invalid username entry :/"});

    

    res.status(200).json({ message: "User deleted successfully!"})
  });
});

// Update user status
app.post("/updateStatus", (req, res) => {
  const { username, status } = req.body;

  const sql = "UPDATE users SET status = ?, last_seen = UTC_TIMESTAMP() WHERE username = ?";
  db.query(sql, [status, username], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.status(200).json({ message: "Status updated" });
  });
});

// Fetch user status
app.post("/getUserStatus", (req, res) => {
  const { username } = req.body;

  const sql = "SELECT status, last_seen FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length > 0) {
      res.status(200).json({ status: results[0].status, last_seen: results[0].last_seen });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});


module.exports = app;

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;

  server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}
