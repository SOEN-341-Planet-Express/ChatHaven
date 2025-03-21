
import { useNavigate } from "react-router-dom";
import React from "react";
import io from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { toast, Flip } from 'react-toastify';
import Picker from "emoji-picker-react";


function Messages() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const [channelList, setChannelList] = useState([]);
  const [privateMessageList, setPrivateMessageList] = useState([]);

 
  const [showJoinModal, setShowJoinModal] = useState(false);
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [username, setUsername] = useState("")
  const [currentChannelType, setCurrentChannelType] = useState("")
  const [messageToSend, setMessageToSend] = useState("")
  const [currentChannel, setCurrentChannel] = useState("")
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({block: "end"});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList]);



  useEffect(() => {
    const user = localStorage.getItem("loggedInUser");
    setLoggedInUser(user);

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
        setChannelList(data.message);
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

    //Load requests sent to channel creator
    async function getSentRequests() {
      const response = await fetch("http://localhost:5001/getSentRequests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
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
        body: JSON.stringify({ user }),
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
        body: JSON.stringify({ user }),
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
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      if (response.ok) {
        setReceivedInviteList(data.message);
      } else {
        alert(data.message);
      }
    }

    if(currentChannel || currentChannelType){
      loadMessages()
    }

    getReceivedInvites();
    getSentInvites();
    getReceivedRequests();
    getSentRequests();
    getDms();
    checkAdmin();
    getChannels();
  }, [navigate, currentChannel, currentChannelType]);

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
  if (!channelList.includes(channelName)) return toast.error('Channel does not exist.', {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Flip,
    })
    
    const response = await fetch("http://localhost:5001/deleteChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName }),
    });
  
    const data = await response.json();
    if (response.ok) {
      toast.success('Channel Deleted!', {
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
      setShowDeleteModal(false);
    } else {
      alert(data.message);
    }
  };


  const joinChannel = async (e) => {
    e.preventDefault();
    if (!channelName) return alert("Please enter a channel name.");
  };

  const quitChannel = async (e) => {
    e.preventDefault();
    if (!channelName) return alert("Please enter a channel name.");
    if (!channelList.includes(channelName)) return alert("Channel does not exist."); 
    // <- Added check
  };
  
  const createPrivateChannel = async (e) => {
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


  const loadMessages = async () => {
    const response = await fetch("http://localhost:5001/loadMessages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentChannel }),
    })
    
    const data = await response.json()

    if (response.ok) {
      setMessageList(data.message)
    } else {
      alert(data.message)
    }
  }

  const sendMessage = async (e) => {
    
    e.preventDefault()
    const response = await fetch("http://localhost:5001/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageToSend, loggedInUser, currentChannel, currentChannelType }),
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
    socket.emit("sendMessage", {
      messageToSend,
      loggedInUser,
      currentChannel,
      currentChannelType,
    });
    setMessageToSend("");
  };
  
  function listOutChannels(items) {
    return items.map((item, index) => (
      <li key={index} className="btn bg-gray-600 hover:bg-gray-500 p-4 w-full text-left rounded-lg cursor-pointer transition duration-200"
        onClick={(e) => {

        setCurrentChannel(item);
        setCurrentChannelType('groupchat');

        }}>
          {item}
      </li>
    ));
  }

  function listOutDMs(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
        <button 
          onClick={(e) => {
            setCurrentChannel(item);setCurrentChannelType('dm');

          }} 
          className="w-full text-left p-2"
        >
          {item}
        </button>
      </li>
    ));
  }

  function listOutSentRequests(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 hover:bg-gray-500 p-4 rounded-lg cursor-pointer transition duration-200">
          You have asked user {item.owner} to join channel {item.channel}  
      </li>
    ));
  }

  function listOutReceivedRequests(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 hover:bg-gray-500 p-4 rounded-lg cursor-pointer transition duration-200">
          User {item.invitee} has asked to join channel {item.channel}  
      </li>
    ));
  }

  function listOutSentInvites(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 hover:bg-gray-500 p-4 rounded-lg cursor-pointer transition duration-200">
          You have asked {item.invitee} to join channel {item.channel}  
      </li>
    ));
  }

  function listOutReceivedInvites(items) {
    return items.map((item, index) => (
      <li key={index} className="bg-gray-600 hover:bg-gray-500 p-4 rounded-lg cursor-pointer transition duration-200">
          User {item.owner} has invited you to join channel {item.channel}  
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

  
  function listOutMessages(items) {
    return items.map((item) => (
      <div key={item.my_row_id} className="flex justify-between bg-gray-600 p-2 rounded-lg">
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
        {isAdmin === "true" && (
          <div>
            <button
              onClick={() => deleteMessage(item.my_row_id)}
              className="rounded-lg hover:bg-red-700 px-2 py-1"
            >
              ❌
            </button>
          </div>
        )}
      </div>
    ));
  }
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage(e);
    }
  };


  //Processing invite accept/deny
  const CHANGEME = 'placeholdervalue';
  const processInvite = async (e) => {
    e.preventDefault();
    
    const response = await fetch("http://localhost:5001/processInvite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ CHANGEME }),
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
    } else {
      alert(data.message);
    }
  };

  //Sending invite
  const CHANGEME2 = 'placeholdervalue';
  const sendInvite = async (e) => {
    e.preventDefault();
    
    const response = await fetch("http://localhost:5001/sendInvite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ CHANGEME2 }),
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
    } else {
      alert(data.message);
    }
  };

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

            <button onClick={sendInvite} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105">send invite button</button>
            <button onClick={processInvite} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105">process invite button</button>

          </div>
          <button onClick={() => { localStorage.removeItem("loggedInUser"); navigate("/home"); }}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105">
            Logout
          </button>
        </div>
        <div>

        <h1 className = "text-l font-semibold py-2 px-4 font-size-30 ">Welcome {loggedInUser}</h1>
        </div>
        <div className="flex bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="w-1/4 bg-gray-700 p-4 flex flex-col h-full">
            <div className="flex gap-5 -mt-3 items-start">
              <button onClick={() => {setShowMessageList(false) ; setShowChannelList(true);}}className="scale-125 bg-black-400 hover:bg-grey-100 text-white font-semibold py-4 px-4 rounded-lg transition duration-200 transform hover:scale-140">Channels</button>
              <button onClick={() => {setShowChannelList(false) ; setShowMessageList(true);}}className="scale-125 bg-black-400 hover:bg-grey-100 text-white font-semibold py-4 px-4 rounded-lg transition duration-200 transform hover:scale-140">Private</button>
            </div>
            {(isAdmin === "true"  && showChannelList ) && (
              <div className="flex justify-between mb-4">
                <button onClick={() => setShowCreateModal(true)} className="bg-green-600   hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-lg transition duration-200 transform hover:scale-105">Create</button>
                <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition duration-200 transform hover:scale-105">Delete</button>
              </div>
            )}
            <hr className="border-t-4 border-white-600 mb-2"></hr> 
            {showChannelList && (<>
            <h7 className="flex justify-between text-xl font-semibold mb-4">Public Channels </h7>
            
            
            <ul className="space-y-2 mb-4">{listOutChannels(channelList)}</ul>
            <hr className="border-t-4 border-white-600 mb-2"></hr> 
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Your Channels</h2>
                <button onClick={() => setShowCreatePrivateModal(true)} className="scale-115 hover:scale-135">✚</button>
              </div>
              <button onClick={() => setShowQuitModal(true)} className="flex justify-between ">Quit</button>
              
            </div>
            <hr className="border-t-4 border-white-600 mb-2"></hr>
            <div className="flex justify-between items-center mb-4">
            <h8 className="flex justify-between text-xl font-semibold mb-4">Discover</h8>
            <button onClick={() => setShowJoinModal(true)} className="flex justify-between  mb-4">Join 
            </button>
            </div>
            </>) }
            {showMessageList && <ul className="space-y-2 mb-4">{listOutChannels(privateMessageList)}</ul>}

        
          </div>

          <div className="w-3/4 p-4">
          
          <h2 className="flex justify-between text-xl font-semibold mb-4">Messages
          {/* admin buttons*/}
          {/* clicking the assign users button should bring up a list of the users not already in the channel for the admin to select*/}

          {isAdmin=="true" &&

          <button onClick={() =>setShowAssignUser(true)} className = "bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
            >Assign New Users
            </button>}

          {isAdmin == "true" && (
          <>
            <button
              onClick={() => setShowAssignUser(true)}
              className="bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Assign New Users
            </button>

            <button
              onClick={() => setShowDeleteUser(true)}
              className="bg-red-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Delete a User
            </button>
          </>
        )}
          

          {/* clicking the remove users button should bring up a list of the users in the channel for the admin to select*/}
          {isAdmin=="true" &&
          <button onClick={() =>setShowRemoveUser(true)} className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105">Remove User</button>}
          </h2>

          <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4 min-h-[30rem] overflow-y-auto">
          <div className="space-y-4">{listOutMessages(messageList)}</div>
          <div ref={messagesEndRef} /> {                      }
          </div>
          </div>

          <div className="mt-2 flex items-center">

          <div className="relative">
            <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="bg-gray-700 border border-gray-600 p-3 mr-2 rounded-lg">
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
                onKeyDown={handleKeyDown} // Add this line
              placeholder="Type a message..."
              className="w-5/6 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mr-2"
            />
         
          <button id="messageField" className="bg-gray-500 w-1/6 py-3 rounded-lg" onClick={sendMessage}>
            Send
          </button>
          </div>

          </div>
          <div>
          Sent requests
          <ul className="space-y-2 mb-4">{listOutSentRequests(sentRequestList)}</ul>
          Received requests
          <ul className="space-y-2 mb-4">{listOutReceivedRequests(receivedRequestList)}</ul>
          Sent invites
          <ul className="space-y-2 mb-4">{listOutSentInvites(sentInviteList)}</ul>
          Received invites
          <ul className="space-y-2 mb-4">{listOutReceivedInvites(receivedInviteList)}</ul>

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
              <button onClick={joinChannel} className="bg-green-600 px-4 py-2 rounded-lg">Join</button>
              <button onClick={() => setShowJoinModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
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
            <h2 className="text-xl mb-4">Enter Channel to Quit</h2>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button onClick={quitChannel} className="bg-yellow-500 px-4 py-2 rounded-lg">Quit</button>
              <button onClick={() => setShowQuitModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

    {showCreatePrivateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-2">Enter New Channel Name</h2>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <h3 className="text-xl mt-5 mb-2">Invite User</h3>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button onClick={joinChannel} className="bg-green-600 px-4 py-2 rounded-lg">Join</button>
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

