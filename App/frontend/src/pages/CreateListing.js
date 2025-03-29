import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast, Flip } from "react-toastify"

function CreateListing() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState(null) 
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title || !description || !price || !image) {
      toast.error("Please enter all fields", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
        transition: Flip,
      })
      return
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", description)
    formData.append("price", price)
    formData.append("image", image)

    try {
      const response = await fetch("http://localhost:5001/listings", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("Listing created!", {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
          transition: Flip,
        })
        navigate("/Marketplace")
      } else {
        const data = await response.json()
        toast.error(data.message || "Something went wrong", {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
          transition: Flip,
        })
      }
    } catch (error) {
      toast.error("Error connecting to server", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
        transition: Flip,
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Post an Item for Sale</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter item title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Enter item description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-1">
              Price
            </label>
            <input
              id="price"
              type="number"
              placeholder="Enter item price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-400 mb-1">
              Upload Picture
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              required
              className="w-full text-white bg-gray-700 border border-gray-600 rounded-lg p-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Post Listing
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => navigate("/Marketplace")} className="text-gray-400 hover:text-white transition duration-200">
            Back to Marketplace
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateListing
