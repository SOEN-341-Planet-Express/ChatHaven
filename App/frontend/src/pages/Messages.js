import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React from "react";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { toast, Flip } from 'react-toastify';
import Picker from "emoji-picker-react";


function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedInUser, setLoggedInUser] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const [isCreator, setIsCreator] = useState("");

  //channelList is general channels
  const [channelList, setChannelList] = useState([]);
  const [userChannelList, setUserChannelList] = useState([]);
  const [discoverChannelList, setDiscoverChannelList] = useState([]);


  const [privateMessageList, setPrivateMessageList] = useState([]);

 
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showCreatePrivateModal, setShowCreatePrivateModal] = useState(false);
  const [showMessageList, setShowMessageList] = useState(false);
  const [showChannelList, setShowChannelList] = useState(true);

  const [sentRequestList, setSentRequestList] = useState([]);
  const [receivedRequestList, setReceivedRequestList] = useState([]);
  const [sentInviteList, setSentInviteList] = useState([]);
  const [receivedInviteList, setReceivedInviteList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [showRemoveUser, setShowRemoveUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [showButtonsAdmin, setShowButtonsAdmin] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [invitedUser, setInvitedUser] = useState("");

  const [username, setUsername] = useState("")
  const [acceptOrDeny, setAcceptOrDeny] = useState("")
  const [currentInvite, setCurrentInvite] = useState("")

  const [currentChannelType, setCurrentChannelType] = useState("")
  const [messageToSend, setMessageToSend] = useState("")
  const [currentChannel, setCurrentChannel] = useState("")
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null); 

  const [userStatus, setUserStatus] = useState({});

  const [quotedMessage, setQuotedMessage] = useState(null);

  //Battlejack variables
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player1hand, setPlayer1hand] = useState([]);
  const [player2hand, setPlayer2hand] = useState([]);
  const [player1handscore, setPlayer1handscore] = useState()
  const [player2handscore, setPlayer2handscore] = useState()
  const [player1score, setPlayer1score] = useState()
  const [player2score, setPlayer2score] = useState()
  const [player1stands, setPlayer1stands] = useState("")
  const [player2stands, setPlayer2stands] = useState("")
  const [isGameOver, setIsGameOver] = useState("")
  const [whoseTurn, setWhoseTurn] = useState("");
  const [gameDeck, setGameDeck] = useState([]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant", 
      block: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);



  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    setLoggedInUser(user);

    if (location.state && location.state.dmTarget) {
      setCurrentChannel(location.state.dmTarget);
      setCurrentChannelType("dm");
    
      if (location.state.autoMessage) {
        setTimeout(() => {
          if (socket) {
            socket.emit("sendMessage", {
              messageToSend: location.state.autoMessage,
              loggedInUser: user,
              currentChannel: location.state.dmTarget,
              currentChannelType: "dm",
              quotedMessageId: null,
            });
          } else {
            console.warn("Socket not ready yet for auto-message.");
          }
        }, 500); // Delay to let socket connect
      }
    
      window.history.replaceState({}, document.title);
    }    

    async function checkAdmin() {
      const response = await fetch("http://localhost:5001/checkAdmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsAdmin(data.message);
      } else {
        alert(data.message);
      }
    }

    //Load channels

    async function getChannels() {
      const response = await fetch("http://localhost:5001/getChannels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      if (response.ok) {
        setChannelList(data.message[0]);
        setUserChannelList(data.message[1]);
        setDiscoverChannelList(data.message[2]);

      } else {
        alert(data.message);
      }
    }


    //Load DM messages

    async function getDms() {
      const response = await fetch("http://localhost:5001/getPrivateMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      if (response.ok) {
        setPrivateMessageList(data.message);
      } else {
        alert(data.message);
      }
    }

    

    if(currentChannel || currentChannelType){
      loadMessages()
    }
    if(acceptOrDeny || currentInvite){
      processInvite()
    }
    if(isCreator){
      checkIsCreator()
    }
    

    
    getDms();
    checkAdmin();
    getChannels();
  }, [navigate, currentChannel, currentChannelType, acceptOrDeny, currentInvite, isCreator]);

  // Initialize the socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);
  
  // Listen for incoming messages via WebSocket
  useEffect(() => {
    if (!socket) return;
    socket.on("receiveMessage", (data) => {
      
      if (currentChannelType === "dm") {
        // For DMs, check both directions.
        if (
          (data.sender === loggedInUser && data.destination === currentChannel) ||
          (data.sender === currentChannel && data.destination === loggedInUser)
        ) {
          setMessageList((prev) => [...prev, data]);
        }
      } else if (data.destination === currentChannel) {
        // For group chats, a simple match is sufficient.
        setMessageList((prev) => [...prev, data]);
      }
    });
    return () => socket.off("receiveMessage");
  }, [socket, currentChannel, currentChannelType, loggedInUser]);

   // Listen for incoming invite via WebSocket
   useEffect(() => {
    if (!socket) return;
    socket.on("receiveInvite", (data) => {
      
        // For DMs, check both directions.
        if(data.invitee === loggedInUser){
          setReceivedInviteList((prev) => [...prev, data]);
        } else if (data.owner === loggedInUser) {
        // For group chats, a simple match is sufficient.
        setSentInviteList((prev) => [...prev, data]);
        }
    });
    return () => socket.off("receiveInvite");
  }, [socket, loggedInUser]);

  // Listen for incoming request via WebSocket
   useEffect(() => {
    if (!socket) return;
    socket.on("receiveRequest", (data) => {
      
        // For DMs, check both directions.
        if(data.invitee === loggedInUser){
          setSentRequestList((prev) => [...prev, data]);
        } else if (data.owner === loggedInUser) {
        // For group chats, a simple match is sufficient.
        setReceivedRequestList((prev) => [...prev, data]);
        }
    });
    return () => socket.off("receiveRequest");
  }, [socket, loggedInUser]);


  useEffect(() => {

    //Load requests sent to channel creator
    async function getSentRequests() {
      const response = await fetch("http://localhost:5001/getSentRequests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loggedInUser }),
      });

      const data = await response.json();
      if (response.ok) {
        setSentRequestList(data.message);
      } else {
        alert(data.message);
      }
    }

    //Load pending requests to your channels
    async function getReceivedRequests() {
      const response = await fetch("http://localhost:5001/getReceivedRequests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loggedInUser }),
      });

      const data = await response.json();
      if (response.ok) {
        setReceivedRequestList(data.message);
      } else {
        alert(data.message);
      }
    }

    //Load invites sent to users
    async function getSentInvites() {
      const response = await fetch("http://localhost:5001/getSentInvites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loggedInUser }),
      });

      const data = await response.json();
      if (response.ok) {
        setSentInviteList(data.message);
      } else {
        alert(data.message);
      }
    }

    //Load invites received from channel creators
    async function getReceivedInvites() {
      const response = await fetch("http://localhost:5001/getReceivedInvites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loggedInUser }),
      });

      const data = await response.json();
      if (response.ok) {
        setReceivedInviteList(data.message);
      } else {
        alert(data.message);
      }
    }

    if (!socket) return;
    socket.on("receiveProcess", (data) => {
      
      getReceivedInvites();
      getSentInvites();
      getReceivedRequests();
      getSentRequests();
    });
    return () => socket.off("receiveProcess");
  }, [socket, loggedInUser]);

  // Listen for deleteMessage event from the server
  useEffect(() => {
    if (!socket) return;
    // Listen for deleteMessage event from the server
    socket.on("deleteMessage", (data) => {
      // Update the message list by removing the message with the matching id
      setMessageList((prevMessages) => prevMessages.filter((msg) => msg.my_row_id !== data.id));
    });
    return () => socket.off("deleteMessage");
  }, [socket]);

  useEffect(() => {
    let awayTimer;
  
    const resetAwayTimer = () => {
      // Clear the existing timer
      clearTimeout(awayTimer);
  
      // Set status to "online"
      fetch("http://localhost:5001/updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loggedInUser, status: "online" }),
      });
  
      // Set a new timer for "away" status
      awayTimer = setTimeout(() => {
        fetch("http://localhost:5001/updateStatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loggedInUser, status: "away" }),
        });
      }, 5 * 60 * 1000); // 5 minutes
    };
  
    // Reset the timer on user activity
    window.addEventListener("mousemove", resetAwayTimer);
    window.addEventListener("keydown", resetAwayTimer);
  
    // Initialize the timer
    resetAwayTimer();
  
    // Cleanup
    return () => {
      clearTimeout(awayTimer);
      window.removeEventListener("mousemove", resetAwayTimer);
      window.removeEventListener("keydown", resetAwayTimer);
    };
  }, [loggedInUser]);
  

  useEffect(() => {
    const fetchUserStatus = async () => {
      const statusMap = {};
      for (const user of privateMessageList) {
        const response = await fetch("http://localhost:5001/getUserStatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: user }),
        });
        const data = await response.json();
        statusMap[user] = data;
      }
      setUserStatus(statusMap);
    };
  
    if (privateMessageList.length > 0) {
      fetchUserStatus();
    }
  }, [privateMessageList]);


  useEffect(() => {
    if (socket && loggedInUser) {
      socket.emit("setOnline", loggedInUser);
  
      const handleBeforeUnload = () => {
        fetch("http://localhost:5001/updateStatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: loggedInUser, status: "offline" }),
        });
      };
  
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [socket, loggedInUser]);


  useEffect(() => {
    if (!socket) return;
  
    // Listen for status updates from the server
    socket.on("userStatusUpdate", (data) => {
      setUserStatus((prev) => ({
        ...prev,
        [data.username]: { status: data.status, last_seen: new Date().toISOString() },
      }));
    });
  
    // Cleanup
    return () => {
      socket.off("userStatusUpdate");
    };
  }, [socket]);

  useEffect(() => {
    if(!socket) return;

    socket.on("startBattleJackClient", (data)=>{
      if(data.player1 === loggedInUser || data.player2 === loggedInUser){
        setPlayer1(data.player1)
        setPlayer2(data.player2)
        setPlayer1hand(data.player1hand)
        setPlayer2hand(data.player2hand)
        setGameDeck(data.gameDeck)
        setWhoseTurn("player1")
        setIsGameOver("false")
        
        var p1total = countCard(data.player1hand[0]) + countCard(data.player1hand[1]);
        var p2total = countCard(data.player2hand[0]) + countCard(data.player2hand[1]);;
        
        setPlayer1handscore(p1total)
        setPlayer2handscore(p2total)
      }
    });

    return () => socket.off("startBattleJackClient");

  }, [socket, loggedInUser])
  
  function countCard(card){
    if(card.charAt(card.length-1) === "J" || card.charAt(card.length-1) === "Q" || card.charAt(card.length-1) === "K" || card.charAt(card.length-1) === "0"){
      return 10;
    } else if (card.charAt(card.length-1) === "A"){
      return 1;
    } else {
      return parseInt(card.charAt(card.length-1))
    }
  }
  const createChannel = async (e) => {
    e.preventDefault();
    if (!channelName) return toast.info('Please enter a channel name', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Flip,
      });

    
    const response = await fetch("http://localhost:5001/createChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName, loggedInUser }),

    });
    
    const data = await response.json();
    if (response.ok) {
      toast.success('Channel Created!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        });       
      setChannelList([...channelList, channelName]);
      setChannelName("");
      setShowCreateModal(false);
    } else {
      alert(data.message);
    }
  };

  const deleteChannel = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5001/deleteChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentChannel }),
    });
  
    const data = await response.json();
    if (response.ok) {
      toast.success(data.message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        });      
      setChannelList(channelList.filter(channel => channel !== channelName));
      setChannelName("");
      
    } else {
      alert(data.message);
    }
  };


  const joinChannel = async (e) => {
    e.preventDefault();
    if (!channelName) return alert("Please enter a channel name.");
  };


  
  
  const assignUsers = async (e) => {
    e.preventDefault()
    const response = await fetch("http://localhost:5001/assignUsers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, channelName }),
    })
    
    const data = await response.json()

    if (response.ok) {

      toast.success('User assigned to channel!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        });       

      setShowAssignUser(false)
    } else {
      alert(data.message)
    }
  }

  const removeUsers = async (e) => {
    e.preventDefault()
    
    const response = await fetch("http://localhost:5001/removeUsers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, channelName }),
    })
    
    const data = await response.json()

    if (response.ok) {

      toast.success('User removed from channel!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        }); 

      setShowRemoveUser(false)
    } else {
      alert(data.message)
    }
  }

  const quitChannel = async (e) => {
    e.preventDefault()
    
    const response = await fetch("http://localhost:5001/quitChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loggedInUser, currentChannel }),
    })
    
    const data = await response.json()

    if (response.ok) {

      toast.success('You have left channel!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        }); 

      setShowQuitModal(false)
    } else {
      alert(data.message)
    }
  }


  const loadMessages = async () => {
    const response = await fetch("http://localhost:5001/loadMessages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentChannel, currentChannelType, loggedInUser }),
    })
    
    const data = await response.json()

    if (response.ok) {
      setMessageList(data.message)
    } else {
      alert(data.message)
    }
  }

  
  
  const deleteUser = async (e) => {
    e.preventDefault()
    
    const response = await fetch("http://localhost:5001/deleteUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    })
    
    const data = await response.json()

    if (response.ok) {
      alert("User Deleted!")
      setShowDeleteUser(false)
    } else {
      alert(data.message)
    }
    loadMessages()
  }

  // Emit the message through the WebSocket connection
  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageToSend.trim() || !socket) return;
    
    if(messageToSend === "/battlejack"){
      if(currentChannelType === "dm"){
        socket.emit("startBattleJack", {
          loggedInUser,
          currentChannel,
        })
      } else {
        alert("must be in dm to play battlejack")
      }
      
    } else {
      socket.emit("sendMessage", {
        messageToSend,
        loggedInUser,
        currentChannel,
        currentChannelType,
        quotedMessageId: quotedMessage ? quotedMessage.my_row_id : null,
      });
    }
    

    // Clear both the message input and quoted message
    setMessageToSend("");
    setQuotedMessage(null);
  };

  const checkIsCreator = async (e) => {
    //e.preventDefault()
    const response = await fetch("http://localhost:5001/checkIsCreator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loggedInUser, currentChannel }),
  });
  const data = await response.json();
  if (response.ok) {
    setIsCreator(data.message);
  } else {
    alert(data.message);
  }
}
  
  function listOutChannels(items) {
    return items.map((item, index) => (
      <li key={index} className="btn bg-gray-600 hover:bg-gray-500 p-4 w-full text-left rounded-lg cursor-pointer transition duration-200"
        onClick={(e) => {
        setCurrentChannel(item.channel_name);
        setCurrentChannelType('groupchat');
        setIsCreator("changed")
        }}>
          {item.channel_name}
      </li>
    ));
  }

  function listOutDiscover(items) {
    return items.map((item, index) => (
      <li key={index} className="btn bg-gray-600 hover:bg-gray-500 p-4 w-full text-left rounded-lg cursor-pointer transition duration-200">
          {item.channel_name}
      </li>
    ));
  }

  function listOutDMs(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
        <button 
          onClick={(e) => {
            setCurrentChannel(item);
            setCurrentChannelType('dm');
          }} 
          className="w-full text-left p-2 flex justify-between items-center"
        >
          <span>{item}</span> {/* Username on the left */}
          <span 
            className={`text-sm ${
              userStatus[item]?.status === "online" ? "text-green-400" : 
              userStatus[item]?.status === "away" ? "text-yellow-400" : 
              "text-red-400"
            }`}
            title={
              userStatus[item]?.status === "offline" 
                ? `Last seen: ${new Date(userStatus[item]?.last_seen).toLocaleString()}` 
                : ""
            }
          >
            {userStatus[item]?.status === "online" ? "Online" : 
             userStatus[item]?.status === "away" ? "Away" : 
             "Offline"}
          </span>
        </button>
      </li>
    ));
  }

  function listOutSentRequests(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 pl-4 pt-2 pb-2 rounded-lg cursor-pointer transition duration-200">
          <p>Requested user: <text className="text-green-400">{item.owner}</text></p>
          <p className="pb-2">For channel: <text className="text-yellow-400">{item.channel} </text></p>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-lg transition duration-200 transform hover:scale-105" onClick={()=>{setAcceptOrDeny("deny"); setCurrentInvite(item);}}>Cancel</button> 
      </li>
    ));
  }

  function listOutReceivedRequests(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 pl-4 pt-2 pb-2 rounded-lg cursor-pointer transition duration-200">
          <p>Request from: <text className="text-green-400">{item.invitee}</text></p>
          <p className="pb-2">For channel: <text className="text-yellow-400">{item.channel} </text></p>
          <p><button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded-lg transition duration-200 transform hover:scale-105" onClick={()=>{setAcceptOrDeny("accept") ; setCurrentInvite(item);}}>Accept</button>
          <text className="px-2"></text>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-lg transition duration-200 transform hover:scale-105" onClick={()=>{setAcceptOrDeny("deny") ; setCurrentInvite(item);}}>Deny</button></p> 
      </li>
    ));
  }

  function listOutSentInvites(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 pl-4 pt-2 pb-2 rounded-lg cursor-pointer transition duration-200">
          <p>Invited user: <text className="text-green-400">{item.invitee}</text></p>
          <p className="pb-2">To channel: <text className="text-yellow-400">{item.channel} </text></p>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-lg transition duration-200 transform hover:scale-105" onClick={()=>{setAcceptOrDeny("deny") ; setCurrentInvite(item);}}>Cancel</button> 
      </li>
    ));
  }

  function listOutReceivedInvites(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 pl-4 pt-2 pb-2 rounded-lg cursor-pointer transition duration-200">
          <p>Invite from: <text className="text-green-400">{item.owner}</text></p>
          <p className="pb-2">To channel: <text className="text-yellow-400">{item.channel} </text></p>
          <p><button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded-lg transition duration-200 transform hover:scale-105" onClick={()=>{setAcceptOrDeny("accept") ; setCurrentInvite(item);}}>Accept</button>
          <text className="px-2"></text>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-2 rounded-lg transition duration-200 transform hover:scale-105" onClick={()=>{setAcceptOrDeny("deny") ; setCurrentInvite(item);}}>Deny</button></p> 
      </li>
    ));
  }


  const deleteMessage = async (messageId) => {
    const response = await fetch("http://localhost:5001/deleteMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: messageId }), // Send the my_row_ID to be deleted
    });
  
    const data = await response.json();
  
    if (response.ok) {
      toast.success('Message Deleted!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Flip,
        });        
      // Remove the message using the correct property name
      setMessageList((prevMessages) => prevMessages.filter((msg) => msg.my_row_id !== messageId));
      loadMessages(messageId) // Reload page after message is sent
    } else {
      alert(data.message);
    }
  };

  
  const handleQuoteMessage = (message) => {
    setQuotedMessage(message);
    setMessageToSend(`@${message.sender} `);
  };

  function listOutMessages(items) {
    return items.map((item) => (
      <div key={item.my_row_id} className="flex flex-col bg-gray-600 p-2 rounded-lg mb-2">
        {/* Render quoted message if exists */}
        {item.quoted_message_id && (
          <div className="border-l-4 border-blue-500 pl-2 mb-1 bg-gray-700 rounded-r-lg">
            <small className="text-gray-300">
              <span className="text-blue-400">{item.quoted_sender}</span>:{" "}
              {item.quoted_message && item.quoted_message.length > 100 
                ? item.quoted_message.substring(0, 100) + "..." 
                : item.quoted_message}
            </small>
          </div>
        )}
        
        {/* Main message content */}
        <div className="flex justify-between">
          <div>
            <p>
              <strong className="text-green-400">{item.sender}: </strong>
              {item.message}
            </p>
            {/* Show Message ID only if the user is an admin */}
            {isAdmin === "true" && (
              <p className="text-gray-400 text-sm">ID: {item.my_row_id}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuoteMessage(item)}
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              💬
            </button>
            {isAdmin === "true" && (
              <button
                onClick={() => deleteMessage(item.my_row_id)}
                className="rounded-lg hover:bg-red-700 px-2 py-1"
              >
                ❌
              </button>
            )}
          </div>
        </div>
      </div>
    ));
  }

  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage(e);
    }
  };

  function displayBattleJackCards(){ return(
    <div>
    {((player1 === loggedInUser) && (player2 === currentChannel) && (isGameOver === "false")) && (
      <div className="bg-green-800 rounded-t-lg p-2">
        <div className="flex justify-center pb-2 pt-2 text-2xl">BattleJack!</div>
        <div className="flex justify-center">Opponent's Hand:</div>
        <div className="flex justify-center scale-50 -mt-20 -mb-20">
          {cards(player2hand)}
        </div>
        <div className="flex justify-center">Your Hand:</div>
        <div className="flex justify-center scale-50 -mt-20 -mb-20">
          {cards(player1hand)}
        </div>
      </div>
    )}

    {((player2 === loggedInUser) && (player1 === currentChannel) && (isGameOver === "false")) && (
      <div className="bg-green-800 rounded-t-lg p-2">
        <div className="flex justify-center pb-2 pt-2 text-2xl">BattleJack!</div>
        <div className="flex justify-center">Opponent's Hand:</div>
      <div className="flex justify-center scale-50 -mt-20 -mb-20">
        {cards(player1hand)}
      </div>
      <div className="flex justify-center">Your Hand:</div>
      <div className="flex justify-center scale-50 -mt-20 -mb-20">
        {cards(player2hand)}
      </div>
    </div>
    )}

    {((whoseTurn === "player1" && player1 == loggedInUser && player2 === currentChannel && (isGameOver === "false")) && 
    <div className="bg-green-800 rounded-b-lg pb-4">
  <div className="flex justify-center pt-4">It's your turn, what do you do? Current hand score is {player1handscore}</div>
  <div className="flex justify-center pt-4">
    <div className="px-2">
      <button onClick={battlejackHit}className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-4 rounded-lg transition duration-200 transform hover:scale-105">Hit</button>
    </div>
    <div className="px-2">  
      <button onClick={battlejackStand}className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-4 rounded-lg transition duration-200 transform hover:scale-105">Stand</button>
    </div>
  </div>
  </div>)}
  
  {((whoseTurn === "player2" && player2 == loggedInUser && player1 === currentChannel && (isGameOver === "false")) && 
    <div className="bg-green-800 rounded-b-lg pb-4">
  <div className="flex justify-center pt-4">It's your turn, what do you do? Current hand score is {player2handscore}</div>
  <div className="flex justify-center pt-4">
    <div className="px-2">
      <button onClick={battlejackHit} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-4 rounded-lg transition duration-200 transform hover:scale-105">Hit</button>
    </div>
    <div className="px-2">  
      <button onClick={battlejackStand} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-4 rounded-lg transition duration-200 transform hover:scale-105">Stand</button>
    </div>
  </div>
  </div>)}

  {((whoseTurn !== "player1" && player1 === loggedInUser && player2 === currentChannel && (isGameOver === "false"))) && 
    <div className="bg-green-800 rounded-b-lg pb-4">
      <div className="flex justify-center pt-4">It's not your turn, please wait. Current hand score is {player1handscore}</div>
    </div>
  }

{((whoseTurn !== "player2" && player2 === loggedInUser) && player1 === currentChannel && (isGameOver === "false")) && 
    <div className="bg-green-800 rounded-b-lg pb-4">
      <div className="flex justify-center pt-4">It's not your turn, please wait. Current hand score is {player2handscore}</div>
    </div>
  }

  {isGameOver === "true" && 
  <div className="bg-green-800 rounded-lg pb-40 pt-40 flex justify-center">{whoseTurn}</div>
  }
    </div>
  
)}

  function cards(hand){
    return hand.map((card) => (
      <img className="px-2" src={process.env.PUBLIC_URL + "/deck/" + card + ".png"}/>
    ))
  }

  //Battlejack hit
  const battlejackHit = async (e) => {
    
    socket.emit("battlejackHit", {
      whoseTurn,
      gameDeck,
    });
  };

  //Battlejack receive hit
  useEffect(() => {
    if(!socket) return;

    socket.on("battlejackReceiveHit", (data)=>{
      
      if(player1 === loggedInUser || player2 === loggedInUser){
        if(data.whoseTurn === "player1"){
          setPlayer1hand((prev) => [...prev, data.newCard]);
          var newScore = player1handscore + countCard(data.newCard)
          checkVictory(newScore)
          setPlayer1handscore(newScore)
          setWhoseTurn("player2")
          
          
        } else if(data.whoseTurn === "player2"){
          setPlayer2hand((prev) => [...prev, data.newCard]);
          var newScore = player2handscore + countCard(data.newCard)
          checkVictory(newScore)
          setPlayer2handscore(newScore)
          setWhoseTurn("player1")
          
          
        }
        setGameDeck(data.deck)
      }
    });


    if(whoseTurn){
      displayBattleJackCards();
    }

    return () => socket.off("battlejackReceiveHit");
    
  }, [socket, loggedInUser, whoseTurn])


//Battlejack stand
  const battlejackStand = async (e) => {
    socket.emit("battlejackStand", {
    });
  };

  //Battlejack receive stand
  useEffect(() => {
    if(!socket) return;

    socket.on("battlejackReceiveStand", (data)=>{
      
      if(whoseTurn === "player1"){
        if(player2stands === "true"){
          //endgame
        } else {
          setPlayer1stands("true")
          setWhoseTurn("player2")
        }
      } else if(whoseTurn === "player2"){
        if(player1stands === "true"){
          //endgame
        } else {
          setPlayer2stands("true")
          setWhoseTurn("player1")
        }
        
      }

    });


    if(whoseTurn){
      displayBattleJackCards();
    }

    return () => socket.off("battlejackReceiveStand");
    
  }, [socket, whoseTurn])

function checkVictory(playerScore){
  if(player1stands === "true" && player2stands === "true"){
    setWhoseTurn("gameover")
    if(player1handscore > player2handscore){
      socket.emit("gameOver", {
        victor: player1
      })
    } else if (player1handscore < player2handscore){
      socket.emit("gameOver", {
        victor: player2
      })
    } else if (player1handscore == player2handscore){
      socket.emit("gameOver", {
        victor: "tie"
      })
    }
  }
  if(playerScore == 21){
    socket.emit("gameOver", {
      victor: whoseTurn
    })
  } else if ( playerScore > 21) {
    if(whoseTurn === "player1"){
      socket.emit("gameOver", {
        victor: player2
      })
    } else if(whoseTurn === "player2"){
      socket.emit("gameOver", {
        victor: player1
      })
    }
  } else {
    
  }
}

//Battlejack receive game over
useEffect(() => {
  if(!socket) return;

  socket.on("receiveGameOver", (data)=>{
    setWhoseTurn(data.message)
    setIsGameOver("true")
  });

  return () => socket.off("receiveGameOver");
  
}, [socket, whoseTurn])

  //Processing invite accept/deny
  
  const processInvite = async (e) => {
    //e.preventDefault();
    const owner = currentInvite.owner;
    const invitee = currentInvite.invitee;
    const channel = currentInvite.channel;

    socket.emit("processInvite", {
      acceptOrDeny,
      owner,
      invitee,
      channel,
    });
  };

  //Sending invite
  const sendInvite = async (e) => {
    e.preventDefault();
    setShowInviteModal(false)
    socket.emit("sendInvite", {
      invitedUser,
      loggedInUser,
      currentChannel,
    });
  };

  //Sending request
  const sendRequest = async (e) => {
    e.preventDefault();
    const owner = getChannelOwner(channelName)
    setShowJoinModal(false)
    socket.emit("sendRequest", {
      owner,
      loggedInUser,
      channelName,
    });
  };

  function getChannelOwner(queryName){
    var tempCombined = channelList.concat(userChannelList, discoverChannelList)
    for(var i = 0; i < tempCombined.length; i++){
      if(queryName===tempCombined[i].channel_name){
        return tempCombined[i].creator;
      }
    }
  }

    const onEmojiClick = (emojiData) => {
    setMessageToSend((prev) => prev + emojiData.emoji);

  };
    
//This code handles changing the color of the currently selected chanel
const defaultColor = 'bg-gray-600'; 
const activeColor = 'bg-gray-500'; 
const buttons = document.querySelectorAll('.btn');

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    // Rest all button colors
    buttons.forEach((b) => {
      b.classList.add(defaultColor);
      b.classList.remove(activeColor);
    });
    // Add active color on the clicked button, remove default color
    btn.classList.remove(defaultColor);
    btn.classList.add(activeColor);
  });
});

const unselectColor = 'clear'; 
const selectColor = 'bg-gray-700'; 
const buttons2 = document.querySelectorAll('.chan');

buttons2.forEach((chan) => {
  chan.addEventListener('click', () => {
    // Rest all button colors
    buttons2.forEach((b) => {
      b.classList.add(unselectColor);
      b.classList.remove(selectColor);
    });
    // Add active color on the clicked button, remove default color
    chan.classList.remove(unselectColor);
    chan.classList.add(selectColor);
  });
});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            <h1 className="text-3xl font-bold">ChatHaven</h1>
            <div className="mt-6 text-center">
              
        </div>
          </div>
          <div className="flex items-center gap-4">
          <div>
              <div><button
            onClick={() => navigate("/Listings")}
            className="text-white mr-6 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                clipRule="evenodd"
              />
            </svg>
            Marketplace
          </button></div>
        </div>
          <button
          onClick={async () => {
            try {
              // Notify the server to update status to "offline"
              const response = await fetch("http://localhost:5001/updateStatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: loggedInUser, status: "offline" }),
              });

              if (!response.ok) {
                throw new Error("Failed to update status");
              }

              // Close the socket connection
              if (socket) {
                socket.disconnect();
              }

              // Remove loggedInUser from localStorage
              localStorage.removeItem("loggedInUser");

              // Navigate to the home page
              navigate("/home");
            } catch (err) {
              console.error("Error updating status on logout:", err);
              alert("Failed to update status. Please try again.");
            }
          }}
          className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
        >
          Logout
        </button>
        </div>
      </div>
        
        <div>

        <h1 className = "text-l font-semibold py-2 px-4 font-size-30 ">Welcome {loggedInUser}</h1>
        </div>
        <div className="flex bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="w-1/4 bg-gray-700 p-4 flex flex-col h-full">
            <div className="flex bg-gray-800 gap-5 -mt-4 items-start -mr-4 -ml-4 pl-3">
              <button onClick={() => {setShowMessageList(false) ; setShowChannelList(true);}} className="chan -ml-4 text-xl rounded-t-lg bg-gray-700 hover:bg-gray-700 text-white font-semibold py-3 px-5 transition duration-200 transform">Channels</button>
              <button onClick={() => {setShowChannelList(false) ; setShowMessageList(true);}} className="chan -ml-5 text-xl rounded-t-lg bg-black-400 hover:bg-gray-700 text-white font-semibold py-3 px-5 transition duration-200 transform">Private</button>
            </div>
            {(isAdmin === "true"  && showChannelList ) && (
              <div className="flex justify-between pt-4">
                <button onClick={() => setShowCreateModal(true)} className="bg-green-600   hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-lg transition duration-200 transform hover:scale-105">Create</button>
                <button onClick={deleteChannel} data-testid = "New-Delete-Channel" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition duration-200 transform hover:scale-105">Delete</button>
              </div>
            )}
             
            
            {showChannelList && (<>
            <h7 className="flex justify-between text-xl font-semibold mb-4 pt-4">Public Channels </h7>
            
            
            <ul className="space-y-2 mb-4">{listOutChannels(channelList)}</ul>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Your Channels</h2>
                <button onClick={() => setShowCreatePrivateModal(true)} className="scale-115 hover:scale-125">✚</button>
              </div>
            </div>
            <ul className="space-y-2 mb-4">{listOutChannels(userChannelList)}</ul>
            
            <div className="flex justify-between items-center mb-4">
            <h8 className="flex justify-between text-xl font-semibold mb-4">Discover</h8>
            <button onClick={() => setShowJoinModal(true)} className="flex justify-between hover:scale-105 mb-4">Join 
            </button>
            </div>
            <ul className="space-y-2 mb-4">{listOutDiscover(discoverChannelList)}</ul>
            </>) }
            
            {showMessageList && (<ul className="space-y-2 mb-4 pt-5">{listOutDMs(privateMessageList)}</ul>)}
            

        
          </div>

          <div className="w-2/4 p-4">
          
          <h2 className="flex justify-between mb-4">
            <h3 className = " font-semibold text-xl ">Messages</h3>
          {/* admin buttons*/}
          {/* clicking the assign users button should bring up a list of the users not already in the channel for the admin to select*/}

          
          {(isAdmin === "true" && showButtonsAdmin) && (
  <>

            <button
      onClick={() => setShowAssignUser(true)}
      className="scale-60 text-white rounded-lg transition duration-200 ml-20 transform hover:scale-80"
    >
      Assign New Users
    </button>

    <button 
      onClick={() => setShowRemoveUser(true)} 
      className="scale-70 text-white  rounded-lg transition duration-200 transform hover:scale-115 "
    >
      Remove User
    </button>

    <button
      onClick={() => setShowDeleteUser(true)}
      test-userid = 'DeleteUser'
      className="text-l"
    >
      Delete a User
    </button>
  </>
)}

{(isAdmin === "false" && showButtonsAdmin) && (
  <>
  {(isCreator === "true" &&(
  <button onClick={() => setShowInviteModal(true)} className="flex justify-end transition-500 hover:text-xl ml-40 ">Send Invite</button>))}
  {(isCreator === "false" && (
    <button onClick={() => setShowQuitModal(true)} className="flex justify-end  transition-500 hover:text-xl">Quit</button>
  ))}
  

 </>
)}
<button onClick={ () => setShowButtonsAdmin(prev=>!prev)} test-userid = "ellipsis" className=" text-xl p-0 m-0 h-auto w-auto transition-500 hover:text-xxl font-semibold">⁝</button>
</h2>
          
          

          <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4 min-h-[30rem] max-h-[35rem] overflow-y-auto">
          <div className="space-y-4">{listOutMessages(messageList)} {displayBattleJackCards()}
          </div>
          <div ref={messagesEndRef} /> {                      }
          </div>
          </div>
          
          <div className="mt-2 flex flex-col">
            {/* Quote Preview */}
            {quotedMessage && (
              <div className="mb-2 p-2 bg-gray-700 border-l-4 border-blue-500 rounded flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-sm">
                    Replying to <strong className="text-blue-400">{quotedMessage.sender}</strong>:{" "}
                    <span className="text-gray-300">
                      {quotedMessage.message.length > 100
                        ? quotedMessage.message.substring(0, 100) + "..."
                        : quotedMessage.message}
                    </span>
                  </span>
                </div>
                <button 
                  onClick={() => setQuotedMessage(null)} 
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
            
            {/* Message Input Area */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="bg-gray-700 border border-gray-600 p-3 mr-2 rounded-lg"
                >
                  😀
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg z-50">
                    <Picker onEmojiClick={onEmojiClick} />
                  </div>
                )}
              </div>
              <input
                type="text"
                value={messageToSend}
                onChange={(e) => setMessageToSend(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-5/6 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mr-2"
              />
              <button
                id="messageField"
                className="bg-gray-500 w-1/6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>

          </div>
          <div className="w-1/4 pt-4 pr-4">
          <div className="bg-gray-700 rounded-lg">
          <text className="p-2 flex text-xl font-semibold">Sent requests</text>
          <ul className="space-y-2 py-2 px-2 mb-4">{listOutSentRequests(sentRequestList)}</ul>
          </div>
          <div className="bg-gray-700 rounded-lg">
          <text className="p-2 flex text-xl font-semibold">Received requests</text>
          <ul className="space-y-2 py-2 px-2 mb-4">{listOutReceivedRequests(receivedRequestList)}</ul>
          </div>
          <div className="bg-gray-700 rounded-lg">
          <text className="p-2 flex text-xl font-semibold">Sent invites</text>
          <ul className="space-y-2 py-2 px-2 mb-4">{listOutSentInvites(sentInviteList)}</ul>
          </div>
          <div className="bg-gray-700 rounded-lg">
          <text className="p-2 flex text-xl font-semibold">Received invites</text>
          <ul className="space-y-2 py-2 px-2 mb-4">{listOutReceivedInvites(receivedInviteList)}</ul>
          </div>
          </div>
        </div>
        
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Enter Channel Name</h2>
            <input data-testid="Channel-Name-Input" type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button data-testid="Channel-Name-Submit" onClick={createChannel} className="bg-green-600 px-4 py-2 rounded-lg">Create</button>
              <button onClick={() => setShowCreateModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Enter Channel to Join</h2>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button onClick={sendRequest} className="bg-green-600 px-4 py-2 rounded-lg">Request to join</button>
              <button onClick={() => setShowJoinModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Enter User to Invite</h2>
            <input type="text" value={invitedUser} onChange={(e) => setInvitedUser(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button onClick={sendInvite} className="bg-green-600 px-4 py-2 rounded-lg">Invite</button>
              <button onClick={() => setShowInviteModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Enter Channel to Delete</h2>
            <input data-testid="Delete-Channel-Input" type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button data-testid="Delete-Channel-Submit" onClick={deleteChannel} className="bg-yellow-500 px-4 py-2 rounded-lg">Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showQuitModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Do you really wish to quit?</h2>
            
            <div className="mt-4 flex justify-between">
              <button onClick={quitChannel} className="bg-yellow-500 px-4 py-2 rounded-lg">Yes</button>
              <button onClick={() => setShowQuitModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">No</button>
            </div>
          </div>
        </div>
      )}

    {showCreatePrivateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-2">Enter New Channel Name</h2>
            <input data-testid="Channel-Name-Input" type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="Name of New Channel"className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <h3 className="text-xl mt-5 mb-2">Invite User</h3>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User to invite" className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button onClick={(e)=>{ e.preventDefault(); createChannel(e); sendInvite(e); setShowCreatePrivateModal(false);}}className="bg-green-600 px-4 py-2 rounded-lg">Create</button>
              <button onClick={() => setShowCreatePrivateModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAssignUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Enter Channel Name</h2>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="To Channel" className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" /><p></p>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User to add" className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button onClick={assignUsers} className="bg-green-600 px-4 py-2 rounded-lg">Add</button>
              <button onClick={() => setShowAssignUser(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showRemoveUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Enter Channel Name</h2>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="From Channel" className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" /><p></p>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User to remove" className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
            <button onClick={removeUsers} className="bg-green-600 px-4 py-2 rounded-lg">Remove</button>
            <button onClick={() => setShowRemoveUser(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}


        {showDeleteUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl mb-4">Enter Username</h2>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="User to delete" className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
                    <div className="mt-4 flex justify-between">
                    <button onClick={deleteUser} className="bg-green-600 px-4 py-2 rounded-lg">Delete User</button>
                    <button onClick={() => setShowDeleteUser(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

      
    </div>
  );
}

export default Messages;
