import { AppDataSource } from "../config/configDB.js";
import { ExamenPractico } from "../entities/examen.entity.js";
import { Clase } from "../entities/clase.entity.js";
import { User } from "../entities/user.entity.js";

const MIN_CLASES_PRACTICAS = 5;

export async function programarExamenService(data) {
  const { alumnoId, instructorId, vehiculoId, fechaHoraInicio, fechaHoraFin } = data;

  // Validar campos obligatorios
  if (!alumnoId) throw new Error("El ID del alumno es obligatorio.");
  if (!instructorId) throw new Error("El ID del instructor es obligatorio.");
  if (!vehiculoId) throw new Error("El vehículo asignado es obligatorio.");
  if (!fechaHoraInicio) throw new Error("La fecha y hora de inicio son obligatorias.");
  if (!fechaHoraFin) throw new Error("La fecha y hora de término son obligatorias.");

  const inicio = new Date(fechaHoraInicio);
  const fin = new Date(fechaHoraFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    throw new Error("Formato de fecha inválido.");
  }
  if (inicio >= fin) {
    throw new Error("La fecha/hora de inicio debe ser anterior a la de término.");
  }

  const userRepo = AppDataSource.getRepository(User);
  const claseRepo = AppDataSource.getRepository(Clase);
  const examenRepo = AppDataSource.getRepository(ExamenPractico);

  const alumno = await userRepo.findOne({ where: { id: parseInt(alumnoId) } });
  if (!alumno) throw new Error(`No existe un usuario con ID ${alumnoId}.`);

  const instructor = await userRepo.findOne({ where: { id: parseInt(instructorId) } });
  if (!instructor) throw new Error(`No existe un usuario con ID ${instructorId}.`);

  // Verificación de clases prácticas completadas
  const clasesCompletadas = await claseRepo
    .createQueryBuilder("clase")
    .innerJoin("clase.alumnos", "alumno", "alumno.id = :alumnoId", { alumnoId: parseInt(alumnoId) })
    .where("LOWER(clase.tipo) = :tipo", { tipo: "práctica" })
    .andWhere("clase.fechaHoraFin <= NOW()")
    .getCount();

  if (clasesCompletadas < MIN_CLASES_PRACTICAS) {
    throw new Error(
      `El alumno no ha completado el mínimo requerido de clases prácticas. ` +
      `Completadas: ${clasesCompletadas} / ${MIN_CLASES_PRACTICAS}.`
    );
  }

  // Verificar disponibilidad del vehículo en tabla clases
  const traslapeClase = await claseRepo
    .createQueryBuilder("clase")
    .where("clase.vehiculoId = :vehiculoId", { vehiculoId })
    .andWhere("LOWER(clase.tipo) = :tipo", { tipo: "práctica" })
    .andWhere("clase.fechaHoraInicio < :fin", { fin })
    .andWhere("clase.fechaHoraFin   > :inicio", { inicio })
    .getOne();

  if (traslapeClase) {
    throw new Error(
      `El vehículo "${vehiculoId}" ya está asignado a una clase práctica en ese horario ` +
      `(${traslapeClase.fechaHoraInicio.toLocaleString()} - ${traslapeClase.fechaHoraFin.toLocaleString()}).`
    );
  }

  // Verificar disponibilidad del vehículo en tabla examenes_practicos
  const traslapeExamen = await examenRepo
    .createQueryBuilder("examen")
    .where("examen.vehiculoId = :vehiculoId", { vehiculoId })
    .andWhere("examen.fechaHoraInicio < :fin", { fin })
    .andWhere("examen.fechaHoraFin   > :inicio", { inicio })
    .getOne();

  if (traslapeExamen) {
    throw new Error(
      `El vehículo "${vehiculoId}" ya está reservado para otro examen práctico en ese horario ` +
      `(${traslapeExamen.fechaHoraInicio.toLocaleString()} - ${traslapeExamen.fechaHoraFin.toLocaleString()}).`
    );
  }

  // Crear y guardar el examen con estado inicial "Pendiente"
  const nuevoExamen = examenRepo.create({
    vehiculoId,
    fechaHoraInicio: inicio,
    fechaHoraFin: fin,
    estado: "pendiente",
    alumno,
    instructor,
  });

  const examenGuardado = await examenRepo.save(nuevoExamen);

  console.log(`
[NOTIFICACIÓN AUTOMÁTICA — EXAMEN AGENDADO]
  Alumno:      ${alumno.email} (ID: ${alumno.id})
  Instructor:  ${instructor.email} (ID: ${instructor.id})
  Examen ID:   ${examenGuardado.id}
  Vehículo:    ${vehiculoId}
  Inicio:      ${inicio.toLocaleString()}
  Término:     ${fin.toLocaleString()}

  El examen ha sido registrado en el calendario institucional
  con estado "Pendiente". Ambas partes han sido notificadas.
`);

  return examenGuardado;
}

export async function registrarResultadoService(id, resultado, observaciones) {
  const RESULTADOS_VALIDOS = ["aprobado", "reprobado"];

  // Validar que el resultado sea obligatorio y tenga un valor permitido
  if (!resultado) {
    throw new Error("El campo 'resultado' es obligatorio.");
  }
  if (!RESULTADOS_VALIDOS.includes(resultado)) {
    throw new Error(
      `El resultado debe ser "aprobado" o "reprobado". Valor recibido: "${resultado}".`
    );
  }

  const examenRepo = AppDataSource.getRepository(ExamenPractico);

  // Buscar el examen por ID
  const examen = await examenRepo.findOne({
    where: { id: parseInt(id) },
    relations: ["alumno", "instructor"],
  });
  if (!examen) throw new Error(`No existe un examen práctico con ID ${id}.`);

  if (examen.estado !== "pendiente") {
    throw new Error(
      `El examen con ID ${id} ya fue calificado con resultado "${examen.estado}". No se puede modificar.`
    );
  }

  // Actualizar resultado y observaciones en el historial académico
  examen.estado = resultado;
  examen.observaciones = observaciones || null;

  const examenActualizado = await examenRepo.save(examen);

  console.log(`
[RESULTADO REGISTRADO — HISTORIAL ACADÉMICO]
  Examen ID:       ${examen.id}
  Alumno:          ${examen.alumno.email} (ID: ${examen.alumno.id})
  Resultado:       ${resultado}
  Observaciones:   ${observaciones || "Sin observaciones"}
`);

  return examenActualizado;
}

// Listar todos los exámenes del sistema
export async function obtenerExamenesService() {
  const examenRepo = AppDataSource.getRepository(ExamenPractico);
  return await examenRepo.find({
    relations: ["alumno", "instructor"],
    order: { fechaHoraInicio: "ASC" },
  });
}

// Historial academico de un alumno especifico
export async function obtenerHistorialAlumnoService(alumnoId) {
  const examenRepo = AppDataSource.getRepository(ExamenPractico);
  const examenes = await examenRepo.find({
    where: { alumno: { id: parseInt(alumnoId) } },
    relations: ["alumno", "instructor"],
    order: { fechaHoraInicio: "ASC" },
  });
  if (examenes.length === 0) {
    throw new Error(`No se encontraron exámenes registrados para el alumno con ID ${alumnoId}.`);
  }
  return examenes;
}
