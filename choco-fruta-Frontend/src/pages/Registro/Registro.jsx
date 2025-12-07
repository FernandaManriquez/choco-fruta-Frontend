import { useState } from 'react';
import { guardarUsuario, setToken } from '../../utils/session';
import { Navbar } from "../../componentes/Navbar/Navbar";
import { Footer } from "../../componentes/Footer/Footer";
import './Registro.css';

    const API_BASE_URL = 'http://localhost:8081/api';

export function Registro() {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        password: '',
        confirmPassword: '',
        region: '',
        comuna: ''
    });

    const [errores, setErrores] = useState({});

    const regiones = {
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
    };

    const [comunas, setComunas] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'region') {
            setComunas(regiones[value] || []);
            setFormData(prev => ({
                ...prev,
                region: value,
                comuna: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Limpiar error del campo cuando se modifica
        if (errores[name]) {
            setErrores(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre es obligatorio';
        }

        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.correo.trim()) {
            nuevosErrores.correo = 'El correo es obligatorio';
        } else if (!formatoCorreo.test(formData.correo)) {
            nuevosErrores.correo = 'El correo no tiene un formato válido';
        }

        const formatoClave = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!formData.password) {
            nuevosErrores.password = 'La contraseña es requerida';
        } else if (!formatoClave.test(formData.password)) {
            nuevosErrores.password = 'Debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial';
        }

        if (formData.password !== formData.confirmPassword) {
            nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.region) {
            nuevosErrores.region = 'Selecciona una región';
        }

        if (!formData.comuna) {
            nuevosErrores.comuna = 'Selecciona una comuna';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        const nuevoUsuario = {
            username: formData.nombre.trim().toLowerCase(),
            email: formData.correo.trim().toLowerCase(),
            password: formData.password,
            rol: 'CLIENTE'
        };

        try {
            const resp = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(nuevoUsuario)
            });
            if (!resp.ok) {
                const txt = await resp.text().catch(() => '');
                throw new Error(txt || 'Error al registrar usuario');
            }
            await resp.json();
            try {
                const loginResp = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ username: nuevoUsuario.username, password: nuevoUsuario.password })
                });
                if (loginResp.ok) {
                    const loginData = await loginResp.json();
                    const token = loginData?.token;
                    if (token) {
                        setToken(token);
                        guardarUsuario({ token, username: nuevoUsuario.username });
                    }
                    alert('✅ Registro exitoso. Sesión iniciada.');
                    window.location.href = '/';
                    return;
                }
            } catch { /* noop */ }
            alert('✅ Registro exitoso. Ahora puedes iniciar sesión.');
            window.location.href = '/login';
        } catch (err) {
            alert('❌ ' + (err.message || 'No se pudo registrar'));
        }
    };

    return (
        <>
            <div className="page-wrapper">
            <div className="container-fluid p-0">
                <Navbar />

                <div className="registro-content page-content">
                    <div className="registro-card">
                        <h3>Registro de Usuario</h3>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="nombre" className="form-label">
                                        Nombre completo <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                                        placeholder="Ingresa tu nombre completo"
                                    />
                                    {errores.nombre && <small className="error-text">{errores.nombre}</small>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="correo" className="form-label">
                                        Correo electrónico <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="correo"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        className={`form-control ${errores.correo ? 'is-invalid' : ''}`}
                                        placeholder="ejemplo@correo.com"
                                    />
                                    {errores.correo && <small className="error-text">{errores.correo}</small>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="password" className="form-label">
                                        Contraseña <span className="required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    {errores.password && <small className="error-text">{errores.password}</small>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label">
                                        Confirmar contraseña <span className="required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`form-control ${errores.confirmPassword ? 'is-invalid' : ''}`}
                                        placeholder="Confirma tu contraseña"
                                    />
                                    {errores.confirmPassword && <small className="error-text">{errores.confirmPassword}</small>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="region" className="form-label">
                                        Región <span className="required">*</span>
                                    </label>
                                    <select
                                        id="region"
                                        name="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                        className={`form-select ${errores.region ? 'is-invalid' : ''}`}
                                    >
                                        <option value="">Seleccione región</option>
                                        {Object.keys(regiones).map(region => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                    {errores.region && <small className="error-text">{errores.region}</small>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="comuna" className="form-label">
                                        Comuna <span className="required">*</span>
                                    </label>
                                    <select
                                        id="comuna"
                                        name="comuna"
                                        value={formData.comuna}
                                        onChange={handleChange}
                                        className={`form-select ${errores.comuna ? 'is-invalid' : ''}`}
                                        disabled={!formData.region}
                                    >
                                        <option value="">Seleccione comuna</option>
                                        {comunas.map(comuna => (
                                            <option key={comuna} value={comuna}>{comuna}</option>
                                        ))}
                                    </select>
                                    {errores.comuna && <small className="error-text">{errores.comuna}</small>}
                                </div>
                            </div>

                            <div className="login-text">
                                ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-registro">
                                    Crear cuenta
                                </button>
                                <button type="reset" className="btn-limpiar" onClick={() => setFormData({
                                    nombre: '',
                                    correo: '',
                                    password: '',
                                    confirmPassword: '',
                                    region: '',
                                    comuna: ''
                                })}>
                                    Limpiar formulario
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <Footer />
            </div>
            </div>
        </>
    );
}
