import React, { useEffect, useState } from "react";

function Listings() {
  const [listings, setListings] = useState([]);

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
  }, []);

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
        <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
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
      <h1 className="text-3xl font-bold mb-6 text-center">
        Marketplace
      </h1>

      <div className="flex flex-col items-center gap-6">
        {renderListings(listings)}
      </div>
    </div>
  );
}

export default Listings;
