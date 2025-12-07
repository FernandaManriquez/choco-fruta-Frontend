# Documento de Testing (Frontend)

## Introducción y Propósito
Este documento describe el plan y resultados de testing del frontend Choco&Frutas.
Valida rutas protegidas, proceso de pago, perfil, carrito e historial usando Vitest
y React Testing Library, con evidencias en consola (CLI) y en interfaz gráfica (UI).

## 1. Herramientas y Configuración
- Framework: Vitest + React Testing Library (`jsdom`).
- Config: `vite.config.js` (sección `test`), scripts en `package.json` (`test`, `test:ui`).

## 2. Cómo Ejecutar
```bash
npm run test
npm run test:ui
```

## Plan de Testing
### Componentes a testear (≥5)
- Rutas protegidas: `src/router/ProtectedRoute.test.jsx`.
- Proceso de pago: `src/pages/ProcesoPago/ProcesoPago.test.jsx`.
- Seguimiento de pedido: `src/pages/SeguimientoPedido/SeguimientoPedido.test.jsx`.
- Perfil: `src/pages/Perfil/Perfil.test.jsx`.
- Carrito vacío: `src/pages/Carrito/Carrito.test.jsx`.
- Sincronización carrito (adicional): `src/pages/Carrito/Carrito.sync.test.jsx`.

### Ejemplos de código
```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../router/ProtectedRoute';

it('redirige a /login cuando el token está expirado y el refresh falla', async () => {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><div>Admin</div></ProtectedRoute>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  );
  expect(await screen.findByText(/Login/i)).toBeInTheDocument();
});
```

### Resultados de los testing (consola, interfaz gráfica)
- Consola (CLI): resumen de ejecución capturado en ![Consola](test.png).
- Interfaz gráfica (UI): estado de pruebas en 
![UI](vitest-ui.png).

## 4. Resultados Esperados
- Redirecciones correctas por expiración y rol.
- Validación de formulario de pago y resumen con IVA.
- Render de boleta con número, productos y totales.
- Carga/edición de perfil con feedback.
- Mensaje de carrito vacío sin token.

## Conclusión
Se ejecutaron 5+ pruebas con resultados en verde en CLI y UI. Se validaron
redirecciones por token/rol, formulario de pago con IVA, render de boleta,
edición de perfil y estados del carrito, cumpliendo los criterios de la rúbrica.
