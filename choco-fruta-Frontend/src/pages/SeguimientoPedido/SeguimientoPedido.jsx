import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import { getToken, esSuperAdmin } from '../../utils/session';
import './SeguimientoPedido.css';

export function SeguimientoPedido() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const numeroPedido = searchParams.get('numero');
    const usuarioParam = searchParams.get('usuario');
    const [pedido, setPedido] = useState(null);
    const [resumenCompra, setResumenCompra] = useState('');
    const autoPrint = searchParams.get('print') === 'true';

    useEffect(() => {
        const cargar = async () => {
            const token = getToken();
            if (!numeroPedido) { setPedido(null); return; }

            try {
                const lb = JSON.parse(localStorage.getItem('ultimaBoleta') || 'null');
                const isAdmin = esSuperAdmin();
                if (lb && String(lb.numero) === String(numeroPedido) && !isAdmin) {
                    const cp = JSON.parse(localStorage.getItem('carritoParaPago') || 'null');
                    const detallesFuente = Array.isArray(lb.detalles) && lb.detalles.length
                        ? lb.detalles
                        : (Array.isArray(lb.productos)
                            ? lb.productos.map(p => ({ producto: { nombre: p.nombre }, cantidad: p.cantidad, subtotal: p.subtotal }))
                            : []);
                    const netoCalc = detallesFuente.reduce((s, d) => s + Number(d.subtotal || 0), 0);
                    const ivaCalc = Math.round(netoCalc * 0.19);
                    const totalCalc = netoCalc + ivaCalc;
                    const pedidoTransformLocal = {
                        numero: lb.numero,
                        fecha: lb.fecha,
                        email: lb.email || lb?.usuario?.email || (cp?.email || ''),
                        direccion: lb.direccion || (cp?.direccion || ''),
                        metodoPago: lb.metodoPago || (cp?.metodoPago || 'online'),
                        neto: netoCalc,
                        iva: ivaCalc,
                        total: totalCalc,
                        cliente: lb?.usuario?.username || lb?.cliente || cp?.nombreCompleto || '',
                        productos: detallesFuente.map(d => ({
                            nombre: (d.producto?.nombre && d.producto?.nombre.trim().length > 0)
                                ? d.producto.nombre
                                : (`Producto #${d.producto?.id ?? 's/n'}`),
                            cantidad: d.cantidad,
                            subtotal: d.subtotal
                        }))
                    };
                    setPedido(pedidoTransformLocal);
                    const productosResumen = (pedidoTransformLocal.productos?.length ? pedidoTransformLocal.productos : (cp?.productos || []))
                        .map(p => `${p.nombre} (x${p.cantidad})`)
                        .join(', ');
                    setResumenCompra(productosResumen);
                    return;
                }
            } catch (e) { console.warn('leer ultimaBoleta falló', e); }

            if (!token) {
                setPedido(null);
                return;
            }
            try {
    const API_BASE_URL = 'http://localhost:8081/api';
                let boletas = [];

                if (esSuperAdmin()) {
                    const rAdmin = await fetch(`${API_BASE_URL}/admin/compras`, {
                        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                    });
                    if (rAdmin.ok) {
                        boletas = await rAdmin.json();
                    }
                } else {
                    const rUser = await fetch(`${API_BASE_URL}/boletas/historial`, {
                        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                    });
                    if (!rUser.ok) {
                        setPedido(null);
                        return;
                    }
                    boletas = await rUser.json();
                }

                const b = boletas.find(x => String(x.numero) === String(numeroPedido));
                if (!b) { setPedido(null); return; }
                const detallesFromBackend = Array.isArray(b.detalles) && b.detalles.length > 0;
                const detallesFuente = detallesFromBackend ? b.detalles : [];
                const netoFromDetalles = detallesFuente.reduce((s, d) => s + Number(d.subtotal || 0), 0);
                const netoCalc = netoFromDetalles > 0 ? netoFromDetalles : (b.neto ?? 0);
                const ivaCalc = Math.round(netoCalc * 0.19);
                const totalCalc = netoCalc + ivaCalc;
                const pedidoTransform = {
                    numero: b.numero,
                    fecha: b.fecha,
                    email: b.usuario?.email || '',
                    direccion: b.direccion || '',
                    metodoPago: b.metodoPago || 'online',
                    neto: netoCalc,
                    iva: ivaCalc,
                    total: totalCalc,
                    cliente: b.usuario?.username || '',
                    productos: detallesFuente.map(d => ({
                        nombre: (d.producto?.nombre && d.producto?.nombre.trim().length > 0)
                            ? d.producto.nombre
                            : (`Producto #${d.producto?.id ?? 's/n'}`),
                        cantidad: d.cantidad,
                        subtotal: d.subtotal
                    }))
                };
                if (!pedidoTransform.direccion) {
                    try {
                        const lb2 = JSON.parse(localStorage.getItem('ultimaBoleta') || 'null');
                        const cp2 = JSON.parse(localStorage.getItem('carritoParaPago') || 'null');
                        if (lb2 && String(lb2.numero) === String(numeroPedido)) {
                            pedidoTransform.direccion = lb2.direccion || (cp2?.direccion || '');
                        }
                    } catch (e) { console.warn('completar direccion desde local falló', e); }
                }
                setPedido(pedidoTransform);
                const productosResumen = (pedidoTransform.productos || [])
                    .map(p => `${p.nombre} (x${p.cantidad})`)
                    .join(', ');
                setResumenCompra(productosResumen);
                if (autoPrint) {
                    setTimeout(() => window.print(), 300);
                }
            } catch {
                setPedido(null);
            }
        };
        if (numeroPedido) cargar();
    }, [numeroPedido, usuarioParam, autoPrint]);

    if (!pedido) {
        return (
            <>
                <div className="page-wrapper">
                <div className="container-fluid p-0">
                    <Navbar />
                </div>
                <div className="container mt-5 page-content">
                    <div className="alert alert-warning">
                        No se encontró el pedido con número: {numeroPedido}
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

                <div className="seguimiento-content page-content">
                    <h1 className="seguimiento-title">
                        ✅ ¡Pedido Confirmado!
                    </h1>

                    <div className="confirmacion-card">
                        <div className="icono-exito">
                            <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <h2>Gracias por tu compra, {pedido.cliente}</h2>
                        <p>Tu pedido ha sido recibido y está siendo procesado</p>
                        
                        <div className="numero-pedido">
                            <strong>Número de pedido:</strong>
                            <span className="numero">{pedido.numero}</span>
                        </div>

                        <div className="detalles-pedido">
                            <div className="detalle-item">
                                <i className="bi bi-calendar"></i>
                                <div>
                                    <strong>Fecha:</strong>
                                    <span>{new Date(pedido.fecha).toLocaleDateString('es-CL')}</span>
                                </div>
                            </div>

                            <div className="detalle-item">
                                <i className="bi bi-envelope"></i>
                                <div>
                                    <strong>Email:</strong>
                                    <span>{pedido.email}</span>
                                </div>
                            </div>

                            <div className="detalle-item">
                                <i className="bi bi-geo-alt"></i>
                                <div>
                                    <strong>Dirección:</strong>
                                    <span>{pedido.direccion}</span>
                                </div>
                            </div>

                            <div className="detalle-item">
                                <i className="bi bi-credit-card"></i>
                                <div>
                                    <strong>Método de pago:</strong>
                                    <span>{pedido.metodoPago}</span>
                                </div>
                            </div>

                            <div className="detalle-item">
                                <i className="bi bi-receipt"></i>
                                <div>
                                    <strong>Subtotal (Neto):</strong>
                                    <span>${(pedido.neto ?? 0).toLocaleString('es-CL')}</span>
                                </div>
                            </div>

                            <div className="detalle-item">
                                <i className="bi bi-percent"></i>
                                <div>
                                    <strong>IVA (19%):</strong>
                                    <span>${(pedido.iva ?? 0).toLocaleString('es-CL')}</span>
                                </div>
                            </div>

                            <div className="detalle-item">
                                <i className="bi bi-cash-coin"></i>
                                <div>
                                    <strong>Total:</strong>
                                    <span className="total">${pedido.total.toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="productos-pedido">
                            <h3>📦 Productos Comprados</h3>
                            {resumenCompra && (
                                <div className="resumen-compra">
                                    Se compró: {resumenCompra}
                                </div>
                            )}
                            {pedido.productos.map((prod, index) => (
                                <div key={index} className="producto-pedido">
                                    <span>{prod.nombre} x{prod.cantidad}</span>
                                    <span>${prod.subtotal.toLocaleString('es-CL')}</span>
                                </div>
                            ))}
                        </div>

                        <div className="acciones">
                            <button onClick={() => window.print()} className="btn-imprimir">
                                <i className="bi bi-printer"></i> Imprimir Comprobante
                            </button>
                            <button onClick={() => { try { localStorage.removeItem('carritoParaPago'); } catch { void 0; } navigate('/'); }} className="btn-inicio">
                                <i className="bi bi-house"></i> Volver al Inicio
                            </button>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
