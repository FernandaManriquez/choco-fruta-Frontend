import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../componentes/Navbar/Navbar';
import { Footer } from '../../componentes/Footer/Footer';
import { esSuperAdmin, getToken, setToken } from '../../utils/session';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:8081/api';

export function Dashboard() {
    const [estadisticas, setEstadisticas] = useState({
        totalProductos: 0,
        totalUsuarios: 0,
        productosStockBajo: 0
    });
    
    
    const [compras, setCompras] = useState([]);
    const [, setComprasError] = useState('');
    const [loading, setLoading] = useState(true);
    const [stockCritico, setStockCritico] = useState([]);
    const [, setStockError] = useState('');

    const ranRef = useRef(false);
    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;
        const controller = new AbortController();
        cargarEstadisticas(controller.signal);
        cargarCompras(controller.signal);
        return () => {};
    }, []);

    const cargarCompras = async () => {
        try {
            if (!esSuperAdmin()) { setCompras([]); return; }
            const token = getToken();
            if (!token) { setCompras([]); return; }
            let currentTok = token;

            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token || ''}`
            };
            const doAdminFetchPaged = async (tok) => {
                return fetch(`${API_BASE_URL}/admin/compras?page=0&size=10`, {
                    headers: {
                        ...headers,
                        'Authorization': `Bearer ${tok || token || ''}`
                    }
                });
            };
            const doAdminFetchAll = async (tok) => {
                return fetch(`${API_BASE_URL}/admin/compras`, {
                    headers: {
                        ...headers,
                        'Authorization': `Bearer ${tok || token || ''}`
                    }
                });
            };

            let resp = await doAdminFetchAll(currentTok);
            
            if (resp.status === 401 || resp.status === 403) {
                try {
                    const r = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                            'Accept': 'application/json'
                        }
                    });
                    if (r.ok) {
                        const dataR = await r.json();
                        if (dataR?.token) {
                            setToken(dataR.token);
                            currentTok = dataR.token;
                            resp = await doAdminFetchAll(currentTok);
                        }
                    }
                } catch (e) {
                    console.warn('refresh de token admin falló', e);
                }
            }

            let data = [];
            if (resp.ok) {
                try { data = await resp.json(); } catch { data = []; }
            } else {
                setComprasError(`Error ${resp.status} al consultar compras`);
            }
            if (!Array.isArray(data) || data.length === 0) {
                let respPaged = await doAdminFetchPaged(currentTok);
                if (respPaged.ok) {
                    try {
                        const dataPaged = await respPaged.json();
                        data = Array.isArray(dataPaged) ? dataPaged : [];
                        setComprasError('');
                    } catch { data = []; }
                } else if (respPaged.status === 401 || respPaged.status === 403) {
                    try {
                        const r2 = await fetch(`${API_BASE_URL}/auth/refresh`, {
                            method: 'POST',
                            headers: {
                                'Authorization': currentTok ? `Bearer ${currentTok}` : '',
                                'Accept': 'application/json'
                            }
                        });
                        if (r2.ok) {
                            const d2 = await r2.json();
                            if (d2?.token) {
                                setToken(d2.token);
                                currentTok = d2.token;
                                respPaged = await doAdminFetchPaged(currentTok);
                                if (respPaged.ok) {
                                    try {
                                        const dataPaged = await respPaged.json();
                                        data = Array.isArray(dataPaged) ? dataPaged : [];
                                        setComprasError('');
                                    } catch { data = []; }
                                }
                            }
                        }
                    } catch {
                        setComprasError('No se pudo refrescar token para compras paginadas');
                    }
                } else {
                    setComprasError(respPaged.status === 403 ? 'No autorizado: requiere rol ADMIN' : `Error ${respPaged.status} al consultar compras paginadas`);
                }
            }
            setCompras(Array.isArray(data) ? data : []);
        } catch {
            setCompras([]);
            setComprasError('No se pudo conectar con el backend');
        }
    };


    const cargarEstadisticas = async () => {
        try {
            setLoading(true);

            const token = getToken();
            const respProductos = await fetch(`${API_BASE_URL}/productos?page=0&size=1000`, {
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            let productos = [];
            if (respProductos.ok) {
                productos = await respProductos.json().catch(() => []);
            }

            let usuarios = [];
            try {
                const respUsuarios = await fetch(`${API_BASE_URL}/usuarios`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (respUsuarios.ok) {
                    usuarios = await respUsuarios.json().catch(() => []);
                }
            } catch { void 0; }

            let criticosCount = 0;
            try {
                const respStockBajo = await fetch(`${API_BASE_URL}/productos/stock-bajo`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (respStockBajo.ok) {
                    const criticos = await respStockBajo.json().catch(() => []);
                    const arr = Array.isArray(criticos) ? criticos : [];
                    setStockCritico(arr);
                    setStockError('');
                    criticosCount = arr.length;
                } else {
                    setStockError(`Error ${respStockBajo.status} al consultar stock bajo`);
                    setStockCritico([]);
                }
            } catch {
                setStockError('No se pudo cargar stock crítico');
                setStockCritico([]);
            }

            setEstadisticas({
                totalProductos: Array.isArray(productos) ? productos.length : 0,
                totalUsuarios: Array.isArray(usuarios) ? usuarios.length : 0,
                productosStockBajo: criticosCount
            });

        } catch {
            void 0;
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <div className="container-fluid p-0">
                    <Navbar />
                </div>
                <div className="container">
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="container-fluid p-0">
                <Navbar />
            </div>
            <div className="container">
                <div className="dashboard-content">
                    <h2 className="dashboard-title">Dashboard Administrativo</h2>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{estadisticas.totalProductos}</h3>
                                    <p>Total de Productos</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="bi bi-people"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{estadisticas.totalUsuarios}</h3>
                                    <p>Total de Usuarios</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="stat-card alert-card">
                                <div className="stat-icon">
                                    <i className="bi bi-exclamation-triangle"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{estadisticas.productosStockBajo}</h3>
                                    <p>Productos Stock Bajo</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {stockCritico.length > 0 && (
                        <div className="mt-4" style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)' }}>
                            <div className="d-flex align-items-center mb-2" style={{ color: '#c65300' }}>
                                <span className="section-emoji" aria-hidden="true">⚠️</span>
                                <strong>Alertas de Stock Crítico</strong>
                            </div>
                            <div className="table-responsive">
                                <table className="table alerts-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Stock Actual</th>
                                            <th>Categoría</th>
                                            <th>Precio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockCritico.map(p => (
                                            <tr key={`dash-crit-${p.id}`}>
                                                <td>
                                                    <strong>{p.nombre}</strong>
                                                    <span className="badge bg-danger ms-2">Crítico</span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-warning text-dark">{Number(p.stock || 0)} unidades</span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-info">{p?.categoria?.nombre || 'Sin categoría'}</span>
                                                </td>
                                                <td className="text-success fw-bold">
                                                    ${Number(p.precio ?? 0).toLocaleString('es-CL')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 section-card">
                        <div className="section-title mb-2">
                            <span className="section-emoji" aria-hidden="true">📃</span>
                            <span>Compras Recientes</span>
                        </div>
                        <div className="table-responsive">
                            <table className="table purchases-table">
                                <thead>
                                    <tr>
                                        <th># Boleta</th>
                                        <th>Cliente</th>
                                        <th>Fecha</th>
                                        <th>Total</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(compras) ? compras : []).map(b => (
                                        <tr key={`cmp-${b.id ?? b.numero}`}> 
                                            <td>{b.numero ?? b.id}</td>
                                            <td>{b?.usuario?.username || '—'}</td>
                                            <td>{b?.fecha ? new Date(b.fecha).toLocaleString('es-CL') : '—'}</td>
                                            <td>${Number(b?.total ?? 0).toLocaleString('es-CL')}</td>
                                            <td>
                                                <Link className="btn-detail" to={`/seguimiento-pedido?numero=${b?.numero ?? ''}`}>
                                                    Ver Detalle
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {Array.isArray(compras) && compras.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted">Sin compras recientes</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}
