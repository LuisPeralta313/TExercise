-- ==========================================
--   CREACIÓN DE LA BASE DE DATOS
-- ==========================================
CREATE DATABASE GestorTareasDB;
USE GestorTareasDB;

-- ==========================================
-- Estructura DDL - MySql Server--
--Intento validar Tamaños correctos de datos--
-- ==========================================

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL, --no dejaría esto como texto plano en producción
    rol VARCHAR(20) NOT NULL,
    
    -- Restricción para validar el Rol
    CONSTRAINT chk_rol_valido CHECK (rol IN ('Administrador', 'Usuario Normal'))
);

-- Tabla de Tareas
CREATE TABLE Tareas (
    id_tarea INT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    fecha_creacion DATE NOT NULL DEFAULT GETDATE(), 
    fecha_vencimiento DATE NOT NULL,
    id_usuario_asignado INT,

    -- Llave Foránea
    CONSTRAINT fk_usuario
        FOREIGN KEY (id_usuario_asignado) 
        REFERENCES Usuarios(id_usuario)
        ON DELETE SET NULL,

    -- Restricción para el Estado
    CONSTRAINT chk_estado_valido CHECK (estado IN ('Pendiente', 'Completada')),

    -- Restricción sobre la Integridad: Vencimiento no puede ser antes que creación
    CONSTRAINT chk_fechas_validas CHECK (fecha_vencimiento >= fecha_creacion)
);

-- ==========================================
-- Inserts de Prueba----
-- ==========================================

-- Usuarios
INSERT INTO Usuarios (nombre_usuario, contrasena, rol) VALUES 
('Admin_Senior', 'admin123', 'Administrador'),
('Dev_Junior', 'hola123', 'Usuario Normal'),
('QA_Tester', 'test123', 'Usuario Normal');

-- Tareas
-- ==========================================
-- INSERCIÓN DE TAREAS (Fechas explícitas)
-- ==========================================

INSERT INTO Tareas (titulo, estado, fecha_creacion, fecha_vencimiento, id_usuario_asignado) VALUES 
-- Tarea completada - pasada
('Configurar Servidor', 'Completada', '2026-01-15', '2026-01-20', 1),

-- Vencida hace días
('Diseñar Frontend', 'Pendiente', '2026-01-20', '2026-02-01', 2),

-- Vence en 3 días
('Arreglar API Rest','Pendiente', '2026-02-05', '2026-02-10', 2),

-- Atrasada
('Pruebas Unitarias', 'Pendiente', '2026-01-10', '2026-01-25', 3),

-- Vence en 2 semanas
('Documentación Final', 'Pendiente', '2026-02-06', '2026-02-20', 1);

-- ==========================================
--        Consultas-DML    ---
-- ==========================================

-- Listado, Orden por vencimiento
SELECT * FROM Tareas 
ORDER BY fecha_vencimiento ASC;

--Conteo de tareas pendientes y completadas, agrupación por usuario
SELECT 
    u.nombre_usuario,
    t.estado,
    COUNT(t.id_tarea) AS total_tareas
FROM Tareas t
JOIN Usuarios u ON t.id_usuario_asignado = u.id_usuario
GROUP BY u.nombre_usuario, t.estado
ORDER BY u.nombre_usuario;

-- Tareas atrasadas
SELECT * FROM Tareas 
WHERE estado = 'Pendiente' 
AND fecha_vencimiento < GETDATE();

