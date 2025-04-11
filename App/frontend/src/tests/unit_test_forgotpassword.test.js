import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from 'react';
import ForgotPassword from '../pages/ForgotPassword.js';
import { MemoryRouter, useNavigate } from "react-router-dom";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Credentials Changed!" }),
  })
);

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe("Password Recovery page", () => {
  
  beforeEach(() => {
    fetch.mockClear();
  });


  test("renders the recovery form correctly", () => {
    render(
      
        <ForgotPassword />
      
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
  });

  test("handles input changes correctly", () => {
    render(
        <ForgotPassword />
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText("Password");
    const confirmInput = screen.getByLabelText("Confirm Password");

    fireEvent.change(usernameInput, { target: { value: "testUser" } });
    fireEvent.change(passwordInput, { target: { value: "testPass123" } });
    fireEvent.change(confirmInput, { target: { value: "testPass123" } });

    expect(screen.getByLabelText(/username/i)).toHaveValue("testUser");
    expect(screen.getByLabelText("Password")).toHaveValue("testPass123");
    expect(screen.getByLabelText("Confirm Password")).toHaveValue("testPass123");

});

  test("calls fetch with correct data on reset", async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText("Password");
    const confirmInput = screen.getByLabelText("Confirm Password");
    const submitButton = screen.getByRole("button", { name: /submit change/i });

    fireEvent.change(usernameInput, { target: { value: "testUser" } });
    fireEvent.change(passwordInput, { target: { value: "testPass123" } });
    fireEvent.change(confirmInput, { target: { value: "testPass123" } });
    fireEvent.click(submitButton);

    // Wait for the fetch call
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/forgotpassword",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "testUser", password: "testPass123" }),
      })
    ));
  });
  
});
