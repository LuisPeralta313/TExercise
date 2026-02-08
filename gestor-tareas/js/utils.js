/**
 * utils.js - Funciones auxiliares y utilidades
 * Validaciones, formateo de fechas, helpers generales
 */

const Utils = {

    // =======
    // Validaciones de fechas
    // =======

    /**
     * Valida que la fecha de vencimiento no sea anterior a la de creación
     * (Simula el constraint SQL: CHECK fecha_vencimiento >= fecha_creacion)
     * @param {String} fechaCreacion - Fecha en formato YYYY-MM-DD
     * @param {String} fechaVencimiento - Fecha en formato YYYY-MM-DD
     * @returns {Boolean} true si es válida, false si no
     */
    validarFechas(fechaCreacion, fechaVencimiento) {
        const creacion = new Date(fechaCreacion);
        const vencimiento = new Date(fechaVencimiento);

        return vencimiento >= creacion;
    },

    /**
     * Verifica si una fecha está vencida (anterior a hoy)
     * @param {String} fecha - Fecha en formato YYYY-MM-DD
     * @returns {Boolean} true si está vencida
     */
    esFechaVencida(fecha) {
        const fechaObj = new Date(fecha);
        const hoy = new Date();

        // Normalizar ambas fechas a medianoche para comparar solo el día
        fechaObj.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);

        return fechaObj < hoy;
    },

    /**
     * Calcula los días restantes hasta una fecha
     * @param {String} fecha - Fecha en formato YYYY-MM-DD
     * @returns {Number} Días restantes (negativo si está vencida)
     */
    calcularDiasRestantes(fecha) {
        const fechaObj = new Date(fecha);
        const hoy = new Date();

        fechaObj.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);

        const diferencia = fechaObj - hoy;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // Convertir ms a días
    },

    /**
     * Obtiene la fecha actual en formato YYYY-MM-DD
     * @returns {String} Fecha de hoy
     */
    obtenerFechaHoy() {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');

        return `${año}-${mes}-${dia}`;
    },

    // ==========================================
    // Formateando fechas
    // ==========================================

    /**
     * Formatea una fecha de YYYY-MM-DD a formato legible
     * @param {String} fecha - Fecha en formato YYYY-MM-DD
     * @param {String} formato - 'corto' | 'largo' | 'relativo'
     * @returns {String} Fecha formateada
     */
    formatearFecha(fecha, formato = 'corto') {
        const fechaObj = new Date(fecha + 'T00:00:00'); // Evitar problemas de zona horaria

        const opciones = {
            'corto': { day: '2-digit', month: '2-digit', year: 'numeric' },
            'largo': { day: 'numeric', month: 'long', year: 'numeric' },
        };

        if (formato === 'relativo') {
            const dias = this.calcularDiasRestantes(fecha);

            if (dias < 0) {
                return `Vencida hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
            } else if (dias === 0) {
                return 'Vence hoy';
            } else if (dias === 1) {
                return 'Vence mañana';
            } else if (dias <= 7) {
                return `Vence en ${dias} días`;
            } else {
                return fechaObj.toLocaleDateString('es-ES', opciones['corto']);
            }
        }

        return fechaObj.toLocaleDateString('es-ES', opciones[formato] || opciones['corto']);
    },

    // ==========================================
    // Formularios ---Validaciones
    // ==========================================

    /**
     * Valida los campos de una tarea antes de crear/actualizar
     * @param {Object} datos - Objeto con los campos de la tarea
     * @returns {Object} { valido: boolean, errores: array }
     */
    validarTarea(datos) {
        const errores = [];

        // Validar título
        if (!datos.titulo || datos.titulo.trim() === '') {
            errores.push('El título es obligatorio');
        } else if (datos.titulo.trim().length < 3) {
            errores.push('El título debe tener al menos 3 caracteres');
        } else if (datos.titulo.trim().length > 100) {
            errores.push('El título no puede exceder 100 caracteres');
        }

        // Validar estado
        const estadosValidos = ['Pendiente', 'Completada'];
        if (datos.estado && !estadosValidos.includes(datos.estado)) {
            errores.push('Estado inválido (debe ser Pendiente o Completada)');
        }

        // Validar fechas
        if (!datos.fecha_creacion) {
            errores.push('La fecha de creación es obligatoria');
        }

        if (!datos.fecha_vencimiento) {
            errores.push('La fecha de vencimiento es obligatoria');
        }

        // Validar que vencimiento >= creación
        if (datos.fecha_creacion && datos.fecha_vencimiento) {
            if (!this.validarFechas(datos.fecha_creacion, datos.fecha_vencimiento)) {
                errores.push('La fecha de vencimiento no puede ser anterior a la fecha de creación');
            }
        }

        // Validar usuario asignado
        if (!datos.id_usuario_asignado) {
            errores.push('Debe asignar la tarea a un usuario');
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    },

    /**
     * Valida credenciales de login
     * @param {String} usuario - Nombre de usuario
     * @param {String} password - Contraseña
     * @returns {Object} { valido: boolean, errores: array }
     */
    validarLogin(usuario, password) {
        const errores = [];

        if (!usuario || usuario.trim() === '') {
            errores.push('El nombre de usuario es obligatorio');
        }

        if (!password || password.trim() === '') {
            errores.push('La contraseña es obligatoria');
        }

        return {
            valido: errores.length === 0,
            errores: errores
        };
    },

    // ==========================================
    // Utilidades del texto
    // ==========================================

    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {String} texto - Texto a escapar
     * @returns {String} Texto escapado
     */
    escaparHTML(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    },

    /**
     * Trunca un texto a un número máximo de caracteres
     * @param {String} texto - Texto a truncar
     * @param {Number} maxLength - Longitud máxima
     * @returns {String} Texto truncado
     */
    truncarTexto(texto, maxLength = 50) {
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
    },

    /**
     * Capitaliza la primera letra de un texto
     * @param {String} texto - Texto a capitalizar
     * @returns {String} Texto capitalizado
     */
    capitalizar(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    },

    // ==========================================
    // Utilidades Roles y estados
    // ==========================================

    /**
     * Obtiene la clase CSS según el estado de la tarea
     * @param {String} estado - 'Pendiente' o 'Completada'
     * @returns {String} Nombre de clase CSS
     */
    obtenerClaseEstado(estado) {
        return estado === 'Completada' ? 'estado-completada' : 'estado-pendiente';
    },

    /**
     * Obtiene la clase CSS según si la tarea está vencida
     * @param {String} fechaVencimiento - Fecha de vencimiento
     * @param {String} estado - Estado de la tarea
     * @returns {String} Nombre de clase CSS
     */
    obtenerClaseVencimiento(fechaVencimiento, estado) {
        if (estado === 'Completada') return '';

        const dias = this.calcularDiasRestantes(fechaVencimiento);

        if (dias < 0) return 'tarea-vencida';
        if (dias <= 2) return 'tarea-urgente';
        if (dias <= 7) return 'tarea-proxima'; //realmente no existe una prioridad de tareas. esto es arbitrario.

        return '';
    },

    /**
     * Verifica si un rol es administrador
     * @param {String} rol - Rol del usuario
     * @returns {Boolean} true si es administrador
     */
    esAdministrador(rol) {
        return rol === 'Administrador';
    },

    // ==========================================
    // Filtrado y ordenamiento -- Utilidades
    // ==========================================

    /**
     * Filtra un array de tareas según múltiples criterios
     * @param {Array} tareas - Array de tareas
     * @param {Object} filtros - Objeto con criterios { estado, usuario, vencidas, etc }
     * @returns {Array} Tareas filtradas
     */
    filtrarTareas(tareas, filtros = {}) {
        let resultado = [...tareas]; // Copia del array

        // Filtrar por estado
        if (filtros.estado) {
            resultado = resultado.filter(t => t.estado === filtros.estado);
        }

        // Filtrar por usuario
        if (filtros.id_usuario) {
            resultado = resultado.filter(t => t.id_usuario_asignado === filtros.id_usuario);
        }

        // Filtrar solo vencidas
        if (filtros.solo_vencidas) {
            resultado = resultado.filter(t => {
                return t.estado === 'Pendiente' && this.esFechaVencida(t.fecha_vencimiento);
            });
        }

        // Filtrar por búsqueda de texto
        if (filtros.busqueda) {
            const busqueda = filtros.busqueda.toLowerCase();
            resultado = resultado.filter(t =>
                t.titulo.toLowerCase().includes(busqueda)
            );
        }

        return resultado;
    },

    /**
     * Ordena tareas por diferentes criterios
     * @param {Array} tareas - Array de tareas
     * @param {String} criterio - 'fecha' | 'titulo' | 'estado'
     * @param {String} orden - 'asc' | 'desc'
     * @returns {Array} Tareas ordenadas
     */
    ordenarTareas(tareas, criterio = 'fecha', orden = 'asc') {
        const copia = [...tareas];

        copia.sort((a, b) => {
            let comparacion = 0;

            switch (criterio) {
                case 'fecha':
                    comparacion = new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento);
                    break;
                case 'titulo':
                    comparacion = a.titulo.localeCompare(b.titulo);
                    break;
                case 'estado':
                    comparacion = a.estado.localeCompare(b.estado);
                    break;
            }

            return orden === 'asc' ? comparacion : -comparacion;
        });

        return copia;
    },

    // ==========================================
    // Generales -- Utilidades
    // ==========================================

    /**
     * Genera un ID único (principalmente para su utilidad con el Dom)
     * @returns {String} ID único
     */
    generarIdUnico() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Muestra un mensaje en consola con formato
     * @param {String} tipo - 'info' | 'success' | 'error' | 'warning'
     * @param {String} mensaje - Mensaje a mostrar
     */

    //Me interesa especificar el mensaje, diseños sacados de otro proyecto. 

    //Desde aquí ----
    log(tipo, mensaje) {
        const estilos = {
            info: '🔵',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };

        console.log(`${estilos[tipo] || '📌'} ${mensaje}`);
    },

    //Hasta aquí.

    /**
     * Debounce - Retrasa la ejecución de una función
     * Utilidad en busqueda a tiempo real. 
     * @param {Function} func - Función a ejecutar
     * @param {Number} delay - Milisegundos de retraso
     * @returns {Function} Función con debounce
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
};

// Hacer disponible globalmente
window.Utils = Utils;