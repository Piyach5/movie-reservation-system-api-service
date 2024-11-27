import { Request, Response } from "express";
import { ApiResponse, Token, User } from "../types";
import { createResponse } from "../utils/responseUtils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/db";
import "dotenv/config";

export const loginUser = async (
  req: Request,
  res: Response<ApiResponse<Token>>
) => {
  try {
    const { username, password }: User = req.body;

    const findUser = await pool.query(
      `SELECT * FROM users WHERE username = $1 OR email = $1`,
      [username]
    );

    if (!findUser.rows.length) {
      res.status(404).json(createResponse(false, "User not found!"));
      return;
    }

    const user: User = findUser.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res
        .status(401)
        .json(createResponse(false, "Incorrect username or password!"));
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      } as User,
      process.env.SECRET_KEY!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    res
      .status(200)
      .json(createResponse(true, "Login successfully!", { token }));
  } catch (err) {
    console.error("Login Error: ", err);
    res.status(500).json(createResponse(false, "Login failed!"));
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role = "regular" }: User = req.body;

    const validRoles = ["regular", "admin"];

    if (!validRoles.includes(role)) {
      res.status(400).json(createResponse(false, "Invalid role!"));
      return;
    }

    const duplicateCheck = await pool.query(
      `SELECT * FROM users WHERE username = $1 OR email = $2`,
      [username, email]
    );

    if (duplicateCheck.rowCount && duplicateCheck.rowCount > 0) {
      res
        .status(400)
        .json(createResponse(false, "Username or email already exists"));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users(username, email, password, role) VALUES($1, $2, $3, $4)`,
      [username, email, hashedPassword, role]
    );

    res.status(201).json(createResponse(true, "Register successfully!"));
  } catch (err) {
    console.error("Register Error: ", err);
    res
      .status(500)
      .json(createResponse(false, "An unexpected error occurred."));
  }
};
