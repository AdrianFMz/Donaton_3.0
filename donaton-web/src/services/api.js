import axios from 'axios';

const api = axios.create({
    baseURL: 'https://donaton-api.onrender.com/api' 
});

// NUEVO: Interceptor de Peticiones
api.interceptors.request.use(
    (config) => {
        // Buscamos el token en el almacenamiento del navegador
        const token = localStorage.getItem('token');
        
        // Si existe, lo inyectamos en la cabecera de Autorización
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;