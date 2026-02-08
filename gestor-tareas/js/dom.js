/**
 * dom.js - Manipulación del DOM, renderizar HTML, mostrar/ocultar vistas y actualizar estilos
 */
const DOM = {
    // Elementos clave del DOM, referencias
    elements: {
        loginView: document.getElementById('login-view'),
        dashboardView: document.getElementById('dashboard-view'),
        tasksContainer: document.getElementById('tasks-container'),
        loginError: document.getElementById('login-error'),
        userDisplay: document.getElementById('user-display'),
        userSelect: document.getElementById('task-user') // Para asignar tareas
    },

    /**
     * Cambio entre login y Dashboard
     * @param {Object|null} usuario - Usuario logueado o null
     */
    updateUI(usuario) {
        if (usuario) {
            this.elements.loginView.classList.add('hidden');
            this.elements.dashboardView.classList.remove('hidden');
            this.elements.userDisplay.innerHTML = `
                ${usuario.nombre_usuario}
                <span class="user-badge">${usuario.rol}</span>
            `;

            // Siendo admin, llenaremos select de usuarios para asignar tareas
            if (usuario.rol === 'Administrador') {
                this.renderUserSelect();
            } else {
                this.elements.userSelect.innerHTML = '<option value="">Se te asignará a ti</option>';
                this.elements.userSelect.disabled = true;
            }
        } else {
            this.elements.loginView.classList.remove('hidden');
            this.elements.dashboardView.classList.add('hidden');
            this.hideLoginError();
        }
    },

    /**
     *  Renderizar tareas en el dashboard
     * @param {Array} tareas 
     */
    renderTasks(tareas) {
        this.elements.tasksContainer.innerHTML = ''; // Limpiar lista

        if (tareas.length === 0) {
            this.elements.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <div class="empty-state-text">No hay tareas para mostrar</div>
                </div>
            `;
            return;
        }

        tareas.forEach(tarea => {
            // Utils para calcular estados visuales
            const esVencida = Utils.esFechaVencida(tarea.fecha_vencimiento) && tarea.estado === 'Pendiente';
            const diasRestantes = Utils.calcularDiasRestantes(tarea.fecha_vencimiento);
            const fechaFormateada = Utils.formatearFecha(tarea.fecha_vencimiento, 'relativo');
            const fechaCorta = Utils.formatearFecha(tarea.fecha_vencimiento, 'corto');

            // Determinar clases CSS y badge
            let cssClass = 'task-item';
            let badgeClass = 'task-badge';
            let badgeText = tarea.estado;

            if (tarea.estado === 'Completada') {
                cssClass += ' task-completed';
                badgeClass += ' badge-completada';
            } else if (esVencida) {
                cssClass += ' task-vencida';
                badgeClass += ' badge-vencida';
                badgeText = 'VENCIDA';
            } else if (diasRestantes <= 2 && diasRestantes >= 0) {
                cssClass += ' task-urgente';
                badgeClass += ' badge-urgente';
                badgeText = 'URGENTE';
            } else {
                badgeClass += ' badge-pendiente';
            }

            // Crear el HTML de la tarea
            const div = document.createElement('div');
            div.className = cssClass;
            div.innerHTML = `
                <div class="task-content">
                    <div class="task-title">${Utils.escaparHTML(tarea.titulo)}</div>
                    <div class="task-meta">
                        <span class="task-meta-item">
                            <strong>Vencimiento:</strong> ${fechaFormateada}
                        </span>
                        <span class="task-meta-item">
                            <strong>Fecha:</strong> ${fechaCorta}
                        </span>
                        <span class="${badgeClass}">${badgeText}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-small ${tarea.estado === 'Completada' ? 'btn-secondary' : 'btn-success'}" 
                            onclick="Main.handleToggle(${tarea.id_tarea})"
                            title="${tarea.estado === 'Completada' ? 'Marcar como pendiente' : 'Marcar como completada'}">
                        ${tarea.estado === 'Completada' ? 'Reabrir' : 'Completar'}
                    </button>
                    <button class="btn btn-small btn-danger" 
                            onclick="Main.handleDelete(${tarea.id_tarea})"
                            title="Eliminar tarea">
                        Eliminar
                    </button>
                </div>
            `;
            this.elements.tasksContainer.appendChild(div);
        });
    },

    /**
     * Llena el select de usuarios, para admin
     */
    renderUserSelect() {
        const users = Storage.getUsuarios();
        let html = '<option value="">-- Seleccionar Usuario --</option>';
        users.forEach(u => {
            html += `<option value="${u.id_usuario}">${u.nombre_usuario} (${u.rol})</option>`;
        });
        this.elements.userSelect.innerHTML = html;
        this.elements.userSelect.disabled = false;
    },

    /**
     * Muestra error de login (inline)
     */
    showLoginError(msg) {
        this.elements.loginError.innerHTML = `
            <div class="alert alert-error">
                ${msg}
            </div>
        `;
        this.elements.loginError.style.display = 'block';
    },

    /**
     * Oculta el error de login
     */
    hideLoginError() {
        this.elements.loginError.style.display = 'none';
        this.elements.loginError.innerHTML = '';
    },

    /**
     * Sistema de notificaciones flotantes (reemplaza alert())
     * @param {String} mensaje - Texto a mostrar
     * @param {String} tipo - 'success' | 'error' | 'warning' | 'info'
     * @param {Number} duracion - Milisegundos antes de auto-cerrar (0 = no auto-cerrar)
     */
    showNotification(mensaje, tipo = 'info', duracion = 3000) {
        // Crear contenedor si no existe
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            document.body.appendChild(container);
        }

        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${tipo}`;

        // Iconos según tipo
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <strong>${icons[tipo] || ''}</strong> ${Utils.escaparHTML(mensaje)}
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(notification);

        // Auto-cerrar después de X segundos
        if (duracion > 0) {
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, duracion);
        }
    },

    /**
     * Muestra un mensaje de confirmación personalizado
     * @param {String} mensaje 
     * @returns {Boolean}
     */
    confirm(mensaje) {
        // Por ahora usa confirm() nativo
        // En producción podrías crear un modal personalizado
        return window.confirm(mensaje);
    },

    /**
     * Muestra indicador de carga
     */
    showLoading() {
        this.elements.tasksContainer.innerHTML = '<div class="spinner"></div>';
    }
};

window.DOM = DOM;