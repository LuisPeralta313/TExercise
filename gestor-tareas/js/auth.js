/**
 * auth.js - Sistema de autenticación y manejo de sesión
 */
const Auth = {

    /**
     * Intenta autenticar un usuario
     * @param {String} nombreUsuario 
     * @param {String} password 
     * @returns {Object} { success: boolean, user: Object|null, message: String }
     */
    login(nombreUsuario, password) {
        // Validar campos
        const validacion = Utils.validarLogin(nombreUsuario, password);

        if (!validacion.valido) {
            return {
                success: false,
                user: null,
                message: validacion.errores.join(', ')
            };
        }

        // Buscar usuario en "base de datos"
        const usuario = Storage.getUsuarioByNombre(nombreUsuario.trim());

        if (!usuario) {
            Utils.log('error', 'Usuario no encontrado: ' + nombreUsuario);
            return {
                success: false,
                user: null,
                message: 'Usuario no encontrado'
            };
        }

        // Verificar contraseña (en producción usarías bcrypt)
        if (usuario.contrasena !== password) {
            Utils.log('error', 'Contraseña incorrecta para: ' + nombreUsuario);
            return {
                success: false,
                user: null,
                message: 'Contraseña incorrecta'
            };
        }

        // Login exitoso - guardar sesión
        this.guardarSesion(usuario);
        Utils.log('success', `Login exitoso: ${usuario.nombre_usuario} (${usuario.rol})`);

        return {
            success: true,
            user: usuario,
            message: 'Bienvenido, ' + usuario.nombre_usuario
        };
    },

    /**
     * Cierra la sesión actual
     */
    logout() {
        localStorage.removeItem(Storage.KEYS.SESION);
        Utils.log('info', 'Sesión cerrada');
    },

    /**
     * Guarda la sesión en localStorage
     * @param {Object} usuario 
     */
    guardarSesion(usuario) {
        const sesion = {
            id_usuario: usuario.id_usuario,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(Storage.KEYS.SESION, JSON.stringify(sesion));
    },

    /**
     * Obtiene el usuario actualmente logueado
     * @returns {Object|null} Usuario o null si no hay sesión
     */
    getCurrentUser() {
        const sesionData = localStorage.getItem(Storage.KEYS.SESION);

        if (!sesionData) {
            return null;
        }

        try {
            const sesion = JSON.parse(sesionData);

            // Verificar que el usuario aún existe en la BD
            const usuario = Storage.getUsuarioById(sesion.id_usuario);

            if (!usuario) {
                // Usuario fue eliminado, cerrar sesión
                this.logout();
                return null;
            }

            return usuario;

        } catch (error) {
            Utils.log('error', 'Error al recuperar sesión: ' + error.message);
            this.logout();
            return null;
        }
    },

    /**
     * Verifica si hay una sesión activa
     * @returns {Boolean}
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    /**
     * Verifica si el usuario actual es administrador
     * @returns {Boolean}
     */
    isAdmin() {
        const usuario = this.getCurrentUser();
        return usuario && Utils.esAdministrador(usuario.rol);
    },

    /**
     * Verifica si el usuario tiene permiso para ver/editar una tarea
     * @param {Object} tarea 
     * @returns {Boolean}
     */
    puedeModificarTarea(tarea) {
        const usuario = this.getCurrentUser();

        if (!usuario) return false;

        // Admin puede modificar todas
        if (this.isAdmin()) return true;

        // Usuario normal solo sus propias tareas
        return tarea.id_usuario_asignado === usuario.id_usuario;
    }
};

// Hacer disponible globalmente
window.Auth = Auth;