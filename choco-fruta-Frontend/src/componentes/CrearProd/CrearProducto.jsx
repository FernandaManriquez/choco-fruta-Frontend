import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "../Navbar/Navbar";
import { obtenerRutaImagen, subirImagen, esUrlImagenValida } from '../../utils/imageHelper';
import { getToken } from '../../utils/session';
import './CrearProducto.css';

const API_BASE_URL = 'http://localhost:8081/api';

export function CrearProducto() {
    const navigate = useNavigate();

    const [producto, setProducto] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoria: '',
        imagen: ''
    });

    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [archivoImagen, setArchivoImagen] = useState(null);
    const [subiendoImagen, setSubiendoImagen] = useState(false);

    const esRutaImagenUsable = (url) => {
        if (!url) return false;
        const s = String(url).trim();
        const hasScheme = s.startsWith('http://') || s.startsWith('https://');
        const isBackend = s.startsWith('/uploads/');
        const isPublic = s.startsWith('/img/');
        return hasScheme || isBackend || isPublic;
    };

    useEffect(() => {
        const token = getToken();
        fetch(`${API_BASE_URL}/categorias`, {
            headers: {
                'Accept': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error('Acceso restringido. Inicia sesión como ADMIN.');
                    }
                    throw new Error('Error al cargar categorías');
                }
                return response.json();
            })
            .then(data => {
                setCategorias(data);
                setLoadingCategorias(false);
            })
            .catch(error => {
                console.error('Error al obtener las categorías:', error);
                setError(error.message || 'No se pudieron cargar las categorías');
                setLoadingCategorias(false);
            });
    }, []);

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
        setProducto(prev => ({
            ...prev,
            [name]: value
        }));
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

        try {
            const rutaImagen = await subirImagen(file);
            setProducto(prev => ({
                ...prev,
                imagen: rutaImagen
            }));
            alert('✅ Imagen subida exitosamente');
        } catch {
            alert('❌ Error al subir la imagen');
            setArchivoImagen(null);
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const precioNum = Number(String(producto.precio).replace(/\D+/g, '')) || 0;
        const stockNum = Number(String(producto.stock).replace(/\D+/g, '')) || 0;
        if (producto.imagen && !esRutaImagenUsable(producto.imagen)) {
            setError('La URL de imagen debe incluir http/https o usar /uploads/');
            setLoading(false);
            return;
        }

        const productoParaEnviar = {
            nombre: producto.nombre.trim(),
            descripcion: producto.descripcion.trim(),
            precio: precioNum,
            stock: stockNum,
            categoria: { id: parseInt(producto.categoria, 10) },
            imagen: producto.imagen.trim() || 'default.jpg'
        };
        if (!productoParaEnviar.precio || !productoParaEnviar.stock) {
            setError('Precio y Stock deben ser números válidos');
            setLoading(false);
            return;
        }

        try {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const ac = new AbortController();
            const timer = setTimeout(() => { try { ac.abort(); } catch { void 0; } }, 15000);

            const doPost = async (tok) => fetch(`${API_BASE_URL}/productos`, {
                method: 'POST',
                headers: { ...headers, ...(tok ? { 'Authorization': `Bearer ${tok}` } : {}) },
                body: JSON.stringify(productoParaEnviar),
                signal: ac.signal
            });

            let response;
            try {
                response = await doPost(token);
            } catch {
                await new Promise(r => setTimeout(r, 500));
                response = await doPost(token);
            }

            if (response.status === 401 || response.status === 403) {
                const rf = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                    signal: ac.signal
                }).catch(() => null);
                if (rf && rf.ok) {
                    const data = await rf.json();
                    if (data?.token) {
                        response = await doPost(data.token);
                    }
                }
            }

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(errorText || 'Error al crear el producto');
            }

            navigate('/productos', { state: { message: 'Producto creado exitosamente' } });

            try { clearTimeout(timer); } catch { void 0; }
        } catch (err) {
            setError(err.message || 'No se pudo crear el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        const tieneContenido = Object.values(producto).some(val => val !== '');
        if (!tieneContenido || window.confirm('¿Está seguro de cancelar? Se perderán los datos ingresados.')) {
            navigate('/productos');
        }
    };

    return (
        <>
            <Navbar />

            <div className="crear-producto-container">
                <div className="form-card">
                    <h2>Crear Producto</h2>
                    
                    {error && (
                        <div className="error-message">
                            {error}
                            <button onClick={() => setError(null)} className="error-close">×</button>
                        </div>
                    )}

                    {loadingCategorias ? (
                        <div className="loading">Cargando categorías...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="nombre">
                                        Nombre del producto <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={producto.nombre}
                                        onChange={handleChange}
                                        disabled={loading}
                                        maxLength={100}
                                        placeholder="Ej: Almendras Premium"
                                        required
                                        style={{ backgroundColor: 'white' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="precio">
                                        Precio <span className="required">*</span>
                                    </label>
                                    <div className="price-input">
                                        <span className="currency">$</span>
                                        <input
                                            type="number"
                                            id="precio"
                                            name="precio"
                                            step="1"
                                            min="1"
                                            value={producto.precio}
                                            onChange={handleChange}
                                            disabled={loading}
                                            placeholder="3500"
                                            required
                                            style={{ backgroundColor: 'white' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="stock">
                                        Stock <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="stock"
                                        name="stock"
                                        min="0"
                                        value={producto.stock}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="10"
                                        required
                                        style={{ backgroundColor: 'white' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="categoria">
                                        Categoría <span className="required">*</span>
                                    </label>
                                    <select
                                        id="categoria"
                                        name="categoria"
                                        value={producto.categoria}
                                        onChange={handleChange}
                                        disabled={loading || categorias.length === 0}
                                        required
                                        style={{ backgroundColor: 'white', color: 'black' }}
                                    >
                                        <option value="">Seleccione una categoría</option>
                                        {categorias.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {categorias.length === 0 && !loadingCategorias && (
                                        <small className="error-text">No hay categorías disponibles</small>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="descripcion">
                                    Descripción <span className="required">*</span>
                                </label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    rows="4"
                                    value={producto.descripcion}
                                    onChange={handleChange}
                                    disabled={loading}
                                    maxLength={500}
                                    placeholder="Características principales del producto..."
                                    required
                                    style={{ backgroundColor: 'white' }}
                                />
                                <small className="char-count">
                                    {producto.descripcion.length}/500 caracteres
                                </small>
                            </div>

                            {/* ⭐ NUEVA SECCIÓN: Subida de Archivo */}
                            <div className="form-group">
                                <label htmlFor="archivo-imagen">
                                    Subir Imagen desde tu PC
                                </label>
                                <input
                                    type="file"
                                    id="archivo-imagen"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={loading || subiendoImagen}
                                    className="form-control"
                                    style={{ backgroundColor: 'white' }}
                                />
                                {subiendoImagen && (
                                    <small style={{ color: '#b07d62' }}>
                                        ⏳ Subiendo imagen...
                                    </small>
                                )}
                                {archivoImagen && !subiendoImagen && (
                                    <small style={{ color: '#7d9b6e' }}>
                                        ✅ Archivo seleccionado: {archivoImagen.name}
                                    </small>
                                )}
                            </div>

                            {/* 🔽 BLOQUE DE URL MANUAL (Opcional) */}
                            <div className="form-group">
                                <label htmlFor="imagen">
                                    URL de la imagen
                                </label>
                                <input
                                    type="text"
                                    id="imagen"
                                    name="imagen"
                                    value={producto.imagen}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    style={{ backgroundColor: 'white' }}
                                />
                                <small className="help-text">
                                    Opcional: Ingresa la URL completa de la imagen
                                </small>

                                {/* ✅ Vista previa */}
                                {producto.imagen && esUrlImagenValida(producto.imagen) && esRutaImagenUsable(producto.imagen) && (
                                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                        <small style={{ color: '#7c4f32', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                                            📸 Vista previa:
                                        </small>
                                        <img
                                            src={obtenerRutaImagen(producto.imagen)}
                                            alt="Preview del producto"
                                            style={{
                                                maxWidth: '200px',
                                                maxHeight: '150px',
                                                border: '2px solid #e2cfc3',
                                                borderRadius: '8px',
                                                objectFit: 'cover'
                                            }}
                                            referrerPolicy="no-referrer"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.src = obtenerRutaImagen('');
                                            }}
                                        />
                                    </div>
                                )}
                                {producto.imagen && !esRutaImagenUsable(producto.imagen) && (
                                    <small className="error-text">URL incompleta. Debe incluir http/https o comenzar con /uploads/</small>
                                )}
                            </div>

                            <div className="form-actions">
                                <button type="submit" disabled={loading || subiendoImagen} className="btn-primary">
                                    {loading ? 'Guardando...' : 'Crear Producto'}
                                </button>
                                <button type="button" onClick={handleCancel} disabled={loading} className="btn-secondary">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
