import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import { getToken } from '../../utils/session';
import './Carrito.css';

export function Carrito() {
    const navigate = useNavigate();
    const [productosEnCarrito, setProductosEnCarrito] = useState([]);
    const [loading, setLoading] = useState(true);
    const [esLocal, setEsLocal] = useState(false);
    const API_BASE_URL = 'http://localhost:8081/api';

    useEffect(() => {
        cargarCarrito();
        const onStorage = () => cargarCarrito();
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const cargarCarrito = async () => {
        try {
            const token = getToken();
            if (token) {
                const resp = await fetch(`${API_BASE_URL}/carrito`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                if (resp.ok) {
                    let items = await resp.json();
                    const carritoLocal = JSON.parse(localStorage.getItem("carrito") || "[]");

                    try {
                        const faltantes = carritoLocal.filter(loc => {
                            const pid = loc.productoId;
                            const nom = loc.nombre;
                            return !items.some(srv => (
                                (srv.producto?.id && pid && srv.producto.id === pid) ||
                                (srv.producto?.nombre && nom && srv.producto.nombre === nom)
                            ));
                        });

                        for (const f of faltantes) {
                            if (f.productoId) {
                                await fetch(`${API_BASE_URL}/carrito`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ productoId: f.productoId, cantidad: Number(f.cantidad || 1) })
                                }).catch(() => {});
                            }
                        }

                        if (faltantes.length > 0) {
                            const respSync = await fetch(`${API_BASE_URL}/carrito`, {
                                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                            });
                            if (respSync.ok) {
                                items = await respSync.json();
                            }
                        }
                    } catch (e) { console.warn('sincronización carrito local->servidor falló', e); }

                    const mapped = items.map((it) => ({
                        id: it.id,
                        productoId: it.producto?.id || null,
                        nombre: it.producto?.nombre || (() => {
                            const loc = carritoLocal.find(x => x.productoId === it.producto?.id) || null;
                            return loc?.nombre || 'Producto';
                        })(),
                        precio: (() => {
                            const p = Number(it.precioUnitario || it.producto?.precio || 0);
                            if (p > 0) return p;
                            const loc = carritoLocal.find(x => x.productoId === it.producto?.id);
                            return Number(loc?.precio || 0);
                        })(),
                        cantidad: Number(it.cantidad || 1),
                        subtotal: (() => {
                            const s = Number(it.subtotal || 0);
                            if (s > 0) return s;
                            const price = Number(it.precioUnitario || it.producto?.precio || 0);
                            if (price > 0) return price * Number(it.cantidad || 1);
                            const loc = carritoLocal.find(x => x.productoId === it.producto?.id);
                            return Number(loc?.precio || 0) * Number(it.cantidad || 1);
                        })()
                    }));

                    const invalido = mapped.length > 0 && mapped.every(m => (m.precio || 0) === 0 || !m.nombre || m.nombre === 'Producto');
                    if (!invalido && mapped.length > 0) {
                        setProductosEnCarrito(mapped);
                        setEsLocal(false);
                    } else {
                        const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
                        const mappedLocal = carrito.map((it, idx) => ({
                            id: idx,
                            productoId: it.productoId || null,
                            nombre: it.nombre,
                            precio: Number(it.precio || 0),
                            cantidad: Number(it.cantidad || 1),
                            subtotal: Number(it.subtotal || (Number(it.precio || 0) * Number(it.cantidad || 1)))
                        }));
                        setProductosEnCarrito(mappedLocal);
                        setEsLocal(true);
                    }
                } else {
                    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
                    const mappedLocal = carrito.map((it, idx) => ({
                        id: idx,
                        productoId: it.productoId || null,
                        nombre: it.nombre,
                        precio: Number(it.precio || 0),
                        cantidad: Number(it.cantidad || 1),
                        subtotal: Number(it.subtotal || (Number(it.precio || 0) * Number(it.cantidad || 1)))
                    }));
                    setProductosEnCarrito(mappedLocal);
                    setEsLocal(true);
                }
            } else {
                const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
                const mappedLocal = carrito.map((it, idx) => ({
                    id: idx,
                    productoId: it.productoId || null,
                    nombre: it.nombre,
                    precio: Number(it.precio || 0),
                    cantidad: Number(it.cantidad || 1),
                    subtotal: Number(it.subtotal || (Number(it.precio || 0) * Number(it.cantidad || 1)))
                }));
                setProductosEnCarrito(mappedLocal);
                setEsLocal(true);
            }
        } catch {
            const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
            const mappedLocal = carrito.map((it, idx) => ({
                id: idx,
                productoId: it.productoId || null,
                nombre: it.nombre,
                precio: Number(it.precio || 0),
                cantidad: Number(it.cantidad || 1),
                subtotal: Number(it.subtotal || (Number(it.precio || 0) * Number(it.cantidad || 1)))
            }));
            setProductosEnCarrito(mappedLocal);
            setEsLocal(true);
        } finally {
            setLoading(false);
        }
    };

    const actualizarCantidad = async (index, accion) => {
        try {
            const item = productosEnCarrito[index];
            const token = getToken();
            if (!item) return;

            const nuevaCantidad = accion === 'mas' ? item.cantidad + 1 : item.cantidad - 1;
            if (nuevaCantidad < 1) return;

            if (!token || esLocal) {
                const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
                const idxLocal = carrito.findIndex(x => x.nombre === item.nombre);
                if (idxLocal === -1) return;
                carrito[idxLocal].cantidad = nuevaCantidad;
                carrito[idxLocal].subtotal = Number(carrito[idxLocal].precio || 0) * nuevaCantidad;
                localStorage.setItem("carrito", JSON.stringify(carrito));
                const mappedLocal = carrito.map((it, idx) => ({
                    id: idx,
                    productoId: it.productoId || null,
                    nombre: it.nombre,
                    precio: Number(it.precio || 0),
                    cantidad: Number(it.cantidad || 1),
                    subtotal: Number(it.subtotal || (Number(it.precio || 0) * Number(it.cantidad || 1)))
                }));
                setProductosEnCarrito(mappedLocal);
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('carritoActualizado'));
            } else {
                await fetch(`${API_BASE_URL}/carrito/${item.id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cantidad: nuevaCantidad })
                });
                await cargarCarrito();
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('carritoActualizado'));
            }
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
        }
    };

    const eliminarProducto = async (index) => {
        const producto = productosEnCarrito[index];
        if (!producto) return;
        if (!window.confirm(`¿Deseas eliminar "${producto.nombre}" del carrito?`)) return;
        try {
            const token = getToken();
            if (!token || esLocal) {
                const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
                const nuevo = carrito.filter(x => x.nombre !== producto.nombre);
                localStorage.setItem("carrito", JSON.stringify(nuevo));
                const mappedLocal = nuevo.map((it, idx) => ({
                    id: idx,
                    productoId: it.productoId || null,
                    nombre: it.nombre,
                    precio: Number(it.precio || 0),
                    cantidad: Number(it.cantidad || 1),
                    subtotal: Number(it.subtotal || (Number(it.precio || 0) * Number(it.cantidad || 1)))
                }));
                setProductosEnCarrito(mappedLocal);
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('carritoActualizado'));
            } else {
                await fetch(`${API_BASE_URL}/carrito/${producto.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                await cargarCarrito();
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('carritoActualizado'));
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    };

    const vaciarCarrito = async () => {
        if (!window.confirm('¿Estás seguro de vaciar todo el carrito?')) return;
        try {
            const token = getToken();
            if (!token || esLocal) {
                localStorage.removeItem('carrito');
                setProductosEnCarrito([]);
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('carritoActualizado'));
            } else {
                await fetch(`${API_BASE_URL}/carrito`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                localStorage.removeItem('carrito');
                await cargarCarrito();
                setProductosEnCarrito([]);
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('carritoActualizado'));
            }
        } catch (error) {
            console.error('Error al vaciar carrito:', error);
        }
    };

    const calcularSubtotalNeto = () => {
        return productosEnCarrito.reduce((sum, p) => sum + Number(p.subtotal || 0), 0);
    };

    const calcularIva = () => {
        const neto = calcularSubtotalNeto();
        return Math.round(neto * 0.19);
    };

    const calcularTotalConIva = () => {
        const neto = calcularSubtotalNeto();
        const iva = calcularIva();
        return neto + iva;
    };

    const procederPago = () => {
        if (productosEnCarrito.length === 0) {
            alert("⚠️ Tu carrito está vacío. Agrega productos antes de proceder al pago.");
            return;
        }

        // Guardar el carrito para el proceso de pago
        const carritoParaPago = {
            productos: productosEnCarrito,
            neto: calcularSubtotalNeto(),
            iva: calcularIva(),
            total: calcularTotalConIva(),
            fecha: new Date().toISOString()
        };

        localStorage.setItem('carritoParaPago', JSON.stringify(carritoParaPago));
        
        // Redirigir al proceso de pago REAL
        navigate("/proceso-pago");
    };

    if (loading) {
        return (
            <>
                <div className="page-wrapper">
                <div className="container-fluid p-0">
                    <Navbar />
                </div>
                <div className="carrito-content page-content">
                    <div className="text-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-3">Cargando carrito...</p>
                    </div>
                </div>
                <Footer />
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

                <div className="carrito-content page-content">
                    <h1 className="carrito-title">
                        <i className="bi bi-cart3"></i> Tu Carrito de Compras
                    </h1>

                    {productosEnCarrito.length === 0 ? (
                        <div className="carrito-vacio">
                            <div className="empty-icon">
                                <i className="bi bi-cart-x"></i>
                            </div>
                            <h3>Tu carrito está vacío</h3>
                            <p>Agrega algunos deliciosos chocolates, frutos secos y más para comenzar tu compra.</p>
                            <button 
                                onClick={() => navigate('/catalogo')} 
                                className="btn-seguir-comprando"
                            >
                                <i className="bi bi-box-seam"></i> Ver Productos
                            </button>
                        </div>
                    ) : (
                        <div className="carrito-lleno">
                            {/* Resumen rápido */}
                            <div className="carrito-resumen">
                                <div className="resumen-item">
                                    <i className="bi bi-box"></i>
                                    <div>
                                        <strong>{productosEnCarrito.length}</strong>
                                        <span>Productos</span>
                                    </div>
                                </div>
                                <div className="resumen-item">
                                    <i className="bi bi-basket"></i>
                                    <div>
                                        <strong>{productosEnCarrito.reduce((sum, p) => sum + p.cantidad, 0)}</strong>
                                        <span>Unidades</span>
                                    </div>
                                </div>
                                <div className="resumen-item total">
                                    <i className="bi bi-cash-coin"></i>
                                    <div>
                                        <strong>${calcularTotalConIva().toLocaleString('es-CL')}</strong>
                                        <span>Total</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de productos */}
                            <div className="table-responsive">
                                <table className="table carrito-table">
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Precio</th>
                                            <th>Cantidad</th>
                                            <th>Subtotal</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosEnCarrito.map((producto, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <strong className="producto-nombre">
                                                        {producto.nombre}
                                                    </strong>
                                                </td>
                                                <td className="precio-cell">
                                                    ${producto.precio.toLocaleString('es-CL')}
                                                </td>
                                                <td>
                                                    <div className="cantidad-controles">
                                                        <button
                                                            className="btn-cantidad"
                                                            onClick={() => actualizarCantidad(index, 'menos')}
                                                            disabled={producto.cantidad <= 1}
                                                        >
                                                            <i className="bi bi-dash"></i>
                                                        </button>
                                                        <span className="cantidad-display">
                                                            {producto.cantidad}
                                                        </span>
                                                        <button
                                                            className="btn-cantidad"
                                                            onClick={() => actualizarCantidad(index, 'mas')}
                                                        >
                                                            <i className="bi bi-plus"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="subtotal-cell">
                                                    ${producto.subtotal.toLocaleString('es-CL')}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-eliminar"
                                                        onClick={() => eliminarProducto(index)}
                                                        title="Eliminar producto"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Resumen de pago */}
                            <div className="pago-section">
                                <div className="pago-info">
                                    <h4>Resumen de Compra</h4>
                                    <div className="pago-detalle">
                                        <span>Subtotal:</span>
                                        <span>${calcularSubtotalNeto().toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="pago-detalle">
                                        <span>IVA (19%):</span>
                                        <span>${calcularIva().toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="pago-detalle">
                                        <span>Envío:</span>
                                        <span className="text-success">Gratis</span>
                                    </div>
                                    <hr />
                                    <div className="pago-total">
                                        <span>Total:</span>
                                        <span>${calcularTotalConIva().toLocaleString('es-CL')}</span>
                                    </div>
                                </div>

                                <div className="acciones-carrito">
                                    <button 
                                        onClick={vaciarCarrito}
                                        className="btn-vaciar"
                                    >
                                        <i className="bi bi-trash"></i> Vaciar Carrito
                                    </button>
                                    <button 
                                        onClick={() => navigate('/catalogo')}
                                        className="btn-seguir-comprando"
                                    >
                                        <i className="bi bi-arrow-left"></i> Seguir Comprando
                                    </button>
                                    <button 
                                        className="btn-pagar" 
                                        onClick={procederPago}
                                    >
                                        <i className="bi bi-credit-card"></i> Proceder al Pago
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Footer />
            </div>
        </>
    );
}
