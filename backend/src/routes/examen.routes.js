import { Router } from "express";
import {
  programarExamenController,
  registrarResultadoController,
  obtenerExamenesController,
  obtenerHistorialAlumnoController,
} from "../controllers/examen.controller.js";

const router = Router();

router.post("/", programarExamenController);
router.put("/:id/resultado", registrarResultadoController);
router.get("/historial/:alumnoId", obtenerHistorialAlumnoController);
router.get("/", obtenerExamenesController);

export default router;
