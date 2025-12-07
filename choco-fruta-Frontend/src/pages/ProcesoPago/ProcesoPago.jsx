import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import { obtenerUsuario, getToken, setToken } from '../../utils/session';
import './ProcesoPago.css';

export function ProcesoPago() {
    const navigate = useNavigate();
    const usuario = obtenerUsuario();
    
    const regiones = useMemo(() => ({
        "XV de Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
        "I de Tarapacá": ["Alto Hospicio", "Iquique", "Huara", "Camiña", "Colchane", "Pica", "Pozo Almonte"],
        "II de Antofagasta": ["Tocopilla", "María Elena", "Calama", "Ollagüe", "San Pedro de Atacama", "Antofagasta", "Mejillones", "Sierra Gorda", "Taltal"],
        "III de Atacama": ["Chañaral", "Diego de Almagro", "Copiapó", "Caldera", "Tierra Amarilla", "Vallenar", "Freirina", "Huasco", "Alto del Carmen"],
        "IV de Coquimbo": ["La Serena","La Higuera","Coquimbo","Andacollo","Vicuña","Paihuano","Ovalle","Río Hurtado","Monte Patria","Combarbalá","Punitaqui","Illapel","Salamanca","Los Vilos","Canela"],
        "V de Valparaíso": ["La Ligua","Petorca","Cabildo","Zapallar","Papudo","Los Andes","San Esteban","Calle Larga","Rinconada","San Felipe","Putaendo","Santa María","Panquehue","Llaillay","Catemu","Quillota","La Cruz","Calera","Nogales","Hijuelas","Limache","Olmué","Valparaíso","Viña del Mar","Quintero","Puchuncaví","Quilpué","Villa Alemana","Casablanca","Concón","Juan Fernández","San Antonio","Cartagena","El Tabo","El Quisco","Algarrobo","Santo Domingo","Isla de Pascua"],
        "VI del Libertador General Bernardo O'Higgins": ["Rancagua","Graneros","Mostazal","Codegua","Machalí","Olivar","Requinoa","Rengo","Malloa","Quinta de Tilcoco","San Vicente","Pichidegua","Peumo","Coltauco","Coinco","Doñihue","Las Cabras","San Fernando","Chépica","Chimbarongo","Lolol","Nancagua","Palmilla","Peralillo","Placilla","Pumanque","Santa Cruz","Pichilemu","La Estrella","Litueche","Marchihue","Navidad","Paredones"],
        "VII del Maule": ["Curicó","Teno","Romeral","Molina","Sagrada Familia","Hualañé","Licantén","Vichuquén","Rauco","Talca","Pelarco","Río Claro","San Clemente","Maule","San Rafael","Empedrado","Pencahue","Constitución","Curepto","Linares","Yerbas Buenas","Colbún","Longaví","Parral","Retiro","Villa Alegre","San Javier","Cauquenes","Pelluhue","Chanco"],
        "VIII del Biobío": ["Chillán","San Carlos","Ñiquén","San Fabián","Coihueco","Pinto","San Ignacio","El Carmen","Yungay","Pemuco","Bulnes","Quillón","Ránquil","Portezuelo","Coelemu","Treguaco","Cobquecura","Quirihue","Ninhue","San Nicolás","Chillán Viejo","Los Angeles","Antuco","Cabrero","Laja","Mulchén","Nacimiento","Negrete","Quilaco","Quilleco","San Rosendo","Santa Bárbara","Tucapel","Yumbel","Chiguayante","Concepción","Coronel","Florida","Hualpén","Hualqui","Lota","Penco","San Pedro de la Paz","Talcahuano","Tomé","Lebu","Arauco","Curanilahue","Los Alamos","Cañete","Contulmo","Tirua"],
        "IX de la Araucanía": ["Angol","Renaico","Collipulli","Lonquimay","Curacautín","Ercilla","Victoria","Traiguén","Lumaco","Purén","Los Sauces","Temuco","Lautaro","Perquenco","Vilcún","Cholchol","Cunco","Melipeuco","Curarrehue","Pucón","Villarrica","Freire","Pitrufquén","Gorbea","Loncoche","Toltén","Teodoro Schmidt","Saavedra","Carahue","Nueva Imperial","Galvarino","Padre las Casas"],
        "XIV de los Ríos": ["Valdivia","Mariquina","Lanco","Máfil","Corral","Los Lagos","Paillaco","Panguipulli","La Unión","Futrono","Lago Ranco","Río Bueno"],
        "X de los Lagos": ["Osorno","San Pablo","Puyehue","Puerto Octay","Purranque","Río Negro","San Juan de la Costa","Puerto Montt","Puerto Varas","Cochamó","Calbuco","Maullín","Los Muermos","Fresia","Llanquihue","Frutillar","Castro","Ancud","Quemchi","Dalcahue","Curaco de Vélez","Quinchao","Puqueldón","Chonchi","Queilén","Quellón","Chaitén","Hualaihué","Futaleufú","Palena"],
        "XI Aysén": ["Coyhaique","Lago Verde","Aysén","Cisnes","Guaitecas","Chile Chico","Río Ibáñez","Cochrane","O'Higgins","Tortel"],
        "XII de Magallanes y Antártica Chilena": ["Natales","Torres del Paine","Punta Arenas","Río Verde","Laguna Blanca","San Gregorio","Porvenir","Primavera","Timaukel","Cabo de Hornos","Antártica"],
        "Metropolitana de Santiago": ["Santiago","Independencia","Conchalí","Huechuraba","Recoleta","Providencia","Vitacura","Lo Barnechea","Las Condes","Ñuñoa","La Reina","Macul","Peñalolén","La Florida","San Joaquín","La Granja","La Pintana","San Ramón","San Miguel","La Cisterna","El Bosque","Pedro Aguirre Cerda","Lo Espejo","Estación Central","Cerrillos","Maipú","Quinta Normal","Lo Prado","Pudahuel","Cerro Navia","Renca","Quilicura","Colina","Lampa","Tiltil","Puente Alto","San José de Maipo","Pirque","San Bernardo","Buin","Paine","Melipilla","María Pinto","Curacaví","Alhué","San Pedro","Talagante","Peñaflor","Isla de Maipo","El Monte","Padre Hurtado"]
    }), []);
    
    const [carritoData, setCarritoData] = useState(null);
    const [comunas, setComunas] = useState([]);
    const [formData, setFormData] = useState({
        nombreCompleto: usuario?.nombre || '',
        email: usuario?.email || '',
        telefono: '',
        direccion: '',
        comuna: '',
        region: '',
        metodoPago: '',
        notas: ''
    });
    
    const [errores, setErrores] = useState({});
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        const carrito = JSON.parse(localStorage.getItem('carritoParaPago'));
        
        if (!carrito || carrito.productos.length === 0) {
            alert('⚠️ No hay productos en el carrito');
            navigate('/carrito');
            return;
        }
        
        // Pre-cargar datos de envío si existen
        setFormData(prev => ({
            ...prev,
            nombreCompleto: carrito.nombreCompleto || prev.nombreCompleto,
            email: carrito.email || prev.email,
            telefono: carrito.telefono || prev.telefono,
            direccion: carrito.direccion || prev.direccion,
            region: carrito.region || prev.region,
            comuna: carrito.comuna || prev.comuna,
            metodoPago: carrito.metodoPago || prev.metodoPago,
            notas: carrito.notas || prev.notas
        }));

        if (carrito.region && regiones[carrito.region]) {
            setComunas(regiones[carrito.region]);
        }

        setCarritoData(carrito);
    }, [navigate, regiones]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        let nextForm = null;
        if (name === 'region') {
            setComunas(regiones[value] || []);
            nextForm = {
                ...formData,
                region: value,
                comuna: ''
            };
        } else {
            nextForm = {
                ...formData,
                [name]: value
            };
        }
        setFormData(nextForm);

        // Persistir en carritoParaPago para usar luego en la boleta/confirmación
        try {
            const cp = JSON.parse(localStorage.getItem('carritoParaPago') || '{}');
            const actualizado = { ...cp, ...nextForm };
            localStorage.setItem('carritoParaPago', JSON.stringify(actualizado));
        } catch (e) { console.warn('persistencia carritoParaPago falló', e); }

        if (errores[name]) {
            setErrores(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.nombreCompleto.trim()) {
            nuevosErrores.nombreCompleto = 'El nombre es obligatorio';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            nuevosErrores.email = 'El email es obligatorio';
        } else if (!emailRegex.test(formData.email)) {
            nuevosErrores.email = 'Email inválido';
        }

        if (!formData.telefono.trim()) {
            nuevosErrores.telefono = 'El teléfono es obligatorio';
        }

        if (!formData.direccion.trim()) {
            nuevosErrores.direccion = 'La dirección es obligatoria';
        }

        if (!formData.comuna) {
            nuevosErrores.comuna = 'Selecciona una comuna';
        }

        if (!formData.region) {
            nuevosErrores.region = 'Selecciona una región';
        }

        if (!formData.metodoPago) {
            nuevosErrores.metodoPago = 'Selecciona un método de pago';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            alert('⚠️ Por favor, completa todos los campos obligatorios');
            return;
        }

        setProcesando(true);

        try {
            const token = getToken();
            if (!token) {
                alert('Debes iniciar sesión para confirmar el pedido');
                navigate('/login');
                return;
            }

            const API_BASE_URL = 'http://localhost:8081/api';

            try {
                const respCar = await fetch(`${API_BASE_URL}/carrito`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });
                let itemsServ = [];
                if (respCar.ok) {
                    try {
                        const dataServ = await respCar.json();
                        itemsServ = Array.isArray(dataServ) ? dataServ : [];
                    } catch {
                        itemsServ = [];
                    }
                }

                const productosLocal = Array.isArray(carritoData?.productos) ? carritoData.productos : [];
                let catalogo = [];
                if (productosLocal.some(p => !p.productoId)) {
                    try {
                        const respProd = await fetch(`${API_BASE_URL}/productos`, { headers: { 'Accept': 'application/json' } });
                        if (respProd.ok) { catalogo = await respProd.json(); }
                    } catch (e) { console.warn('cargar productos catálogo falló', e); }
                }

                const mapLocal = new Map();
                for (const it of productosLocal) {
                    const cant = Number(it.cantidad || 1);
                    let pid = it.productoId;
                    if (!pid && Array.isArray(catalogo) && catalogo.length) {
                        const found = catalogo.find(p => String(p.nombre || '').toLowerCase() === String(it.nombre || '').toLowerCase());
                        pid = found?.id || null;
                    }
                    if (pid) {
                        mapLocal.set(pid, (mapLocal.get(pid) || 0) + (cant > 0 ? cant : 0));
                    }
                }

                const mapServ = new Map();
                const listServ = Array.isArray(itemsServ) ? itemsServ : [];
                for (const si of listServ) {
                    const pid = si?.producto?.id;
                    const cant = Number(si?.cantidad || 0);
                    if (pid) { mapServ.set(pid, (mapServ.get(pid) || 0) + (cant > 0 ? cant : 0)); }
                }

                const mismatch = (() => {
                    if (mapLocal.size === 0) return false;
                    if (mapLocal.size !== mapServ.size) return true;
                    for (const [pid, cant] of mapLocal.entries()) {
                        if ((mapServ.get(pid) || 0) !== cant) return true;
                    }
                    return false;
                })();

                if (mapLocal.size > 0 && ((listServ.length === 0) || mismatch)) {
                    try {
                        await fetch(`${API_BASE_URL}/carrito`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
                    } catch { /* noop */ }
                    for (const [pid, cant] of mapLocal.entries()) {
                        await fetch(`${API_BASE_URL}/carrito`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ productoId: pid, cantidad: cant })
                        }).catch(() => {});
                    }
                    const recheck = await fetch(`${API_BASE_URL}/carrito`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json'
                        }
                    });
                    if (recheck.ok) {
                        try {
                            const dataRe = await recheck.json();
                            itemsServ = Array.isArray(dataRe) ? dataRe : [];
                        } catch { itemsServ = []; }
                    }
                    if (!Array.isArray(itemsServ) || itemsServ.length === 0) { throw new Error('Carrito vacío en servidor'); }
                }
            } catch (e) { console.warn('sync previo al checkout falló', e); }

            const doCheckout = async (tok) => {
                const payload = {
                    direccion: formData.direccion,
                    region: formData.region,
                    comuna: formData.comuna,
                    metodoPago: formData.metodoPago
                };
                return fetch(`${API_BASE_URL}/boletas`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tok}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
            };

            let resp = await doCheckout(token);

            if (resp.status === 401 || resp.status === 403) {
                try {
                    const r = await fetch(`http://localhost:8081/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                    });
                    if (r.ok) {
                        const data = await r.json();
                        if (data?.token) {
                            setToken(data.token);
                            resp = await doCheckout(data.token);
                        }
                    }
                } catch (e) { console.warn('refresh token falló', e); }
            }

            if (!resp.ok) {
                const errText = await resp.text().catch(() => '');
                throw new Error(errText || 'Error al generar la boleta');
            }

            const boleta = await resp.json();

            const detallesConNombre = Array.isArray(boleta.detalles) && boleta.detalles.length
                ? boleta.detalles
                : (Array.isArray(carritoData?.productos) ? carritoData.productos.map(p => ({ producto: { nombre: p.nombre }, cantidad: p.cantidad, subtotal: p.subtotal })) : []);

            const productosPlano = Array.isArray(carritoData?.productos)
                ? carritoData.productos.map(p => ({ nombre: p.nombre, cantidad: p.cantidad, subtotal: p.subtotal }))
                : [];

            const boletaConDatos = {
                ...boleta,
                cliente: usuario?.username || '',
                email: formData.email || usuario?.email || '',
                direccion: formData.direccion || '',
                metodoPago: formData.metodoPago || 'online',
                detalles: detallesConNombre,
                productos: productosPlano
            };

            try { localStorage.setItem('ultimaBoleta', JSON.stringify(boletaConDatos)); } catch (e) { console.warn('no se pudo guardar ultimaBoleta', e); }
            localStorage.removeItem('carrito');
            window.dispatchEvent(new Event('storage'));

            alert(`✅ Compra confirmada. Número de boleta: ${boleta.numero}`);

            navigate(`/seguimiento-pedido?numero=${boleta.numero}`);
        } catch (error) {
            alert(`❌ Error al procesar el pago. ${error?.message ? error.message : 'Intenta nuevamente.'}`);
        } finally {
            setProcesando(false);
        }
    };

    if (!carritoData) {
        return (
            <>
                <div className="page-wrapper">
                <div className="container-fluid p-0">
                    <Navbar />
                </div>
                <div className="container mt-5 page-content">
                    <div className="text-center">
                        <div className="spinner-border text-primary"></div>
                        <p className="mt-3">Cargando información...</p>
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

                <div className="proceso-pago-content page-content">
                    <h1 className="pago-title">
                        <i className="bi bi-credit-card"></i> Proceso de Pago
                    </h1>

                    <div className="pago-container">
                        {/* Formulario de pago */}
                        <div className="formulario-pago">
                            <form onSubmit={handleSubmit}>
                                {/* Información Personal */}
                                <div className="seccion-form">
                                    <h3><i className="bi bi-person"></i> Información Personal</h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="nombreCompleto">
                                                Nombre Completo <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="nombreCompleto"
                                                name="nombreCompleto"
                                                value={formData.nombreCompleto}
                                                onChange={handleChange}
                                                className={`form-control ${errores.nombreCompleto ? 'is-invalid' : ''}`}
                                                placeholder="Juan Pérez"
                                            />
                                            {errores.nombreCompleto && (
                                                <small className="error-text">{errores.nombreCompleto}</small>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="email">
                                                Email <span className="required">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                                                placeholder="correo@ejemplo.com"
                                            />
                                            {errores.email && (
                                                <small className="error-text">{errores.email}</small>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="telefono">
                                            Teléfono <span className="required">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            id="telefono"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                                            placeholder="+56 9 1234 5678"
                                        />
                                        {errores.telefono && (
                                            <small className="error-text">{errores.telefono}</small>
                                        )}
                                    </div>
                                </div>

                                {/* Dirección de Envío */}
                                <div className="seccion-form">
                                    <h3><i className="bi bi-geo-alt"></i> Dirección de Envío</h3>
                                    
                                    <div className="form-group">
                                        <label htmlFor="direccion">
                                            Dirección <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="direccion"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            className={`form-control ${errores.direccion ? 'is-invalid' : ''}`}
                                            placeholder="Av. Principal 123, Depto 456"
                                        />
                                        {errores.direccion && (
                                            <small className="error-text">{errores.direccion}</small>
                                        )}
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="region">
                                                Región <span className="required">*</span>
                                            </label>
                                            <select
                                                id="region"
                                                name="region"
                                                value={formData.region}
                                                onChange={handleChange}
                                                className={`form-control ${errores.region ? 'is-invalid' : ''}`}
                                            >
                                                <option value="">Seleccione región</option>
                                                {Object.keys(regiones).map(region => (
                                                    <option key={region} value={region}>{region}</option>
                                                ))}
                                            </select>
                                            {errores.region && (
                                                <small className="error-text">{errores.region}</small>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="comuna">
                                                Comuna <span className="required">*</span>
                                            </label>
                                            <select
                                                id="comuna"
                                                name="comuna"
                                                value={formData.comuna}
                                                onChange={handleChange}
                                                className={`form-control ${errores.comuna ? 'is-invalid' : ''}`}
                                                disabled={!formData.region}
                                            >
                                                <option value="">
                                                    {formData.region ? 'Seleccione comuna' : 'Primero seleccione región'}
                                                </option>
                                                {comunas.map(comuna => (
                                                    <option key={comuna} value={comuna}>{comuna}</option>
                                                ))}
                                            </select>
                                            {errores.comuna && (
                                                <small className="error-text">{errores.comuna}</small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Método de Pago */}
                                <div className="seccion-form">
                                    <h3><i className="bi bi-credit-card"></i> Método de Pago</h3>
                                    
                                    <div className="metodos-pago">
                                        <label className={`metodo-item ${formData.metodoPago === 'transferencia' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="metodoPago"
                                                value="transferencia"
                                                checked={formData.metodoPago === 'transferencia'}
                                                onChange={handleChange}
                                            />
                                            <div className="metodo-info">
                                                <i className="bi bi-bank"></i>
                                                <span>Transferencia Bancaria</span>
                                            </div>
                                        </label>

                                        <label className={`metodo-item ${formData.metodoPago === 'webpay' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="metodoPago"
                                                value="webpay"
                                                checked={formData.metodoPago === 'webpay'}
                                                onChange={handleChange}
                                            />
                                            <div className="metodo-info">
                                                <i className="bi bi-credit-card"></i>
                                                <span>WebPay (Débito/Crédito)</span>
                                            </div>
                                        </label>

                                        <label className={`metodo-item ${formData.metodoPago === 'efectivo' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="metodoPago"
                                                value="efectivo"
                                                checked={formData.metodoPago === 'efectivo'}
                                                onChange={handleChange}
                                            />
                                            <div className="metodo-info">
                                                <i className="bi bi-cash"></i>
                                                <span>Efectivo contra entrega</span>
                                            </div>
                                        </label>
                                    </div>
                                    {errores.metodoPago && (
                                        <small className="error-text">{errores.metodoPago}</small>
                                    )}
                                </div>

                                {/* Notas adicionales */}
                                <div className="seccion-form">
                                    <h3><i className="bi bi-chat-left-text"></i> Notas Adicionales (Opcional)</h3>
                                    <textarea
                                        name="notas"
                                        value={formData.notas}
                                        onChange={handleChange}
                                        className="form-control"
                                        rows="3"
                                        placeholder="¿Alguna instrucción especial para la entrega?"
                                    ></textarea>
                                </div>

                                {/* Botones */}
                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/carrito')}
                                        disabled={procesando}
                                        className="btn-volver"
                                    >
                                        <i className="bi bi-arrow-left"></i> Volver al Carrito
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={procesando}
                                        className="btn-pagar"
                                    >
                                        {procesando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle"></i> Confirmar Pedido
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Resumen del Pedido */}
                        <div className="resumen-pago">
                            <h3>Resumen del Pedido</h3>
                            
                            <div className="productos-resumen">
                                {carritoData.productos.map((prod, index) => (
                                    <div key={index} className="producto-item">
                                        <div>
                                            <div className="producto-nombre">{prod.nombre}</div>
                                            <div className="cantidad">x{prod.cantidad}</div>
                                        </div>
                                        <div className="producto-precio">
                                            ${prod.subtotal.toLocaleString('es-CL')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="totales">
                                {(() => {
                                    const neto = (carritoData.neto ?? null) !== null
                                        ? Number(carritoData.neto || 0)
                                        : carritoData.productos.reduce((sum, p) => sum + Number(p.subtotal || 0), 0);
                                    const iva = (carritoData.iva ?? null) !== null
                                        ? Number(carritoData.iva || 0)
                                        : Math.round(neto * 0.19);
                                    const total = (carritoData.total ?? null) !== null
                                        ? Number(carritoData.total || 0)
                                        : (neto + iva);
                                    return (
                                        <>
                                            <div className="total-item">
                                                <span>Subtotal (Neto):</span>
                                                <span>${neto.toLocaleString('es-CL')}</span>
                                            </div>
                                            <div className="total-item">
                                                <span>IVA (19%):</span>
                                                <span>${iva.toLocaleString('es-CL')}</span>
                                            </div>
                                            <div className="total-item">
                                                <span>Envío:</span>
                                                <span style={{ color: '#7d9b6e' }}>Gratis</span>
                                            </div>
                                            <div className="total-final">
                                                <span>Total:</span>
                                                <span>${total.toLocaleString('es-CL')}</span>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <div className="info-adicional">
                                <p>
                                    <i className="bi bi-shield-check"></i>
                                    Compra 100% segura
                                </p>
                                <p>
                                    <i className="bi bi-truck"></i>
                                    Envío gratis en toda la región
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
