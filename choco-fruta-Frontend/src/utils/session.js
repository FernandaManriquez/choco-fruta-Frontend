const ROLES = { 
    ADMIN: "ADMIN",
    CLIENTE: "CLIENTE"
};

// 💾 Guardar usuario en localStorage
const decodeToken = (token) => {
  try {
    const payload = token?.split('.')?.[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const guardarUsuario = (usuario) => {
    const prev = obtenerUsuario() || {};
    const payload = decodeToken(usuario?.token);
    const rol = payload?.rol ?? usuario?.rol ?? prev?.rol ?? null;
    const username = payload?.sub ?? usuario?.username ?? prev?.username ?? null;
    const nombre = usuario?.nombre ?? prev?.nombre ?? null;
    const data = { ...prev, ...usuario, username, rol, nombre };
    localStorage.setItem('usuarioLogueado', JSON.stringify(data));
    if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('usuarioActualizado'));
    }
};

// 🔍 Obtener usuario actual
export const obtenerUsuario = () => {
    const token = getToken();
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        const decoded = JSON.parse(jsonPayload);
        return {
            username: decoded.sub,
            rol: decoded.rol
        };
    } catch (e) {
        console.error('Error decodificando token:', e);
        return null;
    }
};

// ✅ Verificar si está logueado
export const estaLogueado = () => {
    return localStorage.getItem('usuarioLogueado') !== null;
};

// 🚪 Cerrar sesión
export const cerrarSesion = () => {
    console.log('👋 Cerrando sesión...');
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('authToken');
    if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new Event('usuarioActualizado'));
    }
};

// 🔐 Verificar roles
export const esSuperAdmin = () => {
    const usuario = obtenerUsuario();
    return usuario && usuario.rol === ROLES.ADMIN;
};

export const esAdmin = () => {
    const usuario = obtenerUsuario();
    return usuario && usuario.rol === ROLES.ADMIN;
};

// rol vendedor no aplica según rúbrica

// 🔎 Verificar rol exacto
export const tieneRol = (rol) => {
    const usuario = obtenerUsuario();
    return usuario && usuario.rol === rol;
};

// 🧩 Depuración
export const debugSession = () => {
    const usuario = obtenerUsuario();
    console.group('🔍 DEBUG SESSION');
    console.log('Usuario:', usuario);
    console.log('Está logueado:', estaLogueado());
    console.log('SuperAdmin:', esSuperAdmin());
    console.groupEnd();
};

export const setToken = (token) => {
    localStorage.setItem('authToken', token);
};

export const getToken = () => {
    return localStorage.getItem('authToken');
};

export const getUid = () => {
    const token = getToken();
    const payload = decodeToken(token);
    return payload?.uid ?? null;
};
