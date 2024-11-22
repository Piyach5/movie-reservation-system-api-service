import { Router } from "express";
import { login, register } from "../controllers/authController";

const authRoutes: Record<string, any> = Router();

authRoutes.post("/login", login);
authRoutes.post("/register", register);

export default authRoutes;
