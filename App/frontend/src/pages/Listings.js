import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";


function Listings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const loggedInUser = localStorage.getItem("loggedInUser");
  const socket = io("http://localhost:5001");

  useEffect(() => {
    async function getListings() {
      try {
        const response = await fetch("http://localhost:5001/listings");
        const data = await response.json();
        if (response.ok) {
          setListings(data);
        } else {
          alert("Failed to get listings.");
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
      }
    }

    getListings();


  }, [navigate]);


  async function toggleStatus(id) {
    try {
      const response = await fetch(`http://localhost:5001/listings/${id}/toggle-status`, {
        method: "PUT",
      });
  
      if (response.ok) {
        const data = await response.json();
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === id ? { ...listing, status: data.newStatus } : listing
          )
        );
      } else {
        console.error("Failed to toggle status");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  }

  async function deleteListing(id) {
    try {
      const response = await fetch(`http://localhost:5001/listings/${id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        // Optionally update state to remove it from the list
        setListings(prev => prev.filter(listing => listing.id !== id));
      } else {
        console.error("Failed to delete listing");
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  }
  

  function renderListings(items) {
    return items.map((listing) => (
      <div
        key={listing.id}
        className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full group"
      >
        {listing.author === loggedInUser && (
          <div className="text-right mb-2">
            <button 
              onClick={() => deleteListing(listing.id)}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              ❌
            </button>
          </div>
        )}
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={`http://localhost:5001/uploads/${listing.image}`}
            alt={listing.title}
            className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-2xl font-bold text-white">${listing.price}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">{listing.title}</h2>
          {listing.author === loggedInUser ? (
            <button
              onClick={() => toggleStatus(listing.id)}
              className={`${
                listing.status === "sold"
                  ? "bg-green-700 hover:bg-green-800"
                  : "bg-red-700 hover:bg-red-800"
              } text-white text-sm font-medium py-1 px-3 rounded-full transition duration-200`}
            >
              {listing.status === "sold" ? "Mark as Available" : "Sold?"}
            </button>
          ) : (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              listing.status === "sold" 
                ? "bg-red-900/50 text-red-300" 
                : "bg-green-900/50 text-green-300"
            }`}>
              {listing.status === "sold" ? "Not Available" : "Available"}
            </span>
          )}
        </div>
        <p className="text-gray-400 mb-4 line-clamp-2">{listing.description}</p>
        {listing.author !== loggedInUser && (
          <button 
            onClick={() =>
              navigate("/Messages", {
                state: {
                  dmTarget: listing.author,
                  autoMessage: `Hello, is ${listing.title} still available?`,
                },
              })
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition duration-200 mt-2"
          >
            Message Seller
          </button>
        )}
        <p className="text-xs text-gray-500 mt-3">
          {new Date(listing.created_at).toLocaleString()}
        </p>
      </div>
    ));
  }

  return (
    
    <div className="min-h-screen bg-gray-900 text-white">
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

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/Messages")}
              className="text-white hover:text-blue-400 transition-colors"
            >
              Messages
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch("http://localhost:5001/updateStatus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      username: loggedInUser,
                      status: "offline",
                    }),
                  });

                  if (!response.ok) throw new Error("Failed to update status");

                  if (socket) socket.disconnect();
                  localStorage.removeItem("loggedInUser");
                  navigate("/home");
                } catch (err) {
                  console.error("Logout error:", err);
                  alert("Failed to log out. Try again.");
                }
              }}
              className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl mb-4 text-center flex items-center justify-center">
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
          </h1>

          <button
            onClick={() => navigate("/CreateListing")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
          >
            New Listing
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {renderListings(listings)}
        </div>
      </div>
    </div>
  );
}

export default Listings;
