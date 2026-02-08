/**
 * tasks.js - Lógica de negocio para gestión de tareas
 */
const TaskManager = {

    /**
     * Obtiene las tareas según el rol del usuario
     * - Admin: Todas las tareas
     * - Usuario Normal: Solo sus tareas asignadas
     * @returns {Array} Lista de tareas
     */
    obtenerTareas() {
        const usuario = Auth.getCurrentUser();

        if (!usuario) {
            Utils.log('warning', 'No hay usuario autenticado');
            return [];
        }

        let tareas;

        if (Auth.isAdmin()) {
            // Admin ve todas las tareas
            tareas = Storage.getTareas();
            Utils.log('info', `Admin: Cargadas ${tareas.length} tareas totales`);
        } else {
            // Usuario normal solo ve las suyas
            tareas = Storage.getTareasByUsuario(usuario.id_usuario);
            Utils.log('info', `Usuario: Cargadas ${tareas.length} tareas propias`);
        }

        // Ordenar por fecha de vencimiento
        return Utils.ordenarTareas(tareas, 'fecha', 'asc');
    },

    /**
     * Crea una nueva tarea
     * @param {Object} datosTarea 
     * @returns {Object} { success: boolean, tarea: Object|null, error: String }
     */
    crearTarea(datosTarea) {
        // Validar datos
        const validacion = Utils.validarTarea(datosTarea);

        if (!validacion.valido) {
            Utils.log('error', 'Validación fallida: ' + validacion.errores.join(', '));
            return {
                success: false,
                tarea: null,
                error: validacion.errores.join('\n')
            };
        }

        // Verificar permisos
        const usuario = Auth.getCurrentUser();

        // Si no es admin, forzar que la tarea se asigne a sí mismo
        if (!Auth.isAdmin() && datosTarea.id_usuario_asignado !== usuario.id_usuario) {
            Utils.log('warning', 'Usuario normal intentó asignar tarea a otro usuario');
            datosTarea.id_usuario_asignado = usuario.id_usuario;
        }

        try {
            const nuevaTarea = Storage.createTarea(datosTarea);

            Utils.log('success', `Tarea creada: ${nuevaTarea.titulo}`);

            // Emitir evento personalizado
            document.dispatchEvent(new CustomEvent('tareaCreada', {
                detail: nuevaTarea
            }));

            return {
                success: true,
                tarea: nuevaTarea,
                error: null
            };

        } catch (error) {
            Utils.log('error', 'Error al crear tarea: ' + error.message);
            return {
                success: false,
                tarea: null,
                error: 'Error al guardar la tarea'
            };
        }
    },

    /**
     * Cambia el estado de una tarea (Pendiente <-> Completada)
     * @param {Number} idTarea 
     * @returns {Boolean} true si se actualizó
     */
    toggleEstado(idTarea) {
        const tarea = Storage.getTareaById(idTarea);

        if (!tarea) {
            Utils.log('error', 'Tarea no encontrada: ' + idTarea);
            return false;
        }

        // Verificar permisos
        if (!Auth.puedeModificarTarea(tarea)) {
            Utils.log('warning', 'Usuario sin permisos para modificar tarea ' + idTarea);
            return false;
        }

        const nuevoEstado = tarea.estado === 'Pendiente' ? 'Completada' : 'Pendiente';

        const actualizada = Storage.updateTarea(idTarea, { estado: nuevoEstado });

        if (actualizada) {
            Utils.log('success', `Tarea ${idTarea} cambiada a: ${nuevoEstado}`);

            // Emitir evento
            document.dispatchEvent(new CustomEvent('tareaActualizada', {
                detail: actualizada
            }));

            return true;
        }

        return false;
    },

    /**
     * Elimina una tarea
     * @param {Number} idTarea 
     * @returns {Boolean} true si se eliminó
     */
    eliminarTarea(idTarea) {
        const tarea = Storage.getTareaById(idTarea);

        if (!tarea) {
            Utils.log('error', 'Tarea no encontrada: ' + idTarea);
            return false;
        }

        // Verificar permisos
        if (!Auth.puedeModificarTarea(tarea)) {
            Utils.log('warning', 'Usuario sin permisos para eliminar tarea ' + idTarea);
            return false;
        }

        const eliminada = Storage.deleteTarea(idTarea);

        if (eliminada) {
            Utils.log('success', `Tarea ${idTarea} eliminada`);

            // Emitir evento
            document.dispatchEvent(new CustomEvent('tareaEliminada', {
                detail: { id: idTarea }
            }));

            return true;
        }

        return false;
    },

    /**
     * Obtiene estadísticas de tareas del usuario actual
     * @returns {Object} Estadísticas
     */
    obtenerEstadisticas() {
        const tareas = this.obtenerTareas();

        const stats = {
            total: tareas.length,
            pendientes: tareas.filter(t => t.estado === 'Pendiente').length,
            completadas: tareas.filter(t => t.estado === 'Completada').length,
            vencidas: tareas.filter(t =>
                t.estado === 'Pendiente' && Utils.esFechaVencida(t.fecha_vencimiento)
            ).length,
            proximas: tareas.filter(t => {
                const dias = Utils.calcularDiasRestantes(t.fecha_vencimiento);
                return t.estado === 'Pendiente' && dias >= 0 && dias <= 7;
            }).length
        };

        return stats;
    },

    /**
     * Filtra tareas según criterios
     * @param {Object} filtros - { busqueda, estado, solo_vencidas }
     * @returns {Array} Tareas filtradas
     */
    filtrarTareas(filtros) {
        let tareas = this.obtenerTareas();

        return Utils.filtrarTareas(tareas, filtros);
    }
};

// Hacer disponible globalmente
window.TaskManager = TaskManager;