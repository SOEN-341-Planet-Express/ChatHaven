import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Messages from '../pages/Messages';

test('User can login successfully and is redirected to Messages Page', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </MemoryRouter>
  );

  const usernameInput = screen.getByLabelText('Username');
  const passwordInput = screen.getByLabelText('Password');
  const loginButton = screen.getByRole('button', { name: 'Login' });

  fireEvent.change(usernameInput, { target: { value: 'thekillerturkey' } });
  fireEvent.change(passwordInput, { target: { value: 'supersafe' } });
  fireEvent.click(loginButton);

  // Assertion: Check if the Messages Page is shown
  expect(screen.getByText('Your Messages')).toBeInTheDocument();
});
