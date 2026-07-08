import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  registerAlumno,
  listAlumnos,
  findAlumno,
  registerTest,
  registerExamen,
  promoteToEgresado,
  downloadCertificate,
} from "../controllers/alumno.controller.js";

const router = Router();

// Rutas Administrativas (Protegidas por JWT)
router.post("/", authMiddleware, registerAlumno);
router.get("/", authMiddleware, listAlumnos);
router.get("/:id", authMiddleware, findAlumno);
router.post("/:id/tests", authMiddleware, registerTest);
router.post("/:id/examenes", authMiddleware, registerExamen);
router.put("/:id/egresar", authMiddleware, promoteToEgresado);

// Ruta Pública para descargar el certificado (Una vez el alumno haya egresado con éxito)
router.get("/:id/certificado/descargar", downloadCertificate);

export default router;
