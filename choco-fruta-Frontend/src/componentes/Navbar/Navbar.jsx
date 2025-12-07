import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { obtenerUsuario, cerrarSesion, esAdmin, esSuperAdmin, getToken, setToken, guardarUsuario } from '../../utils/session';
import './Navbar.css';

export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [loggedIn, setLoggedIn] = useState(!!getToken());
    const isAdmin = esAdmin();
    const isAdminRole = esSuperAdmin();
    
    const [cantidadCarrito, setCantidadCarrito] = useState(0);
    const [usuarioNav, setUsuarioNav] = useState(obtenerUsuario());

    const perfilFetchState = useRef({ inFlight: false, lastTs: 0 });

    useEffect(() => {
        const controller = new AbortController();
        const actualizarCarrito = async () => {
            
            const API_BASE_URL = 'http://localhost:8081/api';

            let totalLocal = 0;
            try {
                const raw = localStorage.getItem("carrito");
                const carrito = JSON.parse(raw || "[]");
                if (Array.isArray(carrito)) {
                    totalLocal = carrito.reduce((sum, item) => {
                        const c = Number(item?.cantidad || 0);
                        return sum + (c > 0 ? c : 0);
                    }, 0);
                }
            } catch (e) { console.warn('lectura de carrito local falló', e); }
            setCantidadCarrito(totalLocal);

            // Se evita override con servidor para mantener consistencia inmediata del badge
        };

        const actualizarUsuario = async () => {
            const u = obtenerUsuario();
            setUsuarioNav(u);
            const nombreVacio = !u || !u.nombre || (typeof u.nombre === 'string' && u.nombre.trim() === '');
            if (nombreVacio) {
                try {
                    const now = Date.now();
                    if (perfilFetchState.current.inFlight || (now - perfilFetchState.current.lastTs) < 3000) {
                        return;
                    }
                    perfilFetchState.current.inFlight = true;
                    const token = getToken();
                    const API_BASE_URL = 'http://localhost:8081/api';
                    if (token) {
                        let resp = await fetch(`${API_BASE_URL}/perfil`, {
                            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                            signal: controller.signal
                        });
                        if (resp.status === 401 || resp.status === 403) {
                            const rf = await fetch(`${API_BASE_URL}/auth/refresh`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
                                signal: controller.signal
                            }).catch(() => null);
                            if (rf && rf.ok) {
                                const data = await rf.json();
                                if (data?.token) {
                                    setToken(data.token);
                                    resp = await fetch(`${API_BASE_URL}/perfil`, {
                                        headers: { 'Authorization': `Bearer ${data.token}`, 'Accept': 'application/json' },
                                        signal: controller.signal
                                    });
                                }
                            }
                        }
                        if (resp && resp.ok) {
                            const pf = await resp.json();
                            setUsuarioNav(prev => ({ ...(prev || {}), username: pf.username || (prev?.username || ''), nombre: pf.nombre || (pf.username || '') }));
                            try { guardarUsuario({ token: getToken(), username: pf.username, email: pf.email, nombre: pf.nombre || pf.username }); } catch { void 0; }
                        }
                    }
                } catch { return; }
                finally {
                    perfilFetchState.current.inFlight = false;
                    perfilFetchState.current.lastTs = Date.now();
                }
            }
        };

        actualizarCarrito();
        actualizarUsuario();
        setLoggedIn(!!getToken());
        const onUpdate = () => { actualizarCarrito(); actualizarUsuario(); };
        window.addEventListener('storage', onUpdate);
        window.addEventListener('carritoActualizado', onUpdate);
        window.addEventListener('usuarioActualizado', onUpdate);
        return () => {
            try { controller.abort(); } catch { /* noop */ }
            window.removeEventListener('storage', onUpdate);
            window.removeEventListener('carritoActualizado', onUpdate);
            window.removeEventListener('usuarioActualizado', onUpdate);
            return;
        };
    }, [location]);

    const handleLogout = async () => {
        if (!window.confirm('¿Estás seguro de cerrar sesión?')) return;
        try {
            const token = getToken();
            const API_BASE_URL = 'http://localhost:8081/api';
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            }).catch(() => { void 0; });
        } finally {
            cerrarSesion();
            navigate('/login');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to={loggedIn ? (isAdmin ? "/dashboard" : "/") : "/"}>
                    <img src="/img/Logo.png" alt="Choco&Frutas" />
                    Choco&Frutas
                </Link>
                
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                
                <div className="collapse navbar-collapse" id="menuNav">
                    <ul className="navbar-nav ms-auto">
                        {loggedIn ? (
                            isAdmin ? (
                                <>
                                    <li className="nav-item">
                                        <Link 
                                            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                            to="/dashboard">
                                            <i className="bi bi-speedometer2"></i> Dashboard
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link 
                                            className={`nav-link ${location.pathname === '/productos' ? 'active' : ''}`}
                                            to="/productos">
                                            <i className="bi bi-box-seam"></i> Productos
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link 
                                            className={`nav-link ${location.pathname === '/categorias' ? 'active' : ''}`}
                                            to="/categorias">
                                            <i className="bi bi-tags"></i> Categorías
                                        </Link>
                                    </li>
                                    {/* Usuarios visible sólo para Admin */}
                                    {isAdminRole && (
                                        <li className="nav-item">
                                            <Link 
                                                className={`nav-link ${location.pathname === '/usuarios' ? 'active' : ''}`}
                                                to="/usuarios">
                                                <i className="bi bi-people"></i> Usuarios
                                            </Link>
                                        </li>
                                    )}
                                    <li className="nav-item">
                                        <Link 
                                            className={`nav-link ${location.pathname === '/perfil' ? 'active' : ''}`}
                                            to="/perfil"
                                        >
                                            <i className="bi bi-person-circle"></i> {(usuarioNav?.nombre && usuarioNav.nombre.trim() !== '') ? usuarioNav.nombre : (usuarioNav?.username || 'Perfil')}
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <button onClick={handleLogout} className="nav-link btn-logout">
                                            <i className="bi bi-box-arrow-right"></i> Salir
                                        </button>
                                    </li>
                                </>
                            ) : (
                                // Cliente
                                <>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
                                            <i className="bi bi-house"></i> Home
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === '/catalogo' ? 'active' : ''}`} to="/catalogo">
                                            <i className="bi bi-box-seam"></i> Catálogo
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === '/blog' ? 'active' : ''}`} to="/blog">
                                            <i className="bi bi-journal-text"></i> Blog
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === '/contacto' ? 'active' : ''}`} to="/contacto">
                                            <i className="bi bi-envelope"></i> Contacto
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === '/carrito' ? 'active' : ''}`} to="/carrito">
                                            <i className="bi bi-cart3"></i> Carrito
                                            <span className="carrito-badge">{cantidadCarrito}</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${location.pathname === '/mis-compras' ? 'active' : ''}`} to="/mis-compras">
                                            <i className="bi bi-receipt"></i> Compras
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link 
                                            className={`nav-link ${location.pathname === '/perfil' ? 'active' : ''}`}
                                            to="/perfil"
                                        >
                                            <i className="bi bi-person-circle"></i> {(usuarioNav?.nombre && usuarioNav.nombre.trim() !== '') ? usuarioNav.nombre : (usuarioNav?.username || 'Perfil')}
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <button onClick={handleLogout} className="nav-link btn-logout">
                                            <i className="bi bi-box-arrow-right"></i> Salir
                                        </button>
                                    </li>
                                </>
                            )
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
                                        <i className="bi bi-house"></i> Home
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/catalogo' ? 'active' : ''}`} to="/catalogo">
                                        <i className="bi bi-box-seam"></i> Catálogo
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/blog' ? 'active' : ''}`} to="/blog">
                                        <i className="bi bi-journal-text"></i> Blog
                                    </Link>
                                </li>
                                
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/contacto' ? 'active' : ''}`} to="/contacto">
                                        <i className="bi bi-envelope"></i> Contacto
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/registro' ? 'active' : ''}`} to="/registro">
                                        <i className="bi bi-person-plus"></i> Registrarse
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} to="/login">
                                        <i className="bi bi-box-arrow-in-right"></i> Iniciar sesión
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
