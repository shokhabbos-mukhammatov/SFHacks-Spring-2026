import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

describe('Home page', () => {
  it('renders the headline', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText(/SFHacks Spring 2026/i)).toBeInTheDocument();
  });
});

describe('NotFound page', () => {
  it('renders a 404 message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
