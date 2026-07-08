import { Router } from "express";
import { findUsers } from "../services/user.service.js";
import { AppDataSource } from "../config/configDB.js";
import { Alumno } from "../entities/alumno.entity.js";
import { handleSuccess, handleErrorServer } from "../Handlers/responseHandlers.js";

const router = Router();

router.get("/frontend/getTeacherList", async (req, res) => {
  try {
    const allUsers = await findUsers();
    // Filter users whose role is Docente or Profesor
    const teachers = allUsers.filter(user => {
      const r = (user.role || "").toLowerCase();
      return r.includes("docente") || r.includes("profesor");
    });
    
    // Format to match what frontend expects: [{ id, nombre, email }]
    const formattedTeachers = teachers.map(t => ({
      id: t.id,
      nombre: t.email.split("@")[0],
      email: t.email
    }));

    handleSuccess(res, 200, "Lista de profesores obtenida", formattedTeachers);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener lista de profesores", error.message);
  }
});

// RF1/RF2: Obtener lista de alumnos activos para asignación a clases
router.get("/frontend/getStudentList", async (req, res) => {
  try {
    // 1. Alumnos de la tabla Alumno (pre-registros, estado Activo)
    const alumnoRepository = AppDataSource.getRepository(Alumno);
    const alumnos = await alumnoRepository.find();
    const alumnosActivos = alumnos
      .filter(a => (a.estado || "").toLowerCase() === "activo")
      .map(a => ({
        id: a.id,
        nombre: a.nombre,
        email: a.email,
        estado: a.estado,
      }));

    // 2. Usuarios con role "estudiante" de la tabla User
    const allUsers = await findUsers();
    const estudiantesUser = allUsers
      .filter(u => (u.role || "").toLowerCase() === "estudiante")
      .map(u => ({
        id: u.id,
        nombre: u.email.split("@")[0],
        email: u.email,
        estado: "Activo",
      }));

    // 3. Combinar, priorizando Alumno y eliminando duplicados por email
    const emailsAlumnos = new Set(alumnosActivos.map(a => a.email));
    const estudiantesUnicos = estudiantesUser.filter(u => !emailsAlumnos.has(u.email));
    const listaFinal = [...alumnosActivos, ...estudiantesUnicos];

    handleSuccess(res, 200, "Lista de alumnos activos obtenida", listaFinal);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener lista de alumnos", error.message);
  }
});

export default router;
