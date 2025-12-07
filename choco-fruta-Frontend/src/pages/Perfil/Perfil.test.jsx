import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as session from '../../utils/session';
import { Perfil } from './Perfil';

describe('Perfil', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(session, 'getToken').mockReturnValue('fake-token');
  });

  it('carga datos de perfil y guarda cambios', async () => {
    const fetchMock = vi.fn(async (url, options = {}) => {
      if (typeof url === 'string' && url.endsWith('/api/perfil') && (!options.method || options.method === 'GET')) {
        return { ok: true, status: 200, json: async () => ({ username: 'cliente', email: 'cli@demo.com', nombre: 'Cliente Demo' }) };
      }
      if (typeof url === 'string' && url.endsWith('/api/perfil') && options.method === 'PUT') {
        return { ok: true, status: 200, json: async () => ({ username: 'cliente', email: 'cli@demo.com', nombre: 'Cliente Editado' }) };
      }
      if (typeof url === 'string' && url.endsWith('/api/auth/refresh')) {
        return { ok: true, status: 200, json: async () => ({ token: 't2' }) };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });
    vi.spyOn(window, 'fetch').mockImplementation(fetchMock);

    render(
      <MemoryRouter>
        <Perfil />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue('cliente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('cli@demo.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cliente Demo')).toBeInTheDocument();

    const nombreInput = screen.getByDisplayValue('Cliente Demo');
    const user = userEvent.setup();
    await user.clear(nombreInput);
    await user.type(nombreInput, 'Cliente Editado');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/Perfil actualizado correctamente/i)).toBeInTheDocument();
  }, 15000);
});
