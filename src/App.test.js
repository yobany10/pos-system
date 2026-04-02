import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('./Firebase/config', () => ({
  auth: {
    signOut: jest.fn(),
  },
}));

jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: () => [null, false],
}));

test('renders the application brand', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/minimal.fast.easy/i)).toBeInTheDocument();
});
