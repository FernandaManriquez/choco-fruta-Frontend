import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../componentes/Navbar/Navbar';
import { Footer } from '../../componentes/Footer/Footer';
import './Usuarios.css';
import { getToken, setToken, guardarUsuario } from '../../utils/session';
    const obtenerTokenAdmin = () => getToken();
    const refrescarToken = async () => {
        const tok = getToken();
        if (!tok) return null;
        try {
            const resp = await fetch('http://localhost:8081/api/auth/refresh', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${tok}`, 'Accept': 'application/json' }
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data?.token) {
                    setToken(data.token);
                    guardarUsuario({ token: data.token });
                    return data.token;
                }
            }
        } catch { /* noop */ }
        return tok;
    };
export function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = 'http://localhost:8081/api/usuarios';

    

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await obtenerTokenAdmin();
            if (!token) {
                setError('Acceso restringido. Inicia sesión como ADMIN.');
                return;
            }

            const response = await fetch(API_URL, {
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Acceso restringido. Inicia sesión como ADMIN.');
                }
                throw new Error('Error en la respuesta del servidor');
            }

            const data = await response.json();
            const usuariosNormalizados = data.map(u => ({
                id: u.id,
                nombre: u.nombre ?? u.username ?? '',
                email: u.email ?? '',
                rol: typeof u.rol === 'string' ? u.rol : (u.rol?.name ?? ''),
                activo: u.enabled === true || u.enabled === 'true',
                fechaCreacion: u.createdAt ?? u.fechaCreacion ?? null,
            }));

            setUsuarios(usuariosNormalizados);
        } catch (error) {
            setError(error.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const handleDesactivar = async (id, nombre) => {
        if (!window.confirm(`¿Desactivar usuario "${nombre}"?`)) return;
        try {
            let token = obtenerTokenAdmin();
            let response = await fetch(`${API_URL}/${id}/desactivar`, { 
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (response.status === 401 || response.status === 403) {
                const refreshed = await refrescarToken();
                if (refreshed) {
                    token = refreshed;
                    response = await fetch(`${API_URL}/${id}/desactivar`, { 
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    });
                }
            }
            if (!response.ok) {
                const txt = await response.text().catch(() => '');
                alert(`❌ Error al desactivar usuario (${response.status}): ${txt || 'sin detalle'}`);
                return;
            }
            await response.json();
            alert('✅ Usuario desactivado exitosamente');
            cargarUsuarios();
        } catch {
            alert('❌ Error al desactivar usuario');
        }
    };

    const handleActivar = async (id, nombre) => {
        if (!window.confirm(`¿Activar usuario "${nombre}"?`)) return;
        try {
            let token = obtenerTokenAdmin();
            let response = await fetch(`${API_URL}/${id}/activar`, { 
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (response.status === 401 || response.status === 403) {
                const refreshed = await refrescarToken();
                if (refreshed) {
                    token = refreshed;
                    response = await fetch(`${API_URL}/${id}/activar`, { 
                        method: 'PATCH',
                        headers: {
                            'Accept': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                        }
                    });
                }
            }
            if (!response.ok) {
                const txt = await response.text().catch(() => '');
                alert(`❌ Error al activar usuario (${response.status}): ${txt || 'sin detalle'}`);
                return;
            }
            await response.json();
            alert('✅ Usuario activado exitosamente');
            cargarUsuarios();
        } catch {
            alert('❌ Error al activar usuario');
        }
    };

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`⚠️ ¿Eliminar permanentemente al usuario "${nombre}"?`)) return;
        try {
            let token = obtenerTokenAdmin();
            const makeReq = async () => fetch(`${API_URL}/${id}/eliminar`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            let response = await makeReq();
            if (response.status === 401 || response.status === 403) {
                const refreshed = await refrescarToken();
                if (refreshed) { token = refreshed; response = await makeReq(); }
            }
            if (response.status === 404) {
                const oldResp = await fetch(`${API_URL}/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (oldResp.ok) {
                    alert('🗑️ Usuario eliminado');
                    cargarUsuarios();
                    return;
                }
                response = oldResp;
            }
            if (response.ok) {
                alert('🗑️ Usuario eliminado');
                cargarUsuarios();
                return;
            }
            if (response.status === 409) {
                const fallback = await fetch(`${API_URL}/${id}/desactivar`, {
                    method: 'PATCH',
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (fallback.ok) {
                    alert('ℹ️ No se pudo eliminar (tiene compras/carrito). Usuario desactivado.');
                    cargarUsuarios();
                    return;
                }
                alert('❌ No se pudo eliminar ni desactivar');
                return;
            }
            if (response.status === 404) {
                alert('⚠️ Usuario no encontrado');
                cargarUsuarios();
                return;
            }
            if (response.status === 401 || response.status === 403) {
                alert('❌ Error al eliminar usuario');
                return;
            }
            try {
                const txt = await response.text();
                alert(`❌ Error al eliminar usuario (${response.status}): ${txt || 'sin detalle'}`);
            } catch {
                alert(`❌ Error al eliminar usuario (${response.status})`);
            }
        } catch {
            alert('❌ Error al eliminar usuario');
        }
    };

    const usuariosFiltrados = usuarios.filter(u =>
        (u.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
        (u.email ?? '').toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return (
        <>
        <div className="page-wrapper">
            <div className="container-fluid p-0"><Navbar /></div>
            <div className="container page-content">
                <div className="mi-tabla text-center my-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-3 text-muted">Cargando usuarios...</p>
                </div>
            </div>
            <Footer />
        </div>
        </>
    );

    if (error) return (
        <>
        <div className="page-wrapper">
            <div className="container-fluid p-0"><Navbar /></div>
            <div className="container page-content">
                <div className="mi-tabla">
                    <div className="alert alert-danger">
                        <h4>❌ Error al cargar usuarios</h4>
                        <p>{error}</p>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={cargarUsuarios}>🔄 Reintentar</button>
                            {String(error).toLowerCase().includes('acceso restringido') && (
                                <Link className="btn btn-outline-secondary" to="/login">Iniciar sesión</Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
        </>
    );

    return (
        <>
        <div className="page-wrapper">
            <div className="container-fluid p-0"><Navbar /></div>
            <div className="container page-content">

                <div className="dashboard-content">
                    <h2 className="dashboard-title">Gestión de Usuarios</h2>

                <div className="alert alert-info mb-3" style={{ background: 'white', borderRadius: '15px', padding: '15px' }}>
                    👥 Total: <strong>{usuarios.length}</strong> | Mostrando: <strong>{usuariosFiltrados.length}</strong>
                </div>

                <div className="mi-tabla">
                    {/* Barra de búsqueda */}
                    <div className="row mb-3">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre o email..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <Link className="btn btn-success" to="/crear-usuario">
                                <i className="bi bi-person-plus"></i> Crear Usuario
                            </Link>
                        </div>
                    </div>

                    {/* Tabla */}
                    <table className="table table-hover table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Creación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.length === 0 ? (
                                <tr><td colSpan="7" className="text-center">🔍 No se encontraron usuarios</td></tr>
                            ) : (
                                usuariosFiltrados.map((user) => (
                                    <tr key={user.id} style={{ opacity: user.activo ? 1 : 0.5 }}>
                                        <td>{user.id}</td>
                                        <td><strong>{user.nombre}</strong></td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${
                                                user.rol === 'ADMIN' ? 'bg-danger' : 'bg-secondary'
                                            }`}>{user.rol}</span>
                                        </td>
                                        <td>{user.activo ? <span className="badge bg-success">Activo</span> : <span className="badge bg-secondary">Inactivo</span>}</td>
                                        <td>{new Date(user.fechaCreacion).toLocaleDateString('es-CL')}</td>
                                        <td>
                                            {user.activo ? (
                                                <>
                                                    <Link to={`/editar-usuario/${user.id}`} className="btn btn-sm btn-outline-primary me-2">
                                                        <i className="bi bi-pencil"></i> Editar
                                                    </Link>
                                                    <button className="btn btn-sm btn-desactivar me-2"
                                                        onClick={() => handleDesactivar(user.id, user.nombre)}>
                                                        <i className="bi bi-ban"></i> Desactivar
                                                    </button>
                                                    <button className="btn btn-sm btn-eliminar"
                                                        onClick={() => handleEliminar(user.id, user.nombre)}>
                                                        <i className="bi bi-trash"></i> Eliminar
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="btn btn-sm btn-success-strong"
                                                    onClick={() => handleActivar(user.id, user.nombre)}>
                                                    <i className="bi bi-check-circle"></i> Activar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Footer />
        </div>
        </div>
        </>
    );
}
