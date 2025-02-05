import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function Messages() {
  const navigate = useNavigate()
  const [loggedInUser, setLoggedInUser]= useState("")

  useEffect(() => {
    const user = localStorage.getItem("loggedInUser"); // retrieves logged in user from the  /home to know which user signed in
      setLoggedInUser(user); // Set the username in the state.
  }, [navigate])
  

  const createChannel = async (e) => {
    e.preventDefault()
    //dummy function
  }

  const deleteChannel = async (e) => {
    e.preventDefault()
    //dummy function
  }

  const assignUsers = async (e) => {
    e.preventDefault()
    //dummy function
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
        <h1>Welcome, {loggedInUser}</h1>
        </div>
        <div className="flex bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="w-1/4 bg-gray-700 p-4">
            <h2 className="text-xl font-semibold mb-4">Channels
              {/* admin buttons*/}
              <button onClick={createChannel}>Create</button>
              <button onClick={deleteChannel}>Delete</button>
            </h2>
            
            <ul className="space-y-2">
              <li className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
                group1
              </li>
              <li className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
                group2
              </li>
              <li className="bg-gray-600 hover:bg-gray-500 p-2 rounded-lg cursor-pointer transition duration-200">
                group3
              </li>
            </ul>
          </div>

          <div className="w-3/4 p-4">
            <h2 className="text-xl font-semibold mb-4">Messages
            {/* admin buttons*/}
            <button onClick={assignUsers}>Assign Users</button>
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

