import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as session from '../../utils/session';
import { ProcesoPago } from './ProcesoPago';

describe('ProcesoPago', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.setItem('carritoParaPago', JSON.stringify({
      productos: [{ nombre: 'Producto', cantidad: 1, subtotal: 1000 }],
      total: 1000,
      fecha: new Date().toISOString()
    }));
    vi.spyOn(session, 'getToken').mockReturnValue('fake-token');
    vi.spyOn(window, 'fetch').mockImplementation(async (input) => {
      const url = typeof input === 'string' ? input : '';
      if (url.includes('/carrito')) {
        return { ok: true, status: 200, json: async () => [] };
      }
      if (url.includes('/productos')) {
        return { ok: true, status: 200, json: async () => [] };
      }
      if (url.includes('/boletas')) {
        return { ok: true, status: 200, json: async () => ({ numero: 'CF-2025-1234', total: 1000, detalles: [] }) };
      }
      if (url.includes('/api/auth/refresh')) {
        return { ok: true, status: 200, json: async () => ({ token: 't2' }) };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('valida formulario y confirma pedido', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProcesoPago />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Nombre Completo/i), 'Cliente Demo');
    await user.type(screen.getByLabelText(/Email/i), 'cliente@demo.com');
    await user.type(screen.getByLabelText(/Teléfono/i), '99999999');
    await user.type(screen.getByLabelText(/Dirección/i), 'Calle 123');

    const regionSelect = screen.getByLabelText(/Región/i);
    await user.selectOptions(regionSelect, 'Metropolitana de Santiago');

    const comunaSelect = screen.getByLabelText(/Comuna/i);
    await user.selectOptions(comunaSelect, 'Santiago');

    const metodoTransferencia = screen.getByLabelText(/Transferencia/i);
    await user.click(metodoTransferencia);

    const confirmarBtn = screen.getByRole('button', { name: /Confirmar Pedido/i });
    await user.click(confirmarBtn);

    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/Compra confirmada/i));
  }, 15000);
});
