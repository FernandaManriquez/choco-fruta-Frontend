import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from "../../componentes/Navbar/Navbar";
import './CrearCategoria.css';
import { getToken } from '../../utils/session';

const API_BASE_URL = 'http://localhost:8081/api';

export function CrearCategoria() {

    const navigate = useNavigate();

    const [categoria, setCategoria] = useState({
        nombre: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategoria(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const datos = {
            nombre: (categoria.nombre || '').trim()
        };

        try {
            const token = getToken();
            const response = await fetch(`${API_BASE_URL}/categorias`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(datos)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al crear la categoría');
            }

            navigate('/categorias', {
                state: { message: 'Categoría creada exitosamente' }
            });

        } catch (err) {
            setError(err.message || 'No se pudo crear la categoría');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        const tieneContenido = !!categoria.nombre && categoria.nombre.trim() !== '';
        if (!tieneContenido || window.confirm('¿Está seguro de cancelar? Se perderán los datos ingresados.')) {
            navigate('/categorias');
        }
    };

    return (
        <>
            <Navbar />

            <div className="crear-usuario-container">
                <div className="form-card">
                    <h2>Crear Categoría</h2>

                    {error && (
                        <div className="error-message">
                            {error}
                            <button onClick={() => setError(null)} className="error-close">×</button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="nombre">
                                Nombre de categoría <span className="required">*</span>
                            </label>
                            <input
                                type="text" id="nombre" name="nombre"
                                value={categoria.nombre} onChange={handleChange}
                                disabled={loading} maxLength={100}
                                placeholder="Ej: Bebidas, Chocolates, Frutas" required
                                style={{ backgroundColor: 'white' }}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? 'Guardando...' : 'Crear Categoría'}
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
