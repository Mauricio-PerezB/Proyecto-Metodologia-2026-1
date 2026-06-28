import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  let rol = "estudiante";
  const userRole = (user.role || "").toLowerCase();
  if (userRole.includes("docente") || userRole.includes("profesor")) {
    rol = "profesor";
  } else if (userRole.includes("secretar")) {
    rol = "secretario";
  } else if (userRole.includes("alumno") || userRole.includes("estudiante")) {
    rol = "estudiante";
  } else {
    rol = userRole || "estudiante";
  }

  const nombre = user.email.split("@")[0];

  const payload = { sub: user.id, email: user.email, rol, nombre };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  delete user.password;
  return { user, token };
}
