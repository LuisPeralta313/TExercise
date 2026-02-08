/**
 * main.js - Iniciar app y conectar eventos con lógica
 */
const Main = {
    init() {
        console.log('Iniciando aplicación Gestor de Tareas...');

        // 1. Verificar si ya hay base de datos, si no, crearla
        Storage.initDB();

        // 2. Verificar si hay usuario logueado
        const usuario = Auth.getCurrentUser();

        // 3. Actualizar interfaz según el estado
        DOM.updateUI(usuario);

        if (usuario) {
            this.loadDashboard();
        }

        // 4. Configurar Event Listeners
        this.setupEventListeners();

        console.log('Aplicación inicializada correctamente');
    },

    // Programar Eventos aquí - login, logout, create, ...
    setupEventListeners() {
        // Evento Login
        document.getElementById('btn-login').addEventListener('click', () => {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            const result = Auth.login(user, pass);

            if (result.success) {
                DOM.updateUI(result.user);
                this.loadDashboard();
                DOM.showNotification(result.message, 'success');
            } else {
                DOM.showLoginError(result.message);
            }
        });

        // Evento Logout
        document.getElementById('btn-logout').addEventListener('click', () => {
            if (DOM.confirm('¿Seguro que deseas cerrar sesión?')) {
                Auth.logout();
                DOM.updateUI(null);
                DOM.showNotification('Sesión cerrada correctamente', 'info');
            }
        });

        // Evento Crear Tarea
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateTask();
        });

        // Evento Filtros (Checkbox y Buscador)
        document.getElementById('search-input').addEventListener('input', () => this.loadDashboard());
        document.getElementById('filter-pending').addEventListener('change', () => this.loadDashboard());

        // Evento Enter en login
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('btn-login').click();
            }
        });
    },

    /**
     * Cargar tareas a dashboard, y filtrar
     */
    loadDashboard() {
        const usuario = Auth.getCurrentUser();
        if (!usuario) return;

        // Según permisos, obtenemos tareas
        let tareas = TaskManager.obtenerTareas();

        // Filtros visuales
        const textoBusqueda = document.getElementById('search-input').value.toLowerCase();
        const soloPendientes = document.getElementById('filter-pending').checked;

        tareas = tareas.filter(t => {
            const coincideTexto = t.titulo.toLowerCase().includes(textoBusqueda);
            const coincideEstado = soloPendientes ? t.estado === 'Pendiente' : true;
            return coincideTexto && coincideEstado;
        });

        // Renderizado de tareas en el DOM
        DOM.renderTasks(tareas);
    },

    handleCreateTask() {
        const usuario = Auth.getCurrentUser();
        const titulo = document.getElementById('task-title').value;
        const fecha = document.getElementById('task-date').value;
        const asignadoA = document.getElementById('task-user').value;

        // Asignación según rol, Admin usa select, si no, autoasignación
        const idUsuarioAsignado = (usuario.rol === 'Administrador' && asignadoA)
            ? parseInt(asignadoA)
            : usuario.id_usuario;

        const nuevaTarea = {
            titulo: titulo,
            fecha_creacion: Utils.obtenerFechaHoy(),
            fecha_vencimiento: fecha,
            id_usuario_asignado: idUsuarioAsignado,
            estado: 'Pendiente'
        };

        const resultado = TaskManager.crearTarea(nuevaTarea);

        if (resultado.success) {
            this.loadDashboard(); // Recargar lista
            document.getElementById('task-form').reset(); // Limpiar form
            DOM.showNotification('Tarea creada exitosamente', 'success');
        } else {
            DOM.showNotification('Error: ' + resultado.error, 'error');
        }
    },

    // Métodos onclick del HTML
    handleToggle(id) {
        if (DOM.confirm('¿Cambiar el estado de esta tarea?')) {
            const exito = TaskManager.toggleEstado(id);
            if (exito) {
                this.loadDashboard();
                DOM.showNotification('Estado de tarea actualizado', 'success', 2000);
            } else {
                DOM.showNotification('No tienes permiso para modificar esta tarea', 'error');
            }
        }
    },

    handleDelete(id) {
        if (DOM.confirm('¿Estás seguro de eliminar esta tarea? Esta acción no se puede deshacer.')) {
            const exito = TaskManager.eliminarTarea(id);
            if (exito) {
                this.loadDashboard();
                DOM.showNotification('Tarea eliminada correctamente', 'success', 2000);
            } else {
                DOM.showNotification('No tienes permiso para eliminar esta tarea', 'error');
            }
        }
    }
};

// main globalmente
window.Main = Main;

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Main.init());
} else {
    Main.init();
}