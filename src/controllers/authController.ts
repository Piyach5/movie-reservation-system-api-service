import { Application, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/db";

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const findUser = await pool.query(
      `SELECT * FROM users WHERE username = $1 OR email = $1`,
      [username]
    );

    if (!findUser.rows[0]) {
      return res.status(404).json({ message: "User not found!" });
    }

    const user = findUser.rows[0];

    const passwordValidation = await bcrypt.compare(password, user.password);

    if (!passwordValidation) {
      return res.status(401).json({ message: "Invalid Password!" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET_KEY!,
      { expiresIn: "1h" }
    );

    return res.status(201).json({ message: "Login successfully!", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed!" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users(username, email, password) VALUES($1, $2, $3)`,
      [username, email, hashedPassword]
    );
    return res
      .status(201)
      .json({ message: "Register successfully!", data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Register failed!" });
  }
};
