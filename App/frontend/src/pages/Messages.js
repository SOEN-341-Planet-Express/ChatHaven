import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import io from "socket.io-client";
import { toast, Flip } from 'react-toastify';


function Messages() {
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState("");
  const [isAdmin, setIsAdmin] = useState("");
  const [channelList, setChannelList] = useState([]);
  const [privateMessageList, setPrivateMessageList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [showRemoveUser, setShowRemoveUser] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [username, setUsername] = useState("")
  const [currentChannelType, setCurrentChannelType] = useState("")
  const [messageToSend, setMessageToSend] = useState("")
  const [currentChannel, setCurrentChannel] = useState("")
  const [socket, setSocket] = useState(null);



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
      body: JSON.stringify({ channelName }),
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
      body: JSON.stringify({ currentChannel, currentChannelType, loggedInUser }),
    })
    
    const data = await response.json()

    if (response.ok) {
      setMessageList(data.message)
    } else {
      alert(data.message)
    }
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
      <li key={index} className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
        <button 
          onClick={(e) => {

            setCurrentChannel(item);
            setCurrentChannelType('groupchat');

          }} 
          className="w-full text-left p-2">
          {item}
        </button>
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
          {isAdmin === "true" && (
            <p className="text-gray-400 text-sm">ID: {item.my_row_id}</p>
          )}
        </div>
        {isAdmin === "true" && (
          <div>
            <button
              onClick={() => deleteMessage(item.my_row_id)}
              className="hover:bg-red-700 px-2 py-1"
            >
              ❌
            </button>
          </div>
        )}
      </div>
    ));
  }
  



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
          </div>
          <button onClick={() => { localStorage.removeItem("loggedInUser"); navigate("/home"); }}
            className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105">
            Logout
          </button>
        </div>
        <div>
        <h1 className = "text-l font-semibold py-2 px-4 font-size-30">Welcome {loggedInUser}</h1>
        </div>
        <div className="flex bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="w-1/4 bg-gray-700 p-4 flex flex-col h-full">
            <h2 className="text-xl font-semibold mb-4">Channels</h2>
            
            {isAdmin === "true" && (
              <div className="flex justify-between mb-4">
                <button onClick={() => setShowCreateModal(true)} className="bg-green-600   hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-lg transition duration-200 transform hover:scale-105">Create</button>
                <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition duration-200 transform hover:scale-105">Delete</button>
              </div>
            )}
            <ul className="space-y-2 mb-4">{listOutChannels(channelList)}</ul>
            

            <h4 className="text-xl font-semibold mb-2">Private</h4> 
            <ul className="space-y-2 mb-4">{listOutDMs(privateMessageList)}</ul>


          
         
          </div>

          <div className="w-3/4 p-4">
          
          <h2 className="flex justify-between text-xl font-semibold mb-4">Messages
          {/* admin buttons*/}
          {/* clicking the assign users button should bring up a list of the users not already in the channel for the admin to select*/}
          {isAdmin=="true" &&

          <button onClick={() =>setShowAssignUser(true)} className = "bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
            >Assign New Users
            </button>}
          {/* clicking the remove users button should bring up a list of the users in the channel for the admin to select*/}
          {isAdmin=="true" &&
          <button onClick={() =>setShowRemoveUser(true)} className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105">Remove User</button>}
          </h2>
          <div className="bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
          <div className="space-y-4">{listOutMessages(messageList)}</div>
          </div>
          <div className="mt-4 flex items-center">
            <input
              type="text"
              onChange={(e) => setMessageToSend(e.target.value)}
              
              placeholder="Type a message..."
              className="w-5/6 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 mr-2"
            />
            <button id="messageField" className="bg-gray-500 w-1/6 py-3 rounded-lg" onClick={sendMessage}>Send</button>
          </div>
          
          </div>
        </div>
        
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Enter Channel Name</h2>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button onClick={createChannel} className="bg-green-600 px-4 py-2 rounded-lg">Create</button>
              <button onClick={() => setShowCreateModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Enter Channel to Delete</h2>
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} className="p-2 rounded-lg bg-gray-700 text-white border border-gray-600" />
            <div className="mt-4 flex justify-between">
              <button onClick={deleteChannel} className="bg-yellow-500 px-4 py-2 rounded-lg">Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
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
      
    </div>
  );
}
export default Messages;
