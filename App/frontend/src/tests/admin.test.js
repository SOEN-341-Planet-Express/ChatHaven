import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import Home from '../pages/Home';
import Messages from "../pages/Messages";

beforeAll(() => {
    render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/Home" element={<Home />} />
          </Routes>
        </MemoryRouter>
      );
      
      const usernameInput = screen.getByPlaceholderText("Username");
      fireEvent.change(usernameInput, { target: {value: "thekillerturkey" }});

      const passwordInput = screen.getByPlaceholderText("Password");
      fireEvent.change(passwordInput, { target: {value: "supersafe" }});

      const loginButton = screen.getByText("Login");
      fireEvent.click(loginButton);   
});

test("renders messages and allows sending a new message", () => {
  render(
    <BrowserRouter> 
      <Messages />
    </BrowserRouter>
  );

  expect(screen.getByText("hello")).toBeInTheDocument();

  const messageInput = screen.getByPlaceholderText("Type a message...");
  fireEvent.change(messageInput, { target: { value: "Test message" } });

  const sendButton = screen.getByText("Send");
  fireEvent.click(sendButton);
  expect(screen.getByText("Test message")).toBeInTheDocument();
});

test("checks rendering of create channel button when login as admin", () => {
  render(
    <BrowserRouter>
      <Messages />
    </BrowserRouter>
  )

  expect(screen.getByText("Create Channel")).toBeInTheDocument();
})
