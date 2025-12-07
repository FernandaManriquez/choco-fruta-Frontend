import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as session from '../../utils/session';
import { Carrito } from './Carrito';

describe('Carrito', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(session, 'getToken').mockReturnValue(null);
  });

  it('muestra carrito vacío cuando no hay token', async () => {
    render(
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Tu carrito está vacío/i)).toBeInTheDocument();
  });
});

