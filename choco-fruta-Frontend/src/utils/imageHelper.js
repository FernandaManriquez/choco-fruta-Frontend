/**
 * Obtiene la ruta correcta de la imagen según su formato
 * @param {string} imagen - Nombre del archivo o URL completa
 * @returns {string} - Ruta completa de la imagen
 */
export const obtenerRutaImagen = (imagen) => {
    // Si no hay imagen, usar default
    if (!imagen || imagen.trim() === '') {
        return '/img/Logo.png';
    }

    const imagenLimpia = imagen.trim();

    // Si es una URL completa (http:// o https://)
    if (imagenLimpia.startsWith('http://') || imagenLimpia.startsWith('https://')) {
        return imagenLimpia;
    }

    // Si es una imagen del backend (/uploads/), usar endpoint público
    if (imagenLimpia.startsWith('/uploads/')) {
        const filename = imagenLimpia.split('/').pop();
        return `http://localhost:8081/api/upload/imagenes/${filename}`;
    }

    // Si ya tiene /img/ al inicio (carpeta public)
    if (imagenLimpia.startsWith('/img/')) {
        return imagenLimpia;
    }

    // Si es solo el nombre del archivo, buscar en /img/
    return `/img/${imagenLimpia}`;
};

/**
 * Sube una imagen al servidor
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} - Ruta de la imagen subida
 */
import { getToken } from './session';

export const subirImagen = async (file) => {
    const formData = new FormData();
    formData.append('imagen', file);

    try {
        const token = getToken();
        const response = await fetch('http://localhost:8081/api/upload/imagenes', {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al subir la imagen');
        }

        const rutaImagen = await response.text();
        console.log('✅ Imagen subida:', rutaImagen);
        return rutaImagen;
    } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        throw error;
    }
};

/**
 * Valida si una URL de imagen es válida según su extensión
 * @param {string} url - URL a validar
 * @returns {boolean}
 */
export const esUrlImagenValida = (url) => {
    if (!url || url.trim() === '') return false;
    
    const formatosValidos = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const urlLower = url.toLowerCase();
    
    return formatosValidos.some(formato => urlLower.includes(formato));
};
