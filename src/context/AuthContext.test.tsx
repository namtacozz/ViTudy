import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Test consumer component
function TestConsumer() {
  const { user, status } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.id : 'null'}</span>
      <span data-testid="status">{status}</span>
    </div>
  );
}

describe('AuthContext', () => {
  it('renders with null user and guest status when no session exists', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('status')).toHaveTextContent('guest');
    });
  });
});
