import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Listings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const loggedInUser = localStorage.getItem("loggedInUser");


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
  
  function renderListings(items) {

    
    return items.map((listing) => (
      <div
        key={listing.id}
        className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition w-80"
      >
        <img
          src={`http://localhost:5001/uploads/${listing.image}`}
          alt={listing.title}
          className="w-full h-48 object-cover rounded mb-4"
        />
        <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>

        {/* ✅ Author gets toggle button, others see status label */}
        {listing.author === loggedInUser ? (
          <button
            onClick={() => toggleStatus(listing.id)}
            className={`${
              listing.status === "sold"
                ? "bg-green-700 hover:bg-green-800"
                : "bg-red-700 hover:bg-red-800"
            } text-white text-sm font-medium py-1 px-2 rounded-md transition duration-200`}
          >
            {listing.status === "sold" ? "Mark as Available" : "Sold?"}
          </button>
        ) : (
          <span className="text-sm font-medium text-gray-400">
            {listing.status === "sold" ? "Not Available" : "Available"}
          </span>
        )}
      </div>
        <p className="text-gray-400 mb-2">{listing.description}</p>
        <p className="font-bold mb-1">${listing.price}</p>
        <p className="text-xs text-gray-500">
         {new Date(listing.created_at).toLocaleString()}
        </p>
      </div>
    ));
  }

  return (
    
    <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="mt-6 text-left">
          <button
            onClick={() => navigate("/Messages")}
            className="text-gray-700 hover:text-white transition duration-200"
          >
               Messages
          </button>
        </div>
      <h1 className="text-3xl  mb-6 text-center">
      🄼🄰🅁🄺🄴🅃🄿🄻🄰🄲🄴
      </h1>
      <div className="flex justify-center ">
  <button
    onClick={() => navigate("/CreateListing")}
    className=" hover:font-bold text-white  text-center font-semibold  transition duration-200 mr-60 mt-4 mb-2"
  >
     New Listing
  </button>
</div>
      <div className="flex flex-col items-center gap-6">

        {renderListings(listings)}
      </div>
    </div>
  );
}

export default Listings;
