import { Router } from "express";
import authRoutes from "./auth.routes.js";
import profileRoutes from "./profile.routes.js";
import preRegistroRoutes from "./preregistro.routes.js";
import claseRoutes from "./clase.routes.js";
import userRoutes from "./user.routes.js";

export function routerApi(app) {
  const router = Router();
  app.use("/api", router);

  router.use("/auth", authRoutes);
  router.use("/profile", profileRoutes);
  router.use("/preregistro", preRegistroRoutes);
  router.use("/clases", claseRoutes);
  router.use("/users", userRoutes);
}

