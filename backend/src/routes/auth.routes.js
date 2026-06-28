import { Router } from "express";
import { login, register, getUsers, removeUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", getUsers);
router.delete("/users/:id", removeUser);

export default router;
