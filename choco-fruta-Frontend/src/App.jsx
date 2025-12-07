import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home/Home';
import { Blog } from './pages/Blog/Blog';
import { Contacto } from './pages/Contacto/Contacto';
import { Inventario } from './pages/Inventario/Inventario';
import { CatalogoProductos } from './pages/CatalogoProductos/CatalogoProductos';
import { DetalleProducto } from './pages/DetalleProducto/DetalleProducto';
import { Carrito } from './pages/Carrito/Carrito';
import { Registro } from './pages/Registro/Registro';
import { Login } from './componentes/Login/Login';
import { Dashboard } from './componentes/Dashboard/Dashboard';
import { CrearProducto } from './componentes/CrearProd/CrearProducto';
import { EditarProducto } from './componentes/EditarProd/EditarProd';
import { Productos } from './componentes/Productos/Productos';
import { Usuarios } from './componentes/Usuarios/Usuarios';
import { CrearUsuario } from './componentes/CrearUsuario/CrearUsuario';
import { EditarUsuario } from './componentes/EditarUsuario/EditarUsuario';
import { Categorias } from './componentes/Categorias/Categorias';
import { CrearCategoria } from './componentes/CrearCategoria/CrearCategoria';
import { EditarCategoria } from './componentes/EditarCategoria/EditarCategoria';
import { ProcesoPago } from './pages/ProcesoPago/ProcesoPago'; 
import { SeguimientoPedido } from './pages/SeguimientoPedido/SeguimientoPedido'; 
import { MisCompras } from './pages/MisCompras/MisCompras'; 
import { Perfil } from './pages/Perfil/Perfil'; 
import { ProtectedRoute } from './router/ProtectedRoute';
import { esSuperAdmin } from './utils/session';
import './App.css';

function App() {
  const Landing = () => (esSuperAdmin() ? <Navigate to="/dashboard" replace /> : <Home />);
  return (
    <Router>
      <Routes>
        {/* ===== RUTAS PÚBLICAS ===== */}
        <Route path="/" element={<Landing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/catalogo" element={<CatalogoProductos />} />
        <Route path="/detalle-producto/:id" element={<DetalleProducto />} />
        <Route 
          path="/carrito" 
          element={
            <ProtectedRoute>
              <Carrito />
            </ProtectedRoute>
          } 
        />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/proceso-pago" 
          element={
            <ProtectedRoute>
              <ProcesoPago />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seguimiento-pedido" 
          element={
            <ProtectedRoute>
              <SeguimientoPedido />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/mis-compras" 
          element={
            <ProtectedRoute>
              <MisCompras />
            </ProtectedRoute>
          } 
        />

        {/* ===== RUTAS PROTEGIDAS (Solo usuarios logueados) ===== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute role="ADMIN">
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/productos" 
          element={
            <ProtectedRoute role="ADMIN">
              <Productos />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/crear-producto" 
          element={
            <ProtectedRoute role="ADMIN">
              <CrearProducto />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/editar-producto/:id" 
          element={
            <ProtectedRoute role="ADMIN">
              <EditarProducto />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute role="ADMIN">
              <Usuarios />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/crear-usuario" 
          element={
            <ProtectedRoute role="ADMIN">
              <CrearUsuario />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/editar-usuario/:id" 
          element={
            <ProtectedRoute role="ADMIN">
              <EditarUsuario />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/categorias" 
          element={
            <ProtectedRoute role="ADMIN">
              <Categorias />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/crear-categoria" 
          element={
            <ProtectedRoute role="ADMIN">
              <CrearCategoria />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/editar-categoria/:id" 
          element={
            <ProtectedRoute role="ADMIN">
              <EditarCategoria />
            </ProtectedRoute>
          } 
        />

        {/* ===== RUTA POR DEFECTO ===== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
