import { useState, useEffect } from 'react';
import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import { obtenerRutaImagen } from '../../utils/imageHelper';
import { getToken } from '../../utils/session';
import './DetalleProducto.css';

    const API_BASE_URL = 'http://localhost:8081/api';

export function DetalleProducto() {
    const [producto, setProducto] = useState(null);
    const [cantidad, setCantidad] = useState(1);
    const [loading, setLoading] = useState(true);
    const [imagenUrl, setImagenUrl] = useState('');

    useEffect(() => {
        const id = window.location.pathname.split('/').pop();
        cargarProducto(id);
    }, []);

    const cargarProducto = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/${id}`);
            const data = await response.json();
            setProducto(data);
        } catch (error) {
            console.error('Error al cargar producto:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cargarImagen = async () => {
            try {
                const img = (producto?.imagen || '').trim();
                if (!img || !img.startsWith('/uploads/')) { setImagenUrl(''); return; }
                const filename = img.split('/').pop();
                const origin = API_BASE_URL.replace('/api', '');

                const token = getToken();
                if (token) {
                    try {
                        const resp = await fetch(`${origin}${img}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (resp.ok) {
                            const blob = await resp.blob();
                            const url = URL.createObjectURL(blob);
                            setImagenUrl(url);
                            return;
                        }
                    } catch (e) {
                        console.warn('carga imagen auth falló', e);
                    }
                }

                const resp2 = await fetch(`${API_BASE_URL}/upload/imagenes/${filename}`);
                if (resp2.ok) {
                    const blob2 = await resp2.blob();
                    const url2 = URL.createObjectURL(blob2);
                    setImagenUrl(url2);
                    return;
                }

                setImagenUrl('');
            } catch {
                setImagenUrl('');
            }
        };
        cargarImagen();
        return () => {
            if (imagenUrl) URL.revokeObjectURL(imagenUrl);
        };
    }, [producto?.imagen, imagenUrl]);

    const agregarAlCarrito = async () => {
        if (!producto || !producto.activo || producto.precio <= 0) return;

        const token = getToken();
        if (!token) {
            alert('⚠️ Debes iniciar sesión para agregar productos al carrito');
            window.location.href = '/login';
            return;
        }

        try {
            const resp = await fetch(`${API_BASE_URL}/carrito` , {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productoId: producto.id, cantidad })
            });
            if (!resp.ok) {
                const errText = await resp.text().catch(() => '');
                console.warn('No se pudo agregar al carrito del servidor:', errText);
            }
        } catch (e) {
            console.warn('Error al agregar al carrito del servidor:', e);
        }

        const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
        const index = carrito.findIndex(item => item.nombre === producto.nombre);

        if (index !== -1) {
            carrito[index].cantidad += cantidad;
            carrito[index].subtotal = carrito[index].precio * carrito[index].cantidad;
        } else {
            carrito.push({
                productoId: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad,
                subtotal: producto.precio * cantidad
            });
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('carritoActualizado'));
        alert(`✅ ${producto.nombre} añadido al carrito (${cantidad} unidad${cantidad > 1 ? 'es' : ''})`);
    };

    const contactarVentas = () => {
        alert(`Para consultar precios y disponibilidad de ${producto?.nombre}, contáctanos a través de nuestros canales de atención.`);
    };

    if (loading) {
        return (
            <>
            <div className="container-fluid p-0"><Navbar /></div>
            <div className="container">
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visualmente-hidden">Cargando...</span>
                    </div>
                </div>
                <Footer />
            </div>
            </>
        );
    }

    if (!producto) {
        return (
            <>
            <div className="container-fluid p-0"><Navbar /></div>
            <div className="container">
                <div className="alert alert-warning">Producto no encontrado</div>
                <Footer />
            </div>
            </>
        );
    }

    if (producto && producto.activo === false) {
        return (
            <>
            <div className="container-fluid p-0"><Navbar /></div>
            <div className="container">
                <div className="alert alert-secondary">Producto no disponible</div>
                <div className="navegacion">
                    <a href="/catalogo">
                        <i className="bi bi-arrow-left"></i> Volver a Productos
                    </a>
                </div>
                <Footer />
            </div>
            </>
        );
    }

    return (
        <>
        <div className="page-wrapper">
        <div className="container-fluid p-0"><Navbar /></div>
        <div className="container page-content">

            <div className="detalle-content">
                <h1 className="detalle-title">{producto.nombre}</h1>

                <div className="detalle-container">
                    <div className="detalle-imagen-col">
                        <img 
                            src={imagenUrl || obtenerRutaImagen(producto.imagen)}
                            alt={producto.nombre}
                            className="producto-imagen"
                        />
                    </div>

                    <div className="detalle-info-col">
                        <div className="info-producto">
                            <p>
                                <strong>Precio: </strong>
                                {producto.precio > 0 ? (
                                    <span className="precio-display">
                                        ${producto.precio.toLocaleString('es-CL')}
                                    </span>
                                ) : (
                                    <span className="precio-display">Consultar precio</span>
                                )}
                            </p>
                            <p><strong>Descripción: </strong>{producto.descripcion}</p>
                            <p><strong>Stock: </strong>{producto.stock} unidades</p>
                            <p><strong>Categoría: </strong>{producto.categoria.nombre}</p>
                        </div>

                        {producto.precio > 0 && producto.stock > 0 ? (
                            <div className="compra-section">
                                <h4>Agregar al Carrito</h4>
                                <div className="cantidad-control">
                                    <label htmlFor="cantidad">Cantidad:</label>
                                    <select 
                                        id="cantidad" 
                                        value={cantidad}
                                        onChange={(e) => setCantidad(parseInt(e.target.value))}
                                        className="form-select cantidad-select"
                                    >
                                        {[...Array(Math.min(10, producto.stock))].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <button onClick={agregarAlCarrito} className="btn-comprar">
                                    <i className="bi bi-cart-plus"></i> Agregar al Carrito
                                </button>
                            </div>
                        ) : (
                            <div className="sin-precio-section">
                                <h5>Producto sin precio definido</h5>
                                <p>Para consultar precios y disponibilidad, por favor contáctanos.</p>
                                <button className="btn-detalle" onClick={contactarVentas}>
                                    Contactar Ventas
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="navegacion">
                    <a href="/catalogo">
                        <i className="bi bi-arrow-left"></i> Volver a Productos
                    </a>
                    <a href="/carrito">
                        <i className="bi bi-cart3"></i> Ver Carrito
                    </a>
                </div>
            </div>

            <Footer />
        </div>
        </div>
        </>
    );
}
