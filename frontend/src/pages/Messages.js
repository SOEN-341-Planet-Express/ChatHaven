import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import React from 'react';

function Messages() {
  const navigate = useNavigate()
  const [loggedInUser, setLoggedInUser]= useState("")
  const [isAdmin, setIsAdmin ]= useState("");
  const [channelList, setChannelList] = useState('');

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser"); // retrieves logged in user from the  /home to know which user signed in
      setLoggedInUser(user); // Set the username in the state.

      async function checkAdmin(){
        const response = await fetch("http://localhost:5001/checkAdmin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user }),
        })
        
        const data = await response.json()
    
        if (response.ok) {
          setIsAdmin(data.message)
        } else {
          alert(data.message)
        }
      }

      async function getChannels(){
        const response = await fetch("http://localhost:5001/getChannels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user }),
        })
        
        const data = await response.json()
    
        if (response.ok) {
          setChannelList(data.message)
          
        } else {
          alert(data.message)
        }
      }

      checkAdmin();
      getChannels();
  }, [navigate])
  

  const createChannel = async (e) => {
    e.preventDefault()
    //this is a placeholder value that needs to be substituted by a user inputed value when we merge the backend and frontend
    const channelName = "placeholder"
    
    const response = await fetch("http://localhost:5001/createChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName }),
    })
    
    const data = await response.json()

    if (response.ok) {
      alert("Channel Created!")
    } else {
      alert(data.message)
    }
  }

  const deleteChannel = async (e) => {
    e.preventDefault()
    //this is a placeholder value that needs to be substituted by the name of the selected channel upon clicking delete
    const channelName = "placeholder"
    
    const response = await fetch("http://localhost:5001/deleteChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName }),
    })
    
    const data = await response.json()

    if (response.ok) {
      alert("Channel Deleted!")
    } else {
      alert(data.message)
    }
  }

  const assignUsers = async (e) => {
    e.preventDefault()

    //username should be the username the admin selected
    const username = "johnsmith"
    //channelName should be the name of the currently selected channel
    const channelName = "placeholder"
    
    const response = await fetch("http://localhost:5001/assignUsers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, channelName }),
    })
    
    const data = await response.json()

    if (response.ok) {
      alert("User assigned to channel!")
    } else {
      alert(data.message)
    }
  }

  const removeUsers = async (e) => {
    e.preventDefault()

    //username should be the username the admin selected
    const username = "johnsmith"
    //channelName should be the name of the currently selected channel
    const channelName = "placeholder"
    
    const response = await fetch("http://localhost:5001/removeUsers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, channelName }),
    })
    
    const data = await response.json()

    if (response.ok) {
      alert("User removed from channel!")
    } else {
      alert(data.message)
    }
  }

  function listOutChannels(items) {
    const listItems = []
    for (let i = 0; i < items.length; i++) {
      listItems.push(<li className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200" key={i}>{items[i]}</li>)
    }
  
    return listItems
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
          <button
            onClick={() => {
              localStorage.removeItem("loggedInUser")
              navigate("/home")}}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
        <div>
        <h1 className = "text-l font-semibold">Welcome {loggedInUser}</h1>
        </div>
        <div className="flex bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="w-1/4 bg-gray-700 p-4">
            <h2 className="text-xl font-semibold mb-4">Channels
            </h2>
              {/* admin buttons */}
            <h3 className="flex justify-between mb-4">
              {/* the create channel button should prompt the admin to enter a name and pass that value to the createChannel function*/}
              {isAdmin=="true" &&
              <button onClick={createChannel}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-1 rounded-lg transition duration-200 transform hover:scale-105"
                >
                Create</button>}
              {/* the delete channel button should pass the currently selected channel's name to the deleteChannel function*/}
              {isAdmin=="true" &&
              <button onClick={deleteChannel}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-1 rounded-lg transition duration-200 transform hover:scale-105"
              >
              Delete</button>}
            </h3>
             {/* channel buttons*/}
             
            <ul className="space-y-2 mb-4">
            {listOutChannels(channelList)}
            </ul>
            <h4 className="text-xl font-semibold mb-2">Private</h4> 
            <ul className="space-y-2">
              <li className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
                Jonny
              </li>
              <li className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
                Claire
              </li>
              <li className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
                Alexi
              </li>
            </ul>
          </div>

          <div className="w-3/4 p-4">
          
            <h2 className="flex justify-between text-xl font-semibold mb-4">Messages
            {/* admin buttons*/}
            {/* clicking the assign users button should bring up a list of the users not already in the channel for the admin to select*/}
            {isAdmin=="true" &&
            <button onClick={assignUsers} className = "bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-1 rounded-lg transition duration-200 transform hover:scale-105"
              >Assign New Users
              </button>}
            {/* clicking the remove users button should bring up a list of the users in the channel for the admin to select*/}
            {isAdmin=="true" &&
            <button onClick={removeUsers}>Remove User</button>}
            </h2>
            <div className="bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto">
              <div className="space-y-4">
                <p className="bg-gray-600 p-2 rounded-lg">
                  <strong className="text-blue-400">User1:</strong> Hey
                </p>
                <p className="bg-gray-600 p-2 rounded-lg">
                  <strong className="text-green-400">User2:</strong> Hi
                </p>
                <p className="bg-gray-600 p-2 rounded-lg">
                  <strong className="text-yellow-400">User3:</strong> Yoo!
                </p>
              </div>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages

