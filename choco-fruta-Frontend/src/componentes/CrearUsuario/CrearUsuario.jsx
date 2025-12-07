import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "../../componentes/Navbar/Navbar";
import './CrearUsuario.css';

const API_BASE_URL = 'http://localhost:8081/api';

export function CrearUsuario() {

    const navigate = useNavigate();

    const [usuario, setUsuario] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: '',
        estado: 'activo'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const usuarioParaEnviar = {
            username: usuario.nombre.trim(),
            email: usuario.email.trim(),
            password: usuario.password,
            rol: usuario.rol,
            enabled: usuario.estado === 'activo'
        };

        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioParaEnviar)
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('El nombre de usuario o correo ya existe');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al crear el usuario');
            }

            navigate('/usuarios', {
                state: { message: 'Usuario creado exitosamente' }
            });

        } catch (err) {
            setError(err.message || 'No se pudo crear el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        const tieneContenido = Object.values(usuario).some(val => val !== '' && val !== 'activo');

        if (!tieneContenido || window.confirm('¿Está seguro de cancelar? Se perderán los datos ingresados.')) {
            navigate('/usuarios');
        }
    };

    return (
        <>
            <Navbar />

            <div className="crear-usuario-container">
                <div className="form-card">
                    <h2>Crear Usuario</h2>

                    {error && (
                        <div className="error-message">
                            {error}
                            <button onClick={() => setError(null)} className="error-close">×</button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">
                                Nombre completo <span className="required">*</span>
                            </label>
                            <input
                                type="text" id="nombre" name="nombre"
                                value={usuario.nombre} onChange={handleChange}
                                disabled={loading} maxLength={100}
                                placeholder="Ej: Juan Pérez" required
                                style={{ backgroundColor: 'white' }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                Email <span className="required">*</span>
                            </label>
                            <input
                                type="email" id="email" name="email"
                                value={usuario.email} onChange={handleChange}
                                disabled={loading} maxLength={100}
                                placeholder="ejemplo@correo.com" required
                                style={{ backgroundColor: 'white' }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                Contraseña <span className="required">*</span>
                            </label>
                            <input
                                type="password" id="password" name="password"
                                value={usuario.password} onChange={handleChange}
                                disabled={loading} minLength={8}
                                placeholder="Mínimo 8 caracteres" required
                                style={{ backgroundColor: 'white' }}
                            />
                            <small className="help-text">
                                La contraseña debe tener al menos 8 caracteres
                            </small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="rol">
                                    Rol <span className="required">*</span>
                                </label>
                                <select
                                    id="rol" name="rol"
                                    value={usuario.rol} onChange={handleChange}
                                    disabled={loading} required
                                    style={{ backgroundColor: 'white', color: 'black' }}>
                                    <option value="">Seleccione un rol</option>
                                    <option value="CLIENTE">Cliente</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="estado">
                                    Estado <span className="required">*</span>
                                </label>
                                <select
                                    id="estado" name="estado"
                                    value={usuario.estado} onChange={handleChange}
                                    disabled={loading} required
                                    style={{ backgroundColor: 'white', color: 'black' }}>
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Guardando...' : 'Crear Usuario'}
                            </button>
                            <button type="button" onClick={handleCancel} disabled={loading} className="btn-secondary">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
