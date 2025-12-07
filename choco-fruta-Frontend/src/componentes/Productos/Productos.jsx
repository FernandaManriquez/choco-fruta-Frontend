import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../Navbar/Navbar';
import { getToken } from '../../utils/session';
import { Footer } from '../Footer/Footer';
import './Productos.css';

const API_BASE_URL = 'http://localhost:8081/api';

export function Productos() {
    const [productos, setProductos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toggleBusy, setToggleBusy] = useState({});

    const cargarProductos = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Cargando productos...');
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/productos`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            
            console.log('📡 Status:', response.status);
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            const data = await response.json();
            console.log('📦 Datos recibidos:', data);
            console.log('📊 Total:', data.length);

            const productosNormalizados = (Array.isArray(data) ? data : []).map(p => ({
                ...p,  
                activo: p.activo === true || p.activo === 'true' || p.activo === 1,
                categoria: p.categoria || { id: null, nombre: 'Sin categoría' }
            }));

            console.log('✅ Productos normalizados:', productosNormalizados);
            setProductos(productosNormalizados);
            setLoading(false);
            
        } catch (error) {
            console.error('❌ Error:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarProductos();
    }, []);

    const toggleEstado = async (prod) => {
        if (!prod?.id) return;
        const objetivo = !prod.activo;
        if (!objetivo) {
            const ok = window.confirm(`¿Desactivar producto "${prod.nombre}"?`);
            if (!ok) return;
        }
        setToggleBusy(prev => ({ ...prev, [prod.id]: true }));
        setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, activo: objetivo } : p));
        try {
            const token = getToken();
            const url = `${API_BASE_URL}/productos/${prod.id}/${objetivo ? 'activar' : 'desactivar'}`;
            const resp = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (!resp.ok) {
                setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, activo: prod.activo } : p));
                return;
            }
            const updated = await resp.json();
            setProductos(prev => prev.map(p => p.id === updated.id ? { ...p, activo: updated.activo } : p));
            if (objetivo) {
                alert('✅ Producto activado');
            } else {
                alert('✅ Producto desactivado');
            }
        } catch {
            setProductos(prev => prev.map(p => p.id === prod.id ? { ...p, activo: prod.activo } : p));
        } finally {
            setToggleBusy(prev => ({ ...prev, [prod.id]: false }));
        }
    };

    const eliminarProducto = async (prod) => {
        if (!window.confirm(`Eliminar producto "${prod.nombre}"?`)) return;
        setToggleBusy(prev => ({ ...prev, [prod.id]: true }));
        try {
            const token = getToken();
            const doDelete = async (tok) => fetch(`${API_BASE_URL}/productos/${prod.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(tok ? { 'Authorization': `Bearer ${tok}` } : {})
                }
            });
            let resp;
            try {
                resp = await doDelete(token);
            } catch {
                await new Promise(r => setTimeout(r, 400));
                resp = await doDelete(token);
            }
            if (resp.status === 401 || resp.status === 403) {
                const rf = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
                }).catch(() => null);
                if (rf && rf.ok) {
                    const data = await rf.json();
                    if (data?.token) {
                        resp = await doDelete(data.token);
                    }
                }
            }
            if (!resp.ok) {
                if (resp.status === 403) {
                    alert('No tienes permisos para eliminar');
                    return;
                }
                // Fallback: desactivar si no se puede eliminar (p.ej. por referencias)
                try {
                    const respDes = await fetch(`${API_BASE_URL}/productos/${prod.id}/desactivar`, {
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    });
                    if (respDes.ok) {
                        const updated = await respDes.json();
                        setProductos(prev => prev.map(p => p.id === updated.id ? { ...p, activo: updated.activo } : p));
                        alert('⚠️ No se pudo eliminar. Producto desactivado.');
                        return;
                    }
                } catch { /* noop */ }
                const txt = await resp.text().catch(() => '');
                alert(txt || 'No se pudo eliminar el producto');
                return;
            }
            setProductos(prev => prev.filter(p => p.id !== prod.id));
            alert('✅ Producto eliminado');
        } catch {
            alert('No se pudo conectar con el servidor');
        } finally {
            setToggleBusy(prev => ({ ...prev, [prod.id]: false }));
        }
    };

    

    const productosFiltrados = productos.filter(p => {
        const matchBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
        const matchCategoria = !categoriaFiltro || p.categoria?.nombre === categoriaFiltro;
        return matchBusqueda && matchCategoria;
    });

    const categorias = [...new Set(productos.map(p => p.categoria?.nombre).filter(Boolean))];

    if (loading) {
        return (
            <>
                <div className="page-wrapper">
                <div className="container-fluid p-0">
                    <Navbar />
                </div>
                <div className="container page-content">
                    <div className="mi-tabla">
                        <div className="text-center my-5">
                            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                            <p className="mt-3 text-muted">Cargando productos...</p>
                        </div>
                    </div>
                </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="page-wrapper">
                <div className="container-fluid p-0">
                    <Navbar />
                </div>
                <div className="container page-content">
                    <div className="mi-tabla">
                        <div className="alert alert-danger" role="alert">
                            <h4>❌ Error al cargar productos</h4>
                            <p>{error}</p>
                            <button className="btn btn-primary" onClick={cargarProductos}>
                                🔄 Reintentar
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="page-wrapper">
            <div className="container-fluid p-0">
                <Navbar />
            </div>
            <div className="container page-content">

                <div className="dashboard-content">
                    <h2 className="dashboard-title">Inventario de Productos</h2>

                    {/* 📊 Info de productos */}
                    <div className="alert alert-info mb-3" style={{ background: 'white', borderRadius: '15px', padding: '15px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}>
                        📦 Total de productos: <strong>{productos.length}</strong> | 
                        Mostrando: <strong>{productosFiltrados.length}</strong>
                    </div>

                    <div className="mi-tabla">
                        <div className="row mb-3">
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Buscar por nombre..."
                                        value={busqueda}
                                        onChange={(e) => setBusqueda(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select"
                                    value={categoriaFiltro}
                                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                                >
                                    <option value="">Todas las categorías</option>
                                    {categorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4 text-end">
                                <Link className="btn btn-success" to="/crear-producto">
                                    <i className="bi bi-plus-circle"></i> Crear Producto
                                </Link>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md">
                                <table className="table table-hover table-striped">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Descripción</th>
                                            <th>Precio</th>
                                            <th>Stock</th>
                                            <th>Categoría</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosFiltrados.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center">
                                                    {productos.length === 0 
                                                        ? '⚠️ No hay productos en la base de datos. Ejecuta el script SQL.' 
                                                        : '🔍 No se encontraron productos con ese filtro'}
                                                </td>
                                            </tr>
                                        ) : (
                                            productosFiltrados.map((prod) => (
                                                <tr
                                                    key={prod.id}
                                                    style={{
                                                        opacity: prod.activo ? 1 : 0.5,
                                                        backgroundColor: prod.activo ? 'white' : '#f8f8f8'
                                                    }}
                                                >
                                                    <td>{prod.id}</td>
                                                    <td>
                                                        <strong>{prod.nombre}</strong>
                                                        {prod.stock < 5 && prod.activo && (
                                                            <span className="badge bg-warning ms-2">
                                                                <i className="bi bi-exclamation-triangle"></i> Stock Bajo
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>{prod.descripcion}</td>
                                                    <td className="text-success fw-bold">
                                                        ${prod.precio?.toLocaleString('es-CL') || '0'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${prod.stock < 5 ? 'bg-danger' : 'bg-primary'}`}>
                                                            {prod.stock} unidades
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-info">
                                                            {prod.categoria?.nombre || 'Sin categoría'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {prod.activo ? (
                                                            <span className="badge bg-success">Activo</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">Inactivo</span>
                                                        )}
                                                    </td>
                                        <td>
                                            <Link
                                                className="btn btn-sm btn-outline-primary"
                                                to={`/editar-producto/${prod.id}`}
                                            >
                                                <i className="bi bi-pencil"></i> Editar
                                            </Link>
                                            <button
                                                className={`btn btn-sm ms-2 ${prod.activo ? 'btn-desactivar' : 'btn-success-strong'}`}
                                                onClick={() => toggleEstado(prod)}
                                                disabled={toggleBusy[prod.id]}
                                                >
                                                {toggleBusy[prod.id] ? '...' : (prod.activo ? 'Desactivar' : 'Activar')}
                                            </button>
                                            <button
                                                className="btn btn-sm btn-eliminar ms-2"
                                                onClick={() => eliminarProducto(prod)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
            </div>
        </>
    );
}
