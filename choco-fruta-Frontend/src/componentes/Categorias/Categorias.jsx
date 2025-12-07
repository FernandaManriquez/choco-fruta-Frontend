import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../componentes/Navbar/Navbar';
import { Footer } from '../../componentes/Footer/Footer';
import './Categorias.css';
import { getToken } from '../../utils/session';

export function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = 'http://localhost:8081/api/categorias';

    const cargarCategorias = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = getToken();

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
            const categoriasNormalizadas = (data || []).map(c => ({
                id: c.id,
                nombre: c.nombre ?? ''
            }));
            setCategorias(categoriasNormalizadas);
        } catch (error) {
            setError(error.message || 'Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
    }, []);

    const handleEliminar = async (id, nombre) => {
        if (!window.confirm(`⚠️ ¿Eliminar permanentemente la categoría "${nombre}"?`)) return;
        try {
            const token = getToken();
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            if (!response.ok) throw new Error('Error al eliminar categoría');
            alert('🗑️ Categoría eliminada');
            cargarCategorias();
        } catch {
            alert('❌ Error al eliminar categoría');
        }
    };

    const categoriasFiltradas = categorias.filter(c =>
        (c.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase())
    );

    if (loading) return (
        <>
        <div className="page-wrapper">
            <div className="container-fluid p-0"><Navbar /></div>
            <div className="container page-content">
                <div className="mi-tabla text-center my-5">
                    <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                    <p className="mt-3 text-muted">Cargando categorías...</p>
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
                        <h4>❌ Error al cargar categorías</h4>
                        <p>{error}</p>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={cargarCategorias}>🔄 Reintentar</button>
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
                    <h2 className="dashboard-title">Gestión de Categorías</h2>

                <div className="alert alert-info mb-3" style={{ background: 'white', borderRadius: '15px', padding: '15px' }}>
                    📚 Total: <strong>{categorias.length}</strong> | Mostrando: <strong>{categoriasFiltradas.length}</strong>
                </div>

                <div className="mi-tabla">
                    <div className="row mb-3">
                        <div className="col-md-8">
                            <div className="input-group">
                                <span className="input-group-text"><i className="bi bi-search"></i></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar por nombre..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <Link className="btn btn-success" to="/crear-categoria">
                                <i className="bi bi-plus-circle"></i> Crear Categoría
                            </Link>
                        </div>
                    </div>

                    <table className="table table-hover table-striped">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoriasFiltradas.length === 0 ? (
                                <tr><td colSpan="3" className="text-center">🔍 No se encontraron categorías</td></tr>
                            ) : (
                                categoriasFiltradas.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>{cat.id}</td>
                                        <td><strong>{cat.nombre}</strong></td>
                                        <td>
                                            <Link to={`/editar-categoria/${cat.id}`} className="btn btn-sm btn-outline-primary me-2">
                                                <i className="bi bi-pencil"></i> Editar
                                            </Link>
                                            <button className="btn btn-sm btn-eliminar" onClick={() => handleEliminar(cat.id, cat.nombre)}>
                                                <i className="bi bi-trash"></i> Eliminar
                                            </button>
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

