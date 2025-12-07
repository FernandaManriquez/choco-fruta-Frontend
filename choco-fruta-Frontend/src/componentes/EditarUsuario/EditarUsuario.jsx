import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../componentes/Navbar/Navbar';
import './EditarUsuario.css';
import { getToken } from '../../utils/session';

export function EditarUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();
    const usuarioId = parseInt(id);

    const [usuario, setUsuario] = useState({
        nombre: '',
        email: '',
        rol: '',
        activo: true,
        newPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const cargarUsuario = async () => {
            try {
                setLoading(true);

                const token = getToken();
                const response = await fetch(`http://localhost:8081/api/usuarios/${usuarioId}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al cargar el usuario');
                }

                const data = await response.json();
                console.log('Usuario cargado:', data);

                setUsuario({
                    id: data.id,
                    nombre: data.nombre ?? data.username ?? '',
                    email: data.email ?? '',
                    rol: typeof data.rol === 'string' ? data.rol : (data.rol?.name ?? ''),
                    activo: data.enabled === true || data.enabled === 'true'
                });

                setError(null);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (usuarioId) {
            cargarUsuario();
        }
    }, [usuarioId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const datosActualizados = {
                id: usuario.id,
                username: (usuario.nombre || '').trim(),
                email: (usuario.email || '').trim(),
                rol: usuario.rol,
                enabled: usuario.activo
            };
            if (usuario.newPassword && usuario.newPassword.trim().length > 0) {
                datosActualizados.password = usuario.newPassword.trim();
            }

            console.log('Datos a enviar:', datosActualizados);

            const token = getToken();
            const response = await fetch(`http://localhost:8081/api/usuarios/${usuarioId}/actualizar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Respuesta del servidor:', errorText);
                throw new Error('Error al actualizar el usuario');
            }

            const usuarioActualizado = await response.json();
            console.log('Usuario actualizado exitosamente:', usuarioActualizado);
            setSuccess(true);

            setTimeout(() => {
                navigate('/usuarios');
            }, 1500);

        } catch (err) {
            console.error('Error completo:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleVolver = () => {
        navigate('/usuarios');
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
                        <p className="mt-3 text-muted">Cargando usuario...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="container mt-3" style={{ maxWidth: '600px' }}>
                <div className="card">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-2">
                        <h6 className="mb-0">Editar Usuario</h6>
                        <button
                            onClick={handleVolver}
                            type="button"
                            className="btn-close btn-close-white"
                            aria-label="Cerrar"
                        ></button>
                    </div>

                    <div className="card-body p-3">
                        {error && (
                            <div className="alert alert-danger py-2 mb-2 small">
                                {error}
                            </div>
                        )}

                {success && (
                    <div className="alert alert-success py-2 mb-2 small">
                        Usuario actualizado exitosamente
                    </div>
                )}

                        <div className="mb-2">
                            <label className="form-label small mb-1">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={usuario.nombre}
                                onChange={handleChange}
                                className="form-control form-control-sm"
                            />
                        </div>

                        <div className="mb-2">
                            <label className="form-label small mb-1">Email</label>
                            <input
                                type="email"
                                value={usuario.email}
                                disabled
                                className="form-control form-control-sm bg-light"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small mb-1">Rol</label>
                            <select
                                name="rol"
                                value={usuario.rol}
                                onChange={handleChange}
                                className="form-select form-control-sm">
                                <option value="CLIENTE">Cliente</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small mb-1">Nueva contraseña (opcional)</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={usuario.newPassword}
                                onChange={handleChange}
                                className="form-control form-control-sm"
                                placeholder="Mínimo 8 caracteres"
                                minLength={8}
                            />
                            <small className="text-muted">Déjalo en blanco si no quieres cambiarla.</small>
                        </div>

                        <div className="d-flex gap-2 pt-2 border-top">
                            <button
                                onClick={handleVolver}
                                type="button"
                                className="btn btn-sm btn-secondary">
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                type="button"
                                className="btn btn-sm btn-primary flex-grow-1">
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
