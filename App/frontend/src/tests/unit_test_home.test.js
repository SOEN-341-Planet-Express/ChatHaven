import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from 'react';
import Home from '../pages/Home.js';
import { MemoryRouter, useNavigate } from "react-router-dom";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Logged in successfully!" }),
  })
);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe("Home page", () => {
  
  beforeEach(() => {
    fetch.mockClear();
  });


  test("renders the login form correctly", () => {
    render(
      
        <Home />
      
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  test("handles input changes correctly", () => {
    render(
        <Home />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(usernameInput, { target: { value: "testUser" } });
    fireEvent.change(passwordInput, { target: { value: "testPass123" } });

    expect(screen.getByLabelText(/username/i)).toHaveValue("testUser");
    expect(screen.getByLabelText(/password/i)).toHaveValue("testPass123");
  });

  test("calls fetch with correct data on login", async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "testUser" } });
    fireEvent.change(passwordInput, { target: { value: "testPass123" } });
    fireEvent.click(submitButton);

    // Wait for the fetch call
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/login",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testUser", password: "testPass123" }),
      })
    ));
  });

  test("shows alert if login fails", async () => {
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
  
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid username or password" }),
      })
    );
  
    render(<Home />);
  
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "wrongUser" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongPass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
  
    await waitFor(() =>
      expect(alertMock).toHaveBeenCalledWith("Invalid username or password")
    );
  
    alertMock.mockRestore(); // optional: restore original implementation
  });
  
});
