import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from 'react';
import Listings from '../pages/Listings.js';
import { MemoryRouter, useNavigate } from "react-router-dom";

const mockListings = [
    { id: 1, title: "Listing One" },
    { id: 2, title: "Listing Two" },
  ];

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Got Listings!" }),
  })
);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe("Marketplace page", () => {
  
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllMocks();

    global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockListings),
        })
      );
  });

  test("fetches and displays listings on mount", async () => {
    render(
      <MemoryRouter>
        <Listings />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText("Listing One")).toBeInTheDocument();
      expect(screen.getByText("Listing Two")).toBeInTheDocument();
    });
  
    expect(fetch).toHaveBeenCalledWith("http://localhost:5001/listings");
  });

  test("toggles status when 'Sold?' button is clicked", async () => {
    const listingWithStatus = [
      { id: 1, title: "Listing One", status: "available", author: "testUser" }
    ];
  
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => listingWithStatus
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ newStatus: "sold" })
      });
  
    localStorage.setItem("loggedInUser", "testUser");
  
    render(
      <MemoryRouter>
        <Listings />
      </MemoryRouter>
    );
  
    await waitFor(() => screen.getByText("Listing One"));
  
    const toggleButton = screen.getByRole("button", { name: /sold\?/i });
    fireEvent.click(toggleButton);
  
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5001/listings/1/toggle-status",
        expect.objectContaining({ method: "PUT" })
      );
    });
  });  
  
  test("navigates to Messages with correct state when 'Message Seller' is clicked", async () => {
    const listing = [
      { id: 2, title: "Listing Two", author: "otherUser", status: "available", created_at: Date.now() }
    ];
  
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => listing
    });
  
    localStorage.setItem("loggedInUser", "testUser");
  
    render(
      <MemoryRouter>
        <Listings />
      </MemoryRouter>
    );
  
    await waitFor(() => screen.getByText("Listing Two"));
  
    const messageButton = screen.getByRole("button", { name: /message seller/i });
    fireEvent.click(messageButton);
  
    expect(mockNavigate).toHaveBeenCalledWith("/Messages", {
      state: {
        dmTarget: "otherUser",
        autoMessage: "Hello, is Listing Two still available?",
      },
    });
  });

  test("deletes a listing when ❌ is clicked", async () => {
    const listings = [
      { id: 1, title: "Listing One", author: "testUser", created_at: Date.now() }
    ];
  
    localStorage.setItem("loggedInUser", "testUser");
  
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => listings,
      })
      .mockResolvedValueOnce({
        ok: true,
      });
  
    render(
      <MemoryRouter>
        <Listings />
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(screen.getByText("Listing One")).toBeInTheDocument();
    });
  
    const deleteButton = screen.getByRole("button", { name: "❌" });
    fireEvent.click(deleteButton);
  
    await waitFor(() => {
      expect(screen.queryByText("Listing One")).not.toBeInTheDocument();
    });
  
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/listings/1",
      expect.objectContaining({ method: "DELETE" })
    );
  });  
  
});
