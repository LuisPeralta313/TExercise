# TExercise
Sistema de gestión de tareas con Vanilla JS y diseño SQL relacional
--Patrón Modular con separación de responsabilidades--
Requirimientos: 
Visual Studio Code ---> Live Server

Estructura del Proyecto: 

proyecto/
├── index.html                    # Página principal
├── gestor-tareas/
│   ├── css/
│   │   └── styles.css           # Estilos --> Mobile First
│   ├── js/
│   │   ├── storage.js           # Capa de  localStorage (persistencia) 
│   │   ├── utils.js             # Funciones auxiliares  (Reglas)
│   │   ├── auth.js              # Sistema de autenticación
│   │   ├── tasks.js             # Lógica de negocio de tareas
│   │   ├── dom.js               # Manipulación del Dom
│   │   └── main.js              # Inicialización y eventos 
│   └── EsquemaSQL.sql           # Diseño de base de datos ---> Mysql server
└── README.md


Funcionalidades por Rol
Administrador

* Ver todas las tareas del sistema
* Crear tareas y asignarlas a cualquier usuario
* Modificar y eliminar cualquier tarea
* Acceso total al sistema

Usuario Normal

* Ver solo sus tareas asignadas
* Crear tareas (autoasignadas)
* Modificar y eliminar solo sus propias tareas
--> No puede ver tareas de otros usuarios


Responsive Design
El sistema es Mobile First y se adapta a:

Móviles (< 768px): Layout vertical, botones full-width
Tablets (768px - 1024px): Layout horizontal, grid 2 columnas
Desktop (> 1024px): Layout optimizado, grid 3 columnas


Seguridad
Implementadas:

-> Validación de permisos por rol
-> Escape de HTML para prevenir XSS
-> Validación de inputs en frontend

Pendientes- Tema de producción:

 Hashing de contraseñas ->bcrypt
 Autenticación JWT -> evitando sesiones
 Validación backend
 HTTPS


