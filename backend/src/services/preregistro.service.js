import { AppDataSource } from "../config/configDB.js";
import { PreRegistro } from "../entities/preregistro.entity.js";
import { User } from "../entities/user.entity.js";
import bcryptjs from "bcryptjs";

export async function crearPreRegistro(data) {
  const repository = AppDataSource.getRepository(PreRegistro);
  const nuevoPreRegistro = repository.create({
    nombreCompleto: data.nombreCompleto,
    rut: data.rut,
    telefono: data.telefono,
    sede: data.sede,
    plan: data.plan,
    comprobantePagoUrl: data.comprobantePagoUrl,
    estado: "pendiente",
  });
  return await repository.save(nuevoPreRegistro);
}

export async function obtenerPreRegistrosPendientes() {
  const repository = AppDataSource.getRepository(PreRegistro);
  return await repository.find({ where: { estado: "pendiente" } });
}

export async function aprobarPreRegistro(id) {
  const preRegistroRepo = AppDataSource.getRepository(PreRegistro);
  const userRepo = AppDataSource.getRepository(User);

  const preRegistro = await preRegistroRepo.findOne({ where: { id } });
  if (!preRegistro) throw new Error("Solicitud no encontrada");
  if (preRegistro.estado !== "pendiente") throw new Error("La solicitud no está pendiente");

  preRegistro.estado = "aceptado";
  await preRegistroRepo.save(preRegistro);

  // Crear usuario Alumno
  const generatedPassword = await bcryptjs.hash(preRegistro.rut, 10); // usar rut como pass inicial
  // Email generado para evitar nulos ya que email es unique y requerido
  const email = `${preRegistro.rut.replace(/[^a-zA-Z0-9]/g, "")}@escuela.cl`;

  const newUser = userRepo.create({
    email: email,
    password: generatedPassword,
    role: "Alumno",
    rut: preRegistro.rut,
    phone: preRegistro.telefono,
    campus: preRegistro.sede,
  });

  await userRepo.save(newUser);

  console.log(`[Email Mock] Hola ${preRegistro.nombreCompleto}, tu inscripción ha sido aceptada. Tus credenciales son - Email: ${email}, Clave: (tu rut)`);

  return { message: "Solicitud aprobada y usuario creado", user: newUser };
}

export async function rechazarPreRegistro(id, motivo) {
  const preRegistroRepo = AppDataSource.getRepository(PreRegistro);
  const preRegistro = await preRegistroRepo.findOne({ where: { id } });
  if (!preRegistro) throw new Error("Solicitud no encontrada");
  if (preRegistro.estado !== "pendiente") throw new Error("La solicitud no está pendiente");

  preRegistro.estado = "rechazado";
  await preRegistroRepo.save(preRegistro);

  console.log(`[Email Mock] Hola ${preRegistro.nombreCompleto}, tu inscripción ha sido rechazada. Motivo: ${motivo || "No cumple los requisitos"}.`);

  return { message: "Solicitud rechazada" };
}
