import { Router } from "express";
import { loginUser, registerUser } from "../controllers/authController";
import {
  loginValidation,
  registerValidation,
} from "../middlewares/authValidation";
import { validation } from "../middlewares/validationMiddleware";

const authRoutes = Router();

authRoutes.post("/login", loginValidation, validation, loginUser);
authRoutes.post("/register", registerValidation, validation, registerUser);

export default authRoutes;

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user using their username or email and password. Returns a JWT token if successful.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *                 description: Username or email of the user.
 *               password:
 *                 type: string
 *                 example: password123
 *                 description: User's password.
 *     responses:
 *       200:
 *         description: Login successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successfully!
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR..."
 *       401:
 *         description: Incorrect username or password.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Login failed due to a server error.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration
 *     description: Registers a new user. Allows roles of "regular" or "admin".
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *                 description: Desired username of the user.
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *                 description: Email of the user.
 *               password:
 *                 type: string
 *                 example: password123
 *                 description: Password for the user account.
 *               role:
 *                 type: string
 *                 example: regular
 *                 description: Role of the user (default is "regular").
 *     responses:
 *       201:
 *         description: Register successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Register successfully!
 *       400:
 *         description: Username or email already exists, or invalid role provided.
 *       500:
 *         description: An unexpected error occurred.
 */
