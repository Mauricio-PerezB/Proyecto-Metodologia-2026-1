# Sistema de Gestión de Escuela de Conducción

Bienvenido al repositorio del **Sistema de Gestión de Escuela de Conducción**. Esta es una plataforma web integral desarrollada para digitalizar y facilitar la administración, el control de usuarios, las clases de manejo y las evaluaciones.

## Módulos Principales del Proyecto

- **Módulo de Preinscripción y Ventas:** 
  - Formulario público donde los postulantes ingresan sus datos personales, eligen un plan de contratación y suben su comprobante de pago.
  - Generación de lista de espera para validación administrativa.
- **Panel de Secretaría:** 
  - Gestión de solicitudes pendientes (aceptar o rechazar pagos).
  - Asignación de roles oficiales (Alumno) tras la validación exitosa.
  - Envío automatizado de correos de aceptación o rechazo.
- **Gestión de Vehículos:** 
  - Control del estado de la flota de la escuela, incluyendo registros de mantenimiento.
- **Clases Teóricas y Prácticas:** 
  - Visualización y programación de clases.
  - Historial de clases para alumnos (futuras y pasadas).
- **Evaluaciones y Calificaciones:** 
  - Registro de exámenes prácticos, psicotécnicos y test teóricos.
  - Visualización del rendimiento del alumno.

## Arquitectura y Tecnologías del Código

El proyecto está dividido en dos partes principales, siguiendo una arquitectura Cliente-Servidor:

### Frontend (`/frontend`)
Aplicación de una sola página (SPA) responsiva y moderna.
- **React + Vite:** Para una carga y desarrollo rápido.
- **Tailwind CSS & DaisyUI:** Para un diseño consistente y componentes pre-diseñados (botones, sidebars, modales).
- **React Router:** Para la navegación (vistas de Login, Home, Paneles de Secretaría, etc.).
- **Context API & Hooks:** Para el manejo del estado global (como la sesión del usuario) y lógica reutilizable (ej. `useVentas`, `useContratarPlan`).

### Backend (`/backend`)
API REST robusta y segura.
- **Node.js & Express:** Frameworks para el servidor.
- **TypeORM:** Mapeo objeto-relacional (ORM) para manejar la base de datos mediante entidades (ej. `alumno.entity.js`, `preregistro.entity.js`).
- **Controladores y Servicios:** Lógica de negocio encapsulada. Cada entidad tiene su ruta, controlador y servicio dedicado.
- **Nodemailer:** Integrado en `email.service.js` para el manejo de notificaciones por correo.

## Colaboradores
Agradecimientos al equipo de desarrolladores que han hecho posible este proyecto:

- Mauricio-PerezB
- angelclaveria
- Gabriel Garcia
- angelitoouu
- 7ouzz-coder
