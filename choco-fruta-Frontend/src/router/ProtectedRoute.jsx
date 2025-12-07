import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { obtenerUsuario, getToken, setToken, guardarUsuario } from '../utils/session';

export function ProtectedRoute({ children, role }) {
    const [status, setStatus] = useState('checking');
    const [currentUser, setCurrentUser] = useState(obtenerUsuario());

    useEffect(() => {
        const checkAndRefresh = async () => {
            try {
                let user = obtenerUsuario();
                if (user) {
                    if (role && (!user.rol || user.rol !== role)) {
                        const tok = getToken();
                        if (!tok) { setStatus('redirect'); return; }
                        try {
                            const rp = await fetch('http://localhost:8081/api/perfil', {
                                headers: { 'Authorization': `Bearer ${tok}`, 'Accept': 'application/json' }
                            });
                            if (rp.ok) {
                                const pf = await rp.json();
                                guardarUsuario({ token: tok, username: pf.username, nombre: pf.nombre, email: pf.email, rol: pf.rol?.name || pf.rol });
                                user = obtenerUsuario();
                                setCurrentUser(user);
                                if (user?.rol === role) { setStatus('ok'); return; }
                                setStatus('home');
                                return;
                            }
                        } catch { void 0; }
                        setStatus('home');
                        return;
                    }
                    setCurrentUser(user);
                    setStatus('ok');
                    return;
                }

                const token = getToken();
                if (!token) {
                    setStatus('redirect');
                    return;
                }

                const resp = await fetch('http://localhost:8081/api/auth/refresh', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                if (!resp.ok) {
                    setStatus('redirect');
                    return;
                }
                const data = await resp.json();
                if (data?.token) {
                    setToken(data.token);
                    guardarUsuario({ token: data.token });
                    try {
                        const rp = await fetch('http://localhost:8081/api/perfil', {
                            headers: { 'Authorization': `Bearer ${data.token}`, 'Accept': 'application/json' }
                        });
                        if (rp.ok) {
                            const pf = await rp.json();
                            guardarUsuario({ token: data.token, username: pf.username, nombre: pf.nombre, email: pf.email, rol: pf.rol?.name || pf.rol });
                        }
                    } catch { void 0; }
                    user = obtenerUsuario();
                    setCurrentUser(user);
                    if (role && (!user?.rol || user.rol !== role)) { setStatus('home'); return; }
                    setStatus('ok');
                    return;
                }
                setStatus('redirect');
            } catch {
                setStatus('redirect');
            }
        };
        checkAndRefresh();
    }, [role]);

    if (status === 'checking') return null;
    if (status === 'redirect') return <Navigate to="/login" replace />;
    if (status === 'home') return <Navigate to="/" replace />;

    if (role && currentUser?.rol !== role) {
        return <Navigate to="/" replace />;
    }
    return children;
}
