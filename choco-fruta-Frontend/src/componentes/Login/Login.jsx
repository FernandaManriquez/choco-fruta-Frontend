import { useState } from 'react';
import { Link } from 'react-router-dom';
import { guardarUsuario, setToken, obtenerUsuario } from '../../utils/session';
import './Login.css';

const API_BASE_URL = 'http://localhost:8081/api';

export function Login() {

    const [credenciales, setCredenciales] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredenciales(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const controller = new AbortController();
            const loginData = {
                username: credenciales.username.trim().toLowerCase(),
                password: credenciales.password.trim()
            };
            const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            const resp = await fetch(`${API_BASE_URL}/auth/login`, { 
                method: 'POST',
                headers,
                body: JSON.stringify(loginData),
                signal: controller.signal
            });
            if (!resp.ok) {
                const errorText = await resp.text().catch(() => '');
                const msg = (resp.status === 401 || resp.status === 403) ? 'Credenciales incorrectas' : (errorText || 'No se pudo iniciar sesión');
                throw new Error(msg);
            }
            const data = await resp.json();
            setToken(data.token);
            guardarUsuario({ token: data.token, username: loginData.username });
            const u = obtenerUsuario();
            if (u?.rol === 'ADMIN') {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/';
            }
        } catch (err) {
            if (err?.name === 'AbortError') return;
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="/img/Logo.png" alt="Choco&Frutas" className="login-logo" />
                    <h2>Choco&Frutas</h2>
                    <p>Iniciar Sesión</p>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        <i className="bi bi-exclamation-triangle"></i> {error}
                        <button onClick={() => setError(null)} className="error-close">×</button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username"><i className="bi bi-person"></i> Usuario</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={credenciales.username}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="tu_usuario"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><i className="bi bi-lock"></i> Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={credenciales.password}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-login">
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p className="registro-text">¿No tienes cuenta? <Link to="/registro" className="registro-link">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
}
