/**
 * storage.js - Capa de persistencia usando localStorage
 * Simula las tablas SQL: Usuarios y Tareas
 */

const Storage = {

    // Claves para localStorage
    KEYS: {
        USUARIOS: 'gestor_usuarios',
        TAREAS: 'gestor_tareas',
        SESION: 'gestor_sesion',
        CONTADOR_TAREAS: 'gestor_contador_tareas'
    },

    /**
     * Inicializa la "base de datos" en localStorage
     * Si ya existe, no sobreescribe. Si no existe, carga datos iniciales.
     */
    initDB() {
        // Verificando existencia de B.Datos
        if (!localStorage.getItem(this.KEYS.USUARIOS)) {
            console.log('Inicializando base de datos en localStorage...');

            // Datos iniciales - Simulando los mismos que se usaron en sQL
            // Contraseñas no cifradas para facilitar pruebas. 
            const usuariosIniciales = [
                {
                    id_usuario: 1,
                    nombre_usuario: 'Admin_Jefe',
                    contrasena: 'admin123',
                    rol: 'Administrador'
                },
                {
                    id_usuario: 2,
                    nombre_usuario: 'Dev_Junior',
                    contrasena: 'hola123',
                    rol: 'Usuario Normal'
                },
                {
                    id_usuario: 3,
                    nombre_usuario: 'QA_Tester',
                    contrasena: 'test123',
                    rol: 'Usuario Normal'
                }
            ];

            const tareasIniciales = [
                {
                    id_tarea: 1,
                    titulo: 'Configurar Servidor',
                    estado: 'Completada',
                    fecha_creacion: '2026-01-15',
                    fecha_vencimiento: '2026-01-20',
                    id_usuario_asignado: 1
                },
                {
                    id_tarea: 2,
                    titulo: 'Diseñar Frontend',
                    estado: 'Pendiente',
                    fecha_creacion: '2026-01-20',
                    fecha_vencimiento: '2026-02-01',
                    id_usuario_asignado: 2
                },
                {
                    id_tarea: 3,
                    titulo: 'Crear API Rest',
                    estado: 'Pendiente',
                    fecha_creacion: '2026-02-05',
                    fecha_vencimiento: '2026-02-10',
                    id_usuario_asignado: 2
                },
                {
                    id_tarea: 4,
                    titulo: 'Pruebas Unitarias',
                    estado: 'Pendiente',
                    fecha_creacion: '2026-01-10',
                    fecha_vencimiento: '2026-01-25',
                    id_usuario_asignado: 3
                },
                {
                    id_tarea: 5,
                    titulo: 'Documentación Final',
                    estado: 'Pendiente',
                    fecha_creacion: '2026-02-06',
                    fecha_vencimiento: '2026-02-20',
                    id_usuario_asignado: 1
                }
            ];

            // Guardando en localStorage
            localStorage.setItem(this.KEYS.USUARIOS, JSON.stringify(usuariosIniciales));
            localStorage.setItem(this.KEYS.TAREAS, JSON.stringify(tareasIniciales));
            localStorage.setItem(this.KEYS.CONTADOR_TAREAS, '5'); // ID´s autoincrementales

            console.log('Base de datos inicializada correctamente');
        } else {
            console.log('Base de datos ya existe en localStorage');
        }
    },

    // ==========================================
    // Operaciones CRUD - Usuarios
    // ==========================================

    /**
     *Obtener todos los usuarios
     * @returns {Array} Lista de usuarios
     */
    getUsuarios() {
        const data = localStorage.getItem(this.KEYS.USUARIOS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Buscará usuarios por ID
     * @param {Number} id - ID del usuario
     * @returns {Object|null} Usuario encontrado o null
     */
    getUsuarioById(id) {
        const usuarios = this.getUsuarios();
        return usuarios.find(u => u.id_usuario === id) || null;
    },

    /**
     * Buscará un usuario por nombre de usuario
     * @param {String} nombreUsuario - Nombre de usuario
     * @returns {Object|null} Usuario encontrado o null
     */
    getUsuarioByNombre(nombreUsuario) {
        const usuarios = this.getUsuarios();
        return usuarios.find(u => u.nombre_usuario === nombreUsuario) || null;
    },

    // ==========================================
    // Operaciones CRUD para Tareas
    // ==========================================

    /**
     * Obtiene todas las tareas
     * @returns {Array} Lista de tareas
     */
    getTareas() {
        const data = localStorage.getItem(this.KEYS.TAREAS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Filtra tareas por usuario asignado
     * @param {Number} idUsuario - ID del usuario
     * @returns {Array} Tareas del usuario
     */
    getTareasByUsuario(idUsuario) {
        const tareas = this.getTareas();
        return tareas.filter(t => t.id_usuario_asignado === idUsuario);
    },

    /**
     * Obtiene una tarea por ID
     * @param {Number} id - ID de la tarea
     * @returns {Object|null} Tarea encontrada o null
     */
    getTareaById(id) {
        const tareas = this.getTareas();
        return tareas.find(t => t.id_tarea === id) || null;
    },

    /**
     * Creación de una nueva tarea
     * @param {Object} tarea - Datos de la tarea (sin id_tarea)
     * @returns {Object} Tarea creada con su nuevo ID
     */
    createTarea(tarea) {
        const tareas = this.getTareas();

        // Generar nuevo ID - simula autoincremento
        let contador = parseInt(localStorage.getItem(this.KEYS.CONTADOR_TAREAS)) || 0;
        contador++;

        const nuevaTarea = {
            id_tarea: contador,
            titulo: tarea.titulo,
            estado: tarea.estado || 'Pendiente',
            fecha_creacion: tarea.fecha_creacion,
            fecha_vencimiento: tarea.fecha_vencimiento,
            id_usuario_asignado: tarea.id_usuario_asignado
        };

        tareas.push(nuevaTarea);

        // Guardo cambios en LocalStorage
        localStorage.setItem(this.KEYS.TAREAS, JSON.stringify(tareas));
        localStorage.setItem(this.KEYS.CONTADOR_TAREAS, contador.toString());

        console.log('Tarea creada:', nuevaTarea);
        return nuevaTarea;
    },

    /**
     * Actualiza una tarea existente
     * @param {Number} id - ID de la tarea
     * @param {Object} cambios - Campos a actualizar
     * @returns {Object|null} Tarea actualizada o null si no existe
     */
    updateTarea(id, cambios) {
        const tareas = this.getTareas();
        const index = tareas.findIndex(t => t.id_tarea === id);

        if (index === -1) {
            console.error('Tarea no fue encontrada:', id);
            return null;
        }

        // Aplicar cambios 
        tareas[index] = { ...tareas[index], ...cambios };

        localStorage.setItem(this.KEYS.TAREAS, JSON.stringify(tareas));
        console.log('Tarea actualizada:', tareas[index]);

        return tareas[index];
    },

    /**
     * Elimina una tarea
     * @param {Number} id - ID de la tarea
     * @returns {Boolean} true si se eliminó, false si no existe
     */
    deleteTarea(id) {
        const tareas = this.getTareas();
        const nuevasTareas = tareas.filter(t => t.id_tarea !== id);

        if (tareas.length === nuevasTareas.length) {
            console.error('Tarea no encontrada:', id);
            return false;
        }

        localStorage.setItem(this.KEYS.TAREAS, JSON.stringify(nuevasTareas));
        console.log('Tarea eliminada:', id);
        return true;
    },

    // ==========================================
    // Consultas simulación SQL
    // ==========================================

    /**
     * Consulta 1: Tareas ordenadas por fecha de vencimiento
     * Equivalente a: SELECT * FROM Tareas ORDER BY fecha_vencimiento ASC
     */
    getTareasOrdenadas() {
        const tareas = this.getTareas();
        return tareas.sort((a, b) => {
            return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento);
        });
    },

    /**
     * Consulta 2: Conteo de tareas por usuario y estado
     * Equivalente a: SELECT usuario, estado, COUNT(*) ... GROUP BY ...
     */
    getConteoTareasPorUsuario() {
        const tareas = this.getTareas();
        const usuarios = this.getUsuarios();

        // Crear objeto para agrupar
        const agrupado = {};

        tareas.forEach(tarea => {
            const usuario = usuarios.find(u => u.id_usuario === tarea.id_usuario_asignado);
            if (!usuario) return;

            const key = `${usuario.nombre_usuario}_${tarea.estado}`;

            if (!agrupado[key]) {
                agrupado[key] = {
                    nombre_usuario: usuario.nombre_usuario,
                    estado: tarea.estado,
                    total_tareas: 0
                };
            }

            agrupado[key].total_tareas++;
        });

        // Convertir objeto a array
        return Object.values(agrupado).sort((a, b) =>
            a.nombre_usuario.localeCompare(b.nombre_usuario)
        );
    },

    /**
     * Consulta 3. tareas atrasadas. 
     * Equivalente a: WHERE estado = 'Pendiente' AND fecha_vencimiento < GetDate()
     */
    getTareasAtrasadas() {
        const tareas = this.getTareas();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche

        return tareas.filter(tarea => {
            const fechaVencimiento = new Date(tarea.fecha_vencimiento);
            return tarea.estado === 'Pendiente' && fechaVencimiento < hoy;
        }).sort((a, b) => {
            return new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento);
        });
    },

    // ==========================================
    // Utilidades 
    // ==========================================

    /**
     * Resetea la base de datos - Elimino y vuelvo a cargar datos iniciales para pruebas. 
     */
    resetDB() {
        localStorage.removeItem(this.KEYS.USUARIOS);
        localStorage.removeItem(this.KEYS.TAREAS);
        localStorage.removeItem(this.KEYS.SESION);
        localStorage.removeItem(this.KEYS.CONTADOR_TAREAS);
        console.log('Base de datos reseteada');
        this.initDB();
    },

    /**
     * Exporto los datos actuales - pruebas. 
     */
    exportData() {
        return {
            usuarios: this.getUsuarios(),
            tareas: this.getTareas(),
            sesion: JSON.parse(localStorage.getItem(this.KEYS.SESION) || 'null')
        };
    }
};

// Exportarlo para ser utilizado en otros módulos. 