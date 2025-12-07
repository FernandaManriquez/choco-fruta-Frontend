import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as session from '../../utils/session';
import { SeguimientoPedido } from './SeguimientoPedido';

describe('SeguimientoPedido', () => {
  it('renderiza boleta del usuario desde /api/compras', async () => {
    vi.spyOn(session, 'getToken').mockReturnValue('fake-token');
    vi.spyOn(window, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          numero: 'CF-123',
          fecha: new Date().toISOString(),
          total: 1000,
          detalles: [
            { producto: { nombre: 'Nuez' }, cantidad: 1, subtotal: 1000 }
          ]
        }
      ])
    });

    render(
      <MemoryRouter initialEntries={["/seguimiento-pedido?numero=CF-123"]}>
        <Routes>
          <Route path="/seguimiento-pedido" element={<SeguimientoPedido />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Pedido Confirmado/i)).toBeInTheDocument();
    expect(await screen.findByText(/CF-123/)).toBeInTheDocument();
    expect(await screen.findByText(/Nuez x1/)).toBeInTheDocument();
  });
});
