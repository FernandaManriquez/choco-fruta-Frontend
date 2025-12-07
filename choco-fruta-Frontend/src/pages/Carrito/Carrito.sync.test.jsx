import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as session from '../../utils/session';
import { Carrito } from './Carrito';

describe('Carrito sincroniza local con servidor', () => {
  const apiBase = 'http://localhost:8081/api';
  let fetchCalls;

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchCalls = [];
    vi.spyOn(session, 'getToken').mockReturnValue('token-xyz');

    localStorage.setItem('carrito', JSON.stringify([
      { productoId: 1, nombre: 'Nueces de Nogal', precio: 4200, cantidad: 1, subtotal: 4200 },
      { productoId: 2, nombre: 'Almendras', precio: 3500, cantidad: 2, subtotal: 7000 }
    ]));

    globalThis.fetch = vi.fn(async (url, options = {}) => {
      fetchCalls.push({ url, method: options.method || 'GET' });
      if (url === `${apiBase}/carrito` && (options.method || 'GET') === 'GET') {
        const count = fetchCalls.filter(c => c.url === `${apiBase}/carrito` && c.method === 'GET').length;
        if (count === 1) {
          return {
            ok: true,
            json: async () => ([
              { id: 10, producto: { id: 1, nombre: 'Nueces de Nogal', precio: 4200 }, cantidad: 1 }
            ])
          };
        }
        return {
          ok: true,
          json: async () => ([
            { id: 10, producto: { id: 1, nombre: 'Nueces de Nogal', precio: 4200 }, cantidad: 1 },
            { id: 11, producto: { id: 2, nombre: 'Almendras', precio: 3500 }, cantidad: 2 }
          ])
        };
      }
      if (url === `${apiBase}/carrito` && (options.method || 'GET') === 'POST') {
        return { ok: true, text: async () => '' };
      }
      return { ok: true, json: async () => ([]) };
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('muestra ambos productos tras sincronización', async () => {
    render(
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>
    );

    expect(await screen.findByText('Nueces de Nogal')).toBeInTheDocument();
    expect(await screen.findByText('Almendras')).toBeInTheDocument();
  });
});

