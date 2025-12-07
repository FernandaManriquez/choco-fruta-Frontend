import { useState, useEffect, useCallback } from 'react';
import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import './CatalogoProductos.css';
import { obtenerRutaImagen } from '../../utils/imageHelper';
import { getToken } from '../../utils/session';

    const API_BASE_URL = 'http://localhost:8081/api';

export function CatalogoProductos() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imagenUrls, setImagenUrls] = useState({});

    const cargarProductos = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/productos`);
            const data = await response.json();
            const lista = Array.isArray(data) ? data : [];
            setProductos(lista);
            await prefetchUploads(lista);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarProductos();
    }, [cargarProductos]);

    

    const prefetchUploads = async (lista) => {
        try {
            const token = getToken();
            const origin = API_BASE_URL.replace('/api', '');
            const map = {};
            await Promise.all(
                lista.map(async (p) => {
                    const img = (p.imagen || '').trim();
                    if (img.startsWith('/uploads/')) {
                        const filename = img.split('/').pop();
                        try {
                            // Intento 1: ruta estática protegida (si hay token)
                            if (token) {
                                const resp = await fetch(`${origin}${img}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (resp.ok) {
                                    const blob = await resp.blob();
                                    map[p.id] = URL.createObjectURL(blob);
                                    return;
                                }
                            }
                            // Intento 2: endpoint público del backend
                            const resp2 = await fetch(`${API_BASE_URL}/upload/imagenes/${filename}`);
                            if (resp2.ok) {
                                const blob2 = await resp2.blob();
                                map[p.id] = URL.createObjectURL(blob2);
                                return;
                            }
                        } catch (err) {
                            console.warn('prefetch image error', err);
                        }
                    }
                })
            );
            if (Object.keys(map).length > 0) setImagenUrls(map);
        } catch (err) {
            console.warn(err);
        }
    };

    const verDetalle = (id) => {
        window.location.href = `/detalle-producto/${id}`;
    };

    if (loading) {
        return (
            <div className="container-fluid p-0">
                <Navbar />
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <div className="page-wrapper">
            <div className="container-fluid p-0">
                <Navbar />
                
                <div className="catalogo-content page-content">
                    <h3 className="catalogo-title">Lista de Productos - Choco&Frutas</h3>

                    <div className="table-responsive">
                        <table className="table table-striped catalogo-table">
                            <thead className="table-dark">
                                <tr>
                                    <th>Nombre</th>
                                    <th>Imagen</th>
                                    <th>Precio</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.filter(p => p?.activo).map(prod => (
                                    <tr key={prod.id} className="producto-row">
                                        <td>
                                            <span className="producto-nombre">{prod.nombre}</span>
                                            {prod.stock < 5 && (
                                                <span className="badge bg-warning ms-2">
                                                    ⚠️ Stock Bajo
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <img 
                                                src={imagenUrls[prod.id] || obtenerRutaImagen(prod.imagen)} 
                                                alt={prod.nombre} 
                                                className="producto-foto"
                                                referrerPolicy="no-referrer"
                                                data-original={prod.imagen || ''}
                                                data-fallback-step="0"
                                                onError={(e) => {
                                                    const el = e.currentTarget;
                                                    const original = (el.dataset.original || '').trim();
                                                    const step = el.dataset.fallbackStep || '0';
                                                    const isBare = original && !original.startsWith('http://') && !original.startsWith('https://') && !original.startsWith('/uploads/') && !original.startsWith('/img/');
                                                    const isUploads = original && original.startsWith('/uploads/');
                                                    if (step === '0' && isBare) {
                                                        el.src = `http://localhost:8081/uploads/${original}`;
                                                        el.dataset.fallbackStep = '1';
                                                    } else if (step === '0' && isUploads) {
                                                        const base = original.split('/').pop();
                                                        el.src = `/img/${base}`;
                                                        el.dataset.fallbackStep = '1';
                                                    } else {
                                                        el.src = obtenerRutaImagen('');
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <span className="producto-precio">
                                                ${Number(prod.precio ?? 0).toLocaleString('es-CL')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="producto-descripcion">
                                                {prod.descripcion}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-detalle"
                                                onClick={() => verDetalle(prod.id)}
                                            >
                                                Ver Detalle
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
