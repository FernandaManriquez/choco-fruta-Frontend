import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../Navbar/Navbar';
import { obtenerRutaImagen, subirImagen, esUrlImagenValida } from '../../utils/imageHelper';
import { getToken } from '../../utils/session';
import './EditarProd.css';

const API_BASE_URL = 'http://localhost:8081/api';

export function EditarProducto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const productoId = parseInt(id);

    const [producto, setProducto] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: {
            id: '',
            nombre: ''
        },
        imagen: ''
    });

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [archivoImagen, setArchivoImagen] = useState(null);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');
    const [localPreviewUrl, setLocalPreviewUrl] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);

                const respProducto = await fetch(`${API_BASE_URL}/productos/${productoId}`);
                if (!respProducto.ok) {
                    throw new Error('Error al cargar el producto');
                }
                const dataProducto = await respProducto.json();

                
                setProducto({
                    ...dataProducto,  
                    descripcion: dataProducto.descripcion || ''
                });

                const token = getToken();
                const respCategorias = await fetch(`${API_BASE_URL}/categorias`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (!respCategorias.ok) {
                    throw new Error('Error al cargar categorías');
                }
                const dataCategorias = await respCategorias.json();

                setCategorias(dataCategorias);
                setError(null);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (productoId) {
            cargarDatos();
        }
    }, [productoId]);

    useEffect(() => {
        const cargarPreviewActual = async () => {
            try {
                const img = (producto?.imagen || '').trim();
                if (!img || !img.startsWith('/uploads/')) return;
                const token = getToken();
                if (!token) return;
                const origin = API_BASE_URL.replace('/api', '');
                const resp = await fetch(`${origin}${img}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!resp.ok) return;
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                setLocalPreviewUrl(url);
            } catch (err) {
                console.warn(err);
            }
        };
        cargarPreviewActual();
        return () => {
            if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
        };
    }, [producto?.imagen, localPreviewUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'precio' || name === 'stock') {
            const soloDigitos = String(value).replace(/\D+/g, '');
            setProducto(prev => ({
                ...prev,
                [name]: soloDigitos
            }));
            return;
        }

        if (name === 'categoriaId') {
            const categoriaSeleccionada = categorias.find(c => c.id === parseInt(value));
            
            setProducto(prev => ({
                ...prev,  
                categoria: categoriaSeleccionada || { id: value, nombre: '' }
            }));
        } else {
           
            setProducto(prev => ({
                ...prev,  
                [name]: value
            }));
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('❌ Solo se permiten imágenes (JPG, PNG, GIF, WEBP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('❌ La imagen no puede superar los 5MB');
            return;
        }

        setArchivoImagen(file);
        setSubiendoImagen(true);

        const blobUrl = URL.createObjectURL(file);
        setLocalPreviewUrl(blobUrl);

        try {
            const rutaImagen = await subirImagen(file);
            setNuevaImagenUrl(rutaImagen);
            alert('✅ Imagen subida exitosamente');
        } catch {
            alert('❌ Error al subir la imagen');
            setArchivoImagen(null);
        } finally {
            setSubiendoImagen(false);
            // URL.revokeObjectURL(blobUrl); // opcional
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const datosActualizados = {
                id: producto.id,
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precio: parseInt(producto.precio) || 0,
                stock: parseInt(producto.stock) || 0,
                imagen: (nuevaImagenUrl && nuevaImagenUrl.trim() !== '') ? nuevaImagenUrl : producto.imagen
            };

            if (producto.categoria && producto.categoria.id) {
                datosActualizados.categoria = {
                    id: producto.categoria.id,
                    nombre: producto.categoria.nombre
                };
            }

            const token = getToken();
            const ac = new AbortController();
            setTimeout(() => { try { ac.abort(); } catch { void 0; } }, 15000);
            const doPut = async (tok) => fetch(`${API_BASE_URL}/productos/${productoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(tok ? { 'Authorization': `Bearer ${tok}` } : {})
                },
                body: JSON.stringify(datosActualizados),
                signal: ac.signal
            });
            let response;
            try {
                response = await doPut(token);
            } catch {
                await new Promise(r => setTimeout(r, 500));
                response = await doPut(token);
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    const rf = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                        signal: ac.signal
                    }).catch(() => null);
                    if (rf && rf.ok) {
                        const data = await rf.json();
                        if (data?.token) {
                            response = await doPut(data.token);
                        }
                    }
                }
                if (!response.ok) {
                    throw new Error('Error al actualizar el producto');
                }
            }

            setSuccess(true);

            setTimeout(() => {
                navigate('/productos');
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleVolver = () => {
        navigate('/productos');
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="container mt-5">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3 text-muted">Cargando producto...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="container mt-4" style={{ maxWidth: '700px' }}>
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="bi bi-pencil-square"></i> Editar Producto
                        </h5>
                        <button
                            onClick={handleVolver}
                            type="button"
                            className="btn-close"
                            aria-label="Cerrar"
                        ></button>
                    </div>

                    <div className="card-body">
                        {error && (
                            <div className="alert alert-danger">
                                <i className="bi bi-exclamation-triangle-fill"></i> {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                <i className="bi bi-check-circle-fill"></i> Producto actualizado exitosamente
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="form-label fw-bold">Nombre del Producto</label>
                            <input
                                type="text"
                                value={producto.nombre}
                                disabled
                                className="form-control bg-light"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Descripción</label>
                            <textarea
                                name="descripcion"
                                value={producto.descripcion}
                                onChange={handleChange}
                                rows={3}
                                className="form-control"
                                placeholder="Descripción del producto"
                            />
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Precio</label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={producto.precio}
                                        onChange={handleChange}
                                        min="0"
                                        className="form-control"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={producto.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className="form-control"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Categoría</label>
                            <input
                                type="text"
                                value={producto.categoria?.nombre || 'Sin categoría'}
                                disabled
                                className="form-control bg-light"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Imagen</label>
                            <input
                                type="text"
                                value={producto.imagen}
                                disabled
                                readOnly
                                className="form-control bg-light"
                                placeholder="Almen.jpg"
                            />
                        </div>

                        <div className="mb-3">
                            <small style={{ color: '#7c4f32', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📸 Vista previa de la imagen actual</small>
                            <img
                                src={localPreviewUrl || obtenerRutaImagen(producto.imagen)}
                                alt="Imagen actual"
                                style={{ maxWidth: '200px', maxHeight: '150px', border: '2px solid #e2cfc3', borderRadius: '8px', objectFit: 'cover' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>

                        <div className="mb-2">
                            <small className="text-muted">¿Deseas cambiar la imagen? Puedes subir un archivo o ingresar una URL.</small>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Subir Imagen desde tu PC</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={saving || subiendoImagen}
                                className="form-control"
                            />
                            {subiendoImagen && (
                                <small style={{ color: '#b07d62' }}>⏳ Subiendo imagen...</small>
                            )}
                            {archivoImagen && !subiendoImagen && (
                                <small style={{ color: '#7d9b6e' }}>✅ Archivo seleccionado: {archivoImagen.name}</small>
                            )}
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">URL de la imagen</label>
                            <input
                                type="text"
                                value={nuevaImagenUrl}
                                onChange={(e) => setNuevaImagenUrl(e.target.value)}
                                className="form-control"
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                            {(localPreviewUrl || (nuevaImagenUrl && esUrlImagenValida(nuevaImagenUrl))) && (
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                    <small style={{ color: '#7c4f32', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>📸 Vista previa:</small>
                                    <img
                                        src={localPreviewUrl || obtenerRutaImagen(nuevaImagenUrl)}
                                        alt="Preview del producto"
                                        style={{
                                            maxWidth: '200px',
                                            maxHeight: '150px',
                                            border: '2px solid #e2cfc3',
                                            borderRadius: '8px',
                                            objectFit: 'cover'
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            console.error('Error al cargar imagen:', localPreviewUrl || nuevaImagenUrl);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="d-flex gap-2 pt-3 border-top">
                            <button
                                onClick={handleVolver}
                                type="button"
                                className="btn btn-secondary">
                                <i className="bi bi-x-circle"></i> Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                type="button"
                                className="btn btn-primary flex-grow-1">
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-save"></i> Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
