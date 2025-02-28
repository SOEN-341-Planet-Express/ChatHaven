import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import Home from '../pages/Home';
import Messages from "../pages/Messages";

beforeEach(() => {
    render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/Home" element={<Home />} />
          </Routes>
        </MemoryRouter>
      );

      
})

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
