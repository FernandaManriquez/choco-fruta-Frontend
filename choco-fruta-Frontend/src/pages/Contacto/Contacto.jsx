import { useState } from 'react';
import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import './Contacto.css';

export function Contacto() {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        mensaje: ''
    });

    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    const validarCampo = (name, value) => {
        const nuevosErrores = { ...errores };

        switch (name) {
            case 'nombre':
                if (!value.trim()) {
                    nuevosErrores.nombre = 'El nombre es requerido';
                } else if (value.length > 100) {
                    nuevosErrores.nombre = 'El nombre no puede exceder 100 caracteres';
                } else {
                    delete nuevosErrores.nombre;
                }
                break;

            case 'correo': {
                const emailRegex = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
                if (!value.trim()) {
                    nuevosErrores.correo = 'El correo es requerido';
                } else if (!emailRegex.test(value)) {
                    nuevosErrores.correo = 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com';
                } else if (value.length > 100) {
                    nuevosErrores.correo = 'El correo no puede exceder 100 caracteres';
                } else {
                    delete nuevosErrores.correo;
                }
                break;
            }

            case 'mensaje':
                if (!value.trim()) {
                    nuevosErrores.mensaje = 'El mensaje es requerido';
                } else if (value.length > 500) {
                    nuevosErrores.mensaje = 'El mensaje no puede exceder 500 caracteres';
                } else {
                    delete nuevosErrores.mensaje;
                }
                break;

            default:
                break;
        }

        setErrores(nuevosErrores);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        validarCampo(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar todos los campos
        validarCampo('nombre', formData.nombre);
        validarCampo('correo', formData.correo);
        validarCampo('mensaje', formData.mensaje);

        if (Object.keys(errores).length > 0) {
            return;
        }

        setEnviando(true);

        try {
            // Simulación de envío
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            alert('¡Mensaje enviado correctamente! Te contactaremos pronto.');
            
            // Limpiar formulario
            setFormData({
                nombre: '',
                correo: '',
                mensaje: ''
            });
        } catch {
            alert('Error al enviar el mensaje. Por favor, intenta nuevamente.');
        } finally {
            setEnviando(false);
        }
    };

    const limpiarFormulario = () => {
        setFormData({
            nombre: '',
            correo: '',
            mensaje: ''
        });
        setErrores({});
    };

    return (
        <>
            <div className="page-wrapper">
                <div className="container-fluid p-0">
                    <Navbar />
                </div>
                
                <div className="contacto-content page-content">
                    <h2>Contáctanos</h2>
                    
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="info-contacto">
                                <h3>Información de Contacto</h3>
                                <div className="info-item">
                                    <i className="bi bi-geo-alt-fill"></i>
                                    <div>
                                        <strong>Dirección:</strong>
                                        <p>Luis Camallo 1949, Teniente Cruz</p>
                                    </div>
                                </div>
                                
                                <div className="info-item">
                                    <i className="bi bi-telephone-fill"></i>
                                    <div>
                                        <strong>Teléfono:</strong>
                                        <p>+56 9 5992 0615</p>
                                    </div>
                                </div>
                                
                                <div className="info-item">
                                    <i className="bi bi-envelope-fill"></i>
                                    <div>
                                        <strong>Email:</strong>
                                        <p>ximena.monterog1976@gmail.com</p>
                                    </div>
                                </div>
                                
                                <div className="info-item">
                                    <i className="bi bi-clock-fill"></i>
                                    <div>
                                        <strong>Horario:</strong>
                                        <p>Sábado y Domingo, 8:00 - 17:00 hrs</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-6">
                            <div className="formulario-contacto">
                                <h3>Envíanos un Mensaje</h3>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="nombre">
                                            Nombre <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                                            placeholder="Tu nombre completo"
                                            disabled={enviando}
                                        />
                                        {errores.nombre && (
                                            <small className="error-text">
                                                <i className="bi bi-exclamation-circle"></i> {errores.nombre}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="correo">
                                            Correo electrónico <span className="required">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="correo"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleChange}
                                            className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                                            placeholder="tu.correo@ejemplo.com"
                                            disabled={enviando}
                                        />
                                        {errores.correo && (
                                            <small className="error-text">
                                                <i className="bi bi-exclamation-circle"></i> {errores.correo}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="mensaje">
                                            Mensaje <span className="required">*</span>
                                        </label>
                                        <textarea
                                            id="mensaje"
                                            name="mensaje"
                                            rows="5"
                                            value={formData.mensaje}
                                            onChange={handleChange}
                                            className={`form-control ${errores.mensaje ? 'is-invalid' : ''}`}
                                            placeholder="Escribe tu mensaje aquí..."
                                            disabled={enviando}
                                        ></textarea>
                                        <small className="char-count">
                                            {formData.mensaje.length}/500 caracteres
                                        </small>
                                        {errores.mensaje && (
                                            <small className="error-text">
                                                <i className="bi bi-exclamation-circle"></i> {errores.mensaje}
                                            </small>
                                        )}
                                    </div>

                                    <div className="form-actions">
                                        <button 
                                            type="submit" 
                                            className="btn-enviar"
                                            disabled={enviando || Object.keys(errores).length > 0}
                                        >
                                            {enviando ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-send"></i> Enviar Mensaje
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn-limpiar"
                                            onClick={limpiarFormulario}
                                            disabled={enviando}
                                        >
                                            <i className="bi bi-x-circle"></i> Limpiar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Footer />
            </div>
        </>
    );
}
