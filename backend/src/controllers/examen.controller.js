import {
  programarExamenService,
  registrarResultadoService,
  obtenerExamenesService,
  obtenerHistorialAlumnoService,
} from "../services/examen.service.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHandlers.js";

// Palabras clave que indican un error de validación (400) y no un error de servidor (500)
const CLIENT_ERROR_KEYWORDS = [
  "obligatorio",
  "obligatorias",
  "inválido",
  "anterior",
  "no existe",
  "no se encontraron",
  "no ha completado",
  "ya está asignado",
  "ya está reservado",
  "ya fue calificado",
  "debe ser",
];

function isClientError(message) {
  const lowerMsg = message.toLowerCase();
  return CLIENT_ERROR_KEYWORDS.some((kw) => lowerMsg.includes(kw.toLowerCase()));
}

export async function programarExamenController(req, res) {
  try {
    const examen = await programarExamenService(req.body);
    handleSuccess(res, 201, "Examen práctico programado y registrado exitosamente.", examen);
  } catch (error) {
    if (isClientError(error.message)) {
      handleErrorClient(res, 400, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno al programar el examen.", error.message);
    }
  }
}

export async function registrarResultadoController(req, res) {
  try {
    const { id } = req.params;
    const { resultado, observaciones } = req.body;
    const examen = await registrarResultadoService(id, resultado, observaciones);
    handleSuccess(res, 200, "Resultado del examen registrado en el historial académico.", examen);
  } catch (error) {
    if (isClientError(error.message)) {
      handleErrorClient(res, 400, error.message);
    } else {
      handleErrorServer(res, 500, "Error interno al registrar el resultado.", error.message);
    }
  }
}

export async function obtenerExamenesController(req, res) {
  try {
    const examenes = await obtenerExamenesService();
    handleSuccess(res, 200, "Exámenes obtenidos exitosamente.", examenes);
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener los exámenes.", error.message);
  }
}

export async function obtenerHistorialAlumnoController(req, res) {
  try {
    const { alumnoId } = req.params;
    const historial = await obtenerHistorialAlumnoService(alumnoId);
    handleSuccess(res, 200, "Historial académico obtenido exitosamente.", historial);
  } catch (error) {
    if (isClientError(error.message)) {
      handleErrorClient(res, 404, error.message);
    } else {
      handleErrorServer(res, 500, "Error al obtener el historial académico.", error.message);
    }
  }
}
