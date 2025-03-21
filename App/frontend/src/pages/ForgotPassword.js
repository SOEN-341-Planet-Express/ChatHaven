
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function ForgotPassword() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    const response = await fetch("http://localhost:5001/forgotpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (response.ok) {
      alert("Password Changed!")
      navigate("/Home")
    } else {
      alert(data.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
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
          <h1 className="text-3xl font-bold text-white">Change Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Choose new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Submit Change
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => navigate("/Home")} className="text-gray-400 hover:text-white transition duration-200">
            Already have an account? Log in
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

=======
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast, Flip } from 'react-toastify';


function ForgotPassword() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
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
      return
    }

    const response = await fetch("http://localhost:5001/forgotpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    const data = await response.json()

    if (response.ok) {
      toast.success('Password Changed!', {
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
      navigate("/Home")
    } else {
      alert(data.message)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
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
          <h1 className="text-3xl font-bold text-white">Change Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Choose new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Submit Change
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => navigate("/Home")} className="text-gray-400 hover:text-white transition duration-200">
            Already have an account? Log in
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword


