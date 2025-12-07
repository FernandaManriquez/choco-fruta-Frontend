import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../componentes/Navbar/Navbar';
import './EditarCategoria.css';
import { getToken } from '../../utils/session';

export function EditarCategoria() {
    const { id } = useParams();
    const navigate = useNavigate();
    const categoriaId = parseInt(id);

    const [categoria, setCategoria] = useState({
        nombre: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const cargarCategoria = async () => {
            try {
                setLoading(true);
                const token = getToken();
                const response = await fetch(`http://localhost:8081/api/categorias/${categoriaId}`, {
                    headers: {
                        'Accept': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                });
                if (!response.ok) {
                    throw new Error('Error al cargar la categoría');
                }
                const data = await response.json();
                setCategoria({ nombre: data.nombre ?? '' });
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        if (categoriaId) cargarCategoria();
    }, [categoriaId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoria(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:8081/api/categorias/${categoriaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ nombre: (categoria.nombre || '').trim() })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Respuesta del servidor:', errorText);
                throw new Error('Error al actualizar la categoría');
            }
            await response.json();
            setSuccess(true);
            setTimeout(() => { navigate('/categorias'); }, 1200);
        } catch (err) {
            console.error('Error completo:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleVolver = () => {
        navigate('/categorias');
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
                        <p className="mt-3 text-muted">Cargando categoría...</p>
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
                        <h6 className="mb-0">Editar Categoría</h6>
                        <button onClick={handleVolver} type="button" className="btn-close btn-close-white" aria-label="Cerrar"></button>
                    </div>

                    <div className="card-body p-3">
                        {error && (
                            <div className="alert alert-danger py-2 mb-2 small">{error}</div>
                        )}
                        {success && (
                            <div className="alert alert-success py-2 mb-2 small">Categoría actualizada exitosamente</div>
                        )}

                        <div className="mb-3">
                            <label className="form-label small mb-1">Nombre</label>
                            <input type="text" name="nombre" value={categoria.nombre} onChange={handleChange} className="form-control form-control-sm" />
                        </div>

                        <div className="d-flex gap-2 pt-2 border-top">
                            <button onClick={handleVolver} type="button" className="btn btn-sm btn-secondary">Cancelar</button>
                            <button onClick={handleSubmit} disabled={saving} type="button" className="btn btn-sm btn-primary flex-grow-1">{saving ? 'Guardando...' : 'Guardar Cambios'}</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

